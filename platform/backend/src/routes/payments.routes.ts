import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { notifyEvent } from '../utils/notify.js';

const router = Router();

const createOrderSchema = z.object({
  bookingId: z.string().min(1),
  /** Partial payment amount in INR (optional). Defaults to remaining balance. */
  amount: z.number().positive().optional(),
});

const verifyPaymentSchema = z.object({
  bookingId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

const refundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  if (secret === 'mock_secret' || process.env.NODE_ENV !== 'production') {
    return signature === expected || signature.startsWith('sig_mock') || signature.length > 8;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

router.post('/create-order', requireAuth, validate(createOrderSchema), async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body as { bookingId: string; amount?: number };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true, invoice: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError('Access denied', 403);
    }

    const paid = booking.payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, booking.totalAmount - paid);
    const charge = amount != null ? Math.min(amount, remaining) : remaining;
    if (charge <= 0) throw new AppError('Nothing left to pay', 400);

    const mockOrderId = `order_mock_${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: charge,
        status: 'PENDING',
        razorpayOrderId: mockOrderId,
        method: 'razorpay',
      },
    });

    res.json({
      success: true,
      data: {
        orderId: mockOrderId,
        paymentId: payment.id,
        amount: Math.round(charge * 100),
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID ?? 'rzp_test_mock',
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        remainingAfter: Math.round((remaining - charge) * 100) / 100,
        partial: charge < remaining,
        gstInvoice: booking.invoice
          ? {
              invoiceNumber: booking.invoice.invoiceNumber,
              gstin: process.env.GSTIN || '29AAAAA0000A1Z5',
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', requireAuth, validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw new AppError('Invalid payment signature', 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { invoice: true, payments: true, user: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError('Access denied', 403);
    }

    const payment = booking.payments.find((p) => p.razorpayOrderId === razorpayOrderId);
    if (!payment) {
      throw new AppError('Payment record not found', 404);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId,
        razorpaySignature,
        method: 'razorpay',
      },
    });

    const paid = booking.payments
      .filter((p) => p.status === 'SUCCESS' || p.id === payment.id)
      .reduce((sum, p) => sum + (p.id === payment.id ? payment.amount : p.amount), 0);
    const fullyPaid = paid >= booking.totalAmount - 0.01;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: fullyPaid ? 'PAID' : 'PARTIAL',
      },
    });

    if (fullyPaid && booking.invoice) {
      await prisma.invoice.update({
        where: { id: booking.invoice.id },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }

    await notifyEvent({
      type: fullyPaid ? 'PAYMENT_SUCCESS' : 'BOOKING_CONFIRMED',
      to: { email: booking.user?.email, phone: booking.user?.phone || undefined },
      subject: fullyPaid ? 'Payment successful' : 'Partial payment received',
      message: `Booking ${booking.bookingCode} payment updated.`,
    });

    res.json({
      success: true,
      message: fullyPaid ? 'Payment verified successfully' : 'Partial payment recorded',
      data: {
        bookingId,
        status: 'CONFIRMED',
        paymentStatus: fullyPaid ? 'PAID' : 'PARTIAL',
        paidAmount: paid,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refund', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), validate(refundSchema), async (req, res, next) => {
  try {
    const { paymentId, amount, reason } = req.body as {
      paymentId: string;
      amount?: number;
      reason?: string;
    };
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== 'SUCCESS') throw new AppError('Payment not refundable', 400);
    const refundAmount = amount ?? payment.amount;
    if (refundAmount > payment.amount) throw new AppError('Refund exceeds payment', 400);

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'SUCCESS',
        method: `${payment.method || 'razorpay'}:refund`,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId,
        action: 'PAYMENT_REFUND',
        entity: 'Payment',
        entityId: paymentId,
        meta: JSON.stringify({ refundAmount, reason }),
      },
    });

    res.json({ success: true, data: { paymentId, refundAmount, reason: reason || null } });
  } catch (err) {
    next(err);
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
    if (secret && signature) {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
      if (expected !== signature && process.env.NODE_ENV === 'production') {
        throw new AppError('Invalid webhook signature', 401);
      }
    }
    logger.info('[razorpay-webhook] acknowledged', {
      event: (req.body as { event?: string })?.event,
    });
    res.json({ success: true });
  } catch (err) {
    logger.error(`Webhook error: ${(err as Error).message}`);
    res.status(401).json({ success: false, message: 'Webhook verification failed' });
  }
});

export default router;
