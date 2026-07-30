import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../utils/password.js';
import { generateBookingCode, generateStreamKey, generateInvoiceNumber } from '../utils/bookingCode.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();
const GST_RATE = 0.18;

const createBookingSchema = z.object({
  packageId: z.string().min(1),
  eventType: z.string().min(1),
  eventTitle: z.string().min(1),
  eventDate: z.coerce.date(),
  eventEndDate: z.coerce.date().optional(),
  venue: z.string().min(1),
  city: z.string().min(1),
  expectedGuests: z.number().int().positive().optional(),
  extras: z.array(z.object({ id: z.string(), name: z.string(), price: z.number() })).optional(),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  assignedStaffId: z.string().optional(),
});

async function applyCoupon(code: string, subtotal: number): Promise<{ discount: number; couponCode: string }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) {
    throw new AppError('Invalid coupon code', 400);
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError('Coupon has expired', 400);
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError('Coupon usage limit reached', 400);
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = subtotal * (coupon.discountValue / 100);
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, subtotal);

  await prisma.coupon.update({
    where: { id: coupon.id },
    data: { usedCount: { increment: 1 } },
  });

  return { discount, couponCode: coupon.code };
}

router.post('/', requireAuth, requireRole('CUSTOMER', 'ADMIN'), validate(createBookingSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const body = req.body;

    const pkg = await prisma.package.findUnique({ where: { id: body.packageId } });
    if (!pkg || !pkg.isActive) {
      throw new AppError('Package not found', 404);
    }

    let customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      customer = await prisma.customer.create({ data: { userId } });
    }

    let subtotal = pkg.price;
    if (body.extras?.length) {
      subtotal += body.extras.reduce((sum: number, e: { price: number }) => sum + e.price, 0);
    }

    let discountAmount = 0;
    let couponCode: string | undefined;
    if (body.couponCode) {
      const result = await applyCoupon(body.couponCode, subtotal);
      discountAmount = result.discount;
      couponCode = result.couponCode;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * GST_RATE;
    const totalAmount = taxableAmount + taxAmount;
    const bookingCode = await generateBookingCode();
    const streamPassword = Math.random().toString(36).slice(2, 10);
    const streamKey = generateStreamKey();

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        userId,
        customerId: customer.id,
        packageId: pkg.id,
        eventType: body.eventType,
        eventTitle: body.eventTitle,
        eventDate: body.eventDate,
        eventEndDate: body.eventEndDate,
        venue: body.venue,
        city: body.city,
        expectedGuests: body.expectedGuests ?? 100,
        extras: body.extras ? JSON.stringify(body.extras) : null,
        notes: body.notes,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        couponCode,
        streamPassword,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        invoice: {
          create: {
            invoiceNumber: generateInvoiceNumber(),
            customerId: customer.id,
            amount: taxableAmount,
            taxAmount,
            totalAmount,
            status: 'DRAFT',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        payments: {
          create: {
            amount: totalAmount,
            currency: 'INR',
            status: 'PENDING',
            provider: 'razorpay',
          },
        },
        liveEvent: {
          create: {
            title: body.eventTitle,
            streamKey,
            passwordHash: await hashPassword(streamPassword),
            embedUrl: `https://player.example.com/live/${streamKey}`,
          },
        },
      },
      include: {
        package: true,
        invoice: true,
        payments: true,
        liveEvent: true,
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'STAFF' || req.user!.role === 'SUPER_ADMIN';
    const bookings = await prisma.booking.findMany({
      where: isAdmin ? {} : { userId: req.user!.userId },
      include: {
        package: true,
        invoice: true,
        liveEvent: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: param(req.params.id) },
      include: {
        package: true,
        invoice: true,
        payments: true,
        liveEvent: true,
        chatMessages: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'STAFF' || req.user!.role === 'SUPER_ADMIN';
    if (!isAdmin && booking.userId !== req.user!.userId) {
      throw new AppError('Access denied', 403);
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', requireAuth, requireRole('ADMIN', 'STAFF'), validate(updateStatusSchema), async (req, res, next) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: param(req.params.id) },
      data: req.body,
      include: { package: true },
    });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

export default router;
