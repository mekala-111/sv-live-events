import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { evaluateAutoscaling } from '../services/cluster.js';

const router = Router();

router.get('/executive', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (_req, res, next) => {
  try {
    const [payments, tenants, streams, bookings, gifts, nodes] = await Promise.all([
      prisma.payment.findMany({ where: { status: 'SUCCESS' }, select: { amount: true, createdAt: true } }),
      prisma.tenant.findMany({ include: { plan: true } }),
      prisma.stream.findMany({ select: { totalJoins: true, peakViewers: true, status: true } }),
      prisma.booking.findMany({ select: { totalAmount: true, status: true, createdAt: true } }),
      prisma.virtualGift.findMany({ select: { amountInr: true } }),
      prisma.mediaNode.findMany(),
    ]);

    const revenue = payments.reduce((s, p) => s + p.amount, 0) + gifts.reduce((s, g) => s + g.amountInr, 0);
    const mrr = tenants.reduce((s, t) => s + (t.plan?.monthlyPrice || 0), 0);
    const bandwidthGb = Math.round(streams.reduce((n, s) => n + s.totalJoins, 0) * 0.35 * 10) / 10;
    const cdnCost = Math.round(bandwidthGb * 0.08 * 100) / 100;
    const storageGb = tenants.reduce((s, t) => s + t.usageBandwidthGb, 0);
    const storageCost = Math.round(storageGb * 0.02 * 100) / 100;
    const bandwidthCost = Math.round(bandwidthGb * 0.05 * 100) / 100;
    const profit = Math.round((revenue + mrr - cdnCost - storageCost - bandwidthCost) * 100) / 100;

    const activeTenants = tenants.filter((t) => t.isActive).length;
    const churnProxy = tenants.filter((t) => !t.isActive).length;
    const forecast = Math.round((mrr * 1.08 + revenue * 0.1) * 100) / 100;
    const scaling = await evaluateAutoscaling();

    res.json({
      success: true,
      data: {
        revenue,
        mrr,
        profit,
        costs: { cdnCost, storageCost, bandwidthCost },
        activeTenants,
        churn: churnProxy,
        forecast,
        bookings: bookings.length,
        liveStreams: streams.filter((s) => s.status === 'LIVE').length,
        nodes: {
          total: nodes.length,
          healthy: nodes.filter((n) => n.status === 'HEALTHY').length,
          draining: nodes.filter((n) => n.status === 'DRAINING').length,
        },
        scalingActions: scaling.actions,
        export: {
          pdf: '/api/reporting/export?format=pdf',
          xlsx: '/api/reporting/export?format=xlsx',
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/export', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    const tenants = await prisma.tenant.findMany({ include: { plan: true } });
    const rows = [
      ['Tenant', 'Plan', 'MRR', 'UsageMinutes', 'BandwidthGb', 'Active'],
      ...tenants.map((t) => [
        t.name,
        t.plan?.name || '',
        String(t.plan?.monthlyPrice || 0),
        String(t.usageMinutes),
        String(t.usageBandwidthGb),
        String(t.isActive),
      ]),
    ];
    if (format === 'xlsx' || format === 'csv') {
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="executive-report.csv"');
      return res.send(csv);
    }
    // PDF stub as plain text report
    const text = rows.map((r) => r.join('\t')).join('\n');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="executive-report.pdf"');
    res.send(Buffer.from(`%PDF-1.1\n1 0 obj<<>>endobj\nstream\n${text}\nendstream\n%%EOF`));
  } catch (err) {
    next(err);
  }
});

router.get('/scheduled', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (_req, res, next) => {
  try {
    const list = await prisma.scheduledReport.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.post('/scheduled', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const report = await prisma.scheduledReport.create({
      data: {
        name: String(req.body?.name || 'Weekly Executive'),
        cron: String(req.body?.cron || '0 9 * * 1'),
        format: String(req.body?.format || 'PDF'),
        recipients: String(req.body?.recipients || process.env.SMTP_FROM || 'admin@svliveevents.com'),
      },
    });
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
