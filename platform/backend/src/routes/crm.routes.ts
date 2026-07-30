import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { notifyEvent } from '../utils/notify.js';

const router = Router();
const staff = ['ADMIN', 'SUPER_ADMIN', 'STAFF'] as const;

router.get('/leads', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const leads = await prisma.crmLead.findMany({
      where: req.query.stage ? { stage: String(req.query.stage) } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: { customer: { include: { user: { select: { name: true, email: true } } } } },
    });
    res.json({ success: true, data: leads });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/leads',
  requireAuth,
  requireRole(...staff),
  validate(
    z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      source: z.string().optional(),
      stage: z.string().optional(),
      valueInr: z.number().optional(),
      notes: z.string().optional(),
      followUpAt: z.string().datetime().optional(),
      tenantId: z.string().optional(),
      customerId: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const lead = await prisma.crmLead.create({
        data: {
          ...req.body,
          followUpAt: req.body.followUpAt ? new Date(req.body.followUpAt) : null,
        },
      });
      res.status(201).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  },
);

router.patch('/leads/:id', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const lead = await prisma.crmLead.update({
      where: { id: param(req.params.id) },
      data: {
        ...(req.body.stage ? { stage: req.body.stage } : {}),
        ...(req.body.notes !== undefined ? { notes: req.body.notes } : {}),
        ...(req.body.valueInr !== undefined ? { valueInr: Number(req.body.valueInr) } : {}),
        ...(req.body.followUpAt !== undefined
          ? { followUpAt: req.body.followUpAt ? new Date(req.body.followUpAt) : null }
          : {}),
      },
    });
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
});

router.get('/pipeline', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    const leads = await prisma.crmLead.findMany();
    const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];
    const pipeline = stages.map((stage) => ({
      stage,
      count: leads.filter((l) => l.stage === stage).length,
      valueInr: leads.filter((l) => l.stage === stage).reduce((s, l) => s + l.valueInr, 0),
    }));
    res.json({ success: true, data: pipeline });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/quotations',
  requireAuth,
  requireRole(...staff),
  validate(
    z.object({
      title: z.string().min(2),
      amountInr: z.number().positive(),
      leadId: z.string().optional(),
      tenantId: z.string().optional(),
      lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
      validUntil: z.string().datetime().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const q = await prisma.crmQuotation.create({
        data: {
          title: req.body.title,
          amountInr: req.body.amountInr,
          leadId: req.body.leadId,
          tenantId: req.body.tenantId,
          lineItemsJson: req.body.lineItems ? JSON.stringify(req.body.lineItems) : null,
          validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
          status: 'SENT',
        },
      });
      res.status(201).json({ success: true, data: q });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/quotations', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    const list = await prisma.crmQuotation.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/contracts',
  requireAuth,
  requireRole(...staff),
  validate(
    z.object({
      title: z.string().min(2),
      partyName: z.string().min(2),
      tenantId: z.string().optional(),
      fileUrl: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const c = await prisma.crmContract.create({ data: req.body });
      res.status(201).json({ success: true, data: c });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/contracts', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    const list = await prisma.crmContract.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.get('/follow-ups', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    const due = await prisma.crmLead.findMany({
      where: { followUpAt: { lte: new Date(Date.now() + 86400000) }, stage: { not: 'LOST' } },
      orderBy: { followUpAt: 'asc' },
    });
    res.json({ success: true, data: due });
  } catch (err) {
    next(err);
  }
});

router.post('/follow-ups/:id/remind', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const lead = await prisma.crmLead.findUnique({ where: { id: param(req.params.id) } });
    if (!lead) throw new AppError('Lead not found', 404);
    await notifyEvent({
      type: 'EVENT_REMINDER',
      to: { email: lead.email || process.env.SMTP_FROM, phone: lead.phone || undefined },
      subject: `Follow-up: ${lead.name}`,
      message: lead.notes || 'CRM follow-up reminder',
    });
    res.json({ success: true, message: 'Reminder queued' });
  } catch (err) {
    next(err);
  }
});

router.get('/history/:customerId', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const customerId = param(req.params.customerId);
    const [customer, bookings, leads] = await Promise.all([
      prisma.customer.findUnique({
        where: { id: customerId },
        include: { user: true, invoices: true },
      }),
      prisma.booking.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } }),
      prisma.crmLead.findMany({ where: { customerId } }),
    ]);
    if (!customer) throw new AppError('Customer not found', 404);
    res.json({ success: true, data: { customer, bookings, leads } });
  } catch (err) {
    next(err);
  }
});

export default router;
