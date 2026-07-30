import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { param } from '../utils/params.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'STAFF', 'SUPER_ADMIN'));

function monthWindow(months = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const buckets = Array.from({ length: months }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return {
      key,
      month: date.toLocaleString('en', { month: 'short' }),
      revenue: 0,
      bookings: 0,
    };
  });
  return { start, buckets };
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

router.get('/dashboard', async (_req, res, next) => {
  try {
    const { start, buckets } = monthWindow(6);
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));
    const [
      totalUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      paidBookingRevenue,
      paidPayments,
      monthlyBookings,
      totalStreams,
      liveStreams,
      streamViewers,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.payment.findMany({
        where: { status: 'PAID', createdAt: { gte: start } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.booking.findMany({
        where: { eventDate: { gte: start } },
        select: { eventDate: true, totalAmount: true, paymentStatus: true },
        orderBy: { eventDate: 'asc' },
      }),
      prisma.stream.count(),
      prisma.stream.count({ where: { status: 'LIVE' } }),
      prisma.stream.aggregate({ _sum: { currentViewers: true, peakViewers: true } }),
      prisma.booking.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { package: true, user: { select: { name: true, email: true } } },
      }),
    ]);

    const usePaymentsForRevenue = paidPayments.length > 0;

    for (const booking of monthlyBookings) {
      const bucket = bucketMap.get(monthKey(booking.eventDate));
      if (!bucket) continue;
      bucket.bookings += 1;
      if (!usePaymentsForRevenue && booking.paymentStatus === 'PAID') bucket.revenue += booking.totalAmount;
    }

    const paymentRevenue = paidPayments.reduce((sum, payment) => {
      const bucket = bucketMap.get(monthKey(payment.createdAt));
      if (bucket) bucket.revenue += payment.amount;
      return sum + payment.amount;
    }, 0);

    const totalPaidBookingRevenue = paidBookingRevenue._sum.totalAmount ?? 0;
    const totalRevenue = paymentRevenue > 0 ? paymentRevenue : totalPaidBookingRevenue;

    res.json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          bookings: totalBookings,
          pendingBookings,
          confirmedBookings,
          streams: totalStreams,
          liveStreams,
          currentViewers: streamViewers._sum.currentViewers ?? 0,
          peakViewers: streamViewers._sum.peakViewers ?? 0,
        },
        revenue: totalRevenue,
        charts: {
          revenue: buckets.map(({ month, revenue }) => ({ month, revenue })),
          bookings: buckets.map(({ month, bookings }) => ({ month, bookings })),
        },
        recentBookings: recentBookings.map((booking) => ({
          id: booking.id,
          bookingCode: booking.bookingCode,
          eventTitle: booking.eventTitle,
          eventDate: booking.eventDate,
          totalAmount: booking.totalAmount,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          packageName: booking.package.name,
          user: booking.user,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const role = req.query.role as string | undefined;
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.get('/notifications', async (req, res, next) => {
  try {
    const userId = (req.query.userId as string) || req.user!.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
});

router.patch('/notifications/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: param(req.params.id) },
      data: { isRead: true },
    });
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
});

router.get('/payments', async (_req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            bookingCode: true,
            eventTitle: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
});

router.get('/blogs', async (_req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });
    res.json({ success: true, data: blogs });
  } catch (err) {
    next(err);
  }
});

export default router;
