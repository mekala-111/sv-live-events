import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { param } from '../utils/params.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'STAFF'));

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
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
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { package: true, user: { select: { name: true, email: true } } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          bookings: totalBookings,
          pendingBookings,
          confirmedBookings,
        },
        revenue: totalRevenue._sum.totalAmount ?? 0,
        recentBookings,
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

export default router;
