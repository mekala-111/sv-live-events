import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();

const tenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  customDomain: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  billingEmail: z.string().email().optional(),
  planId: z.string().optional(),
  themeJson: z.string().optional(),
});

router.get('/plans', async (_req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { monthlyPrice: 'asc' } });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (_req, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { plan: true, _count: { select: { users: true, streams: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tenants });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), validate(tenantSchema), async (req, res, next) => {
  try {
    const exists = await prisma.tenant.findUnique({ where: { slug: req.body.slug } });
    if (exists) throw new AppError('Tenant slug taken', 409);
    const tenant = await prisma.tenant.create({
      data: {
        name: req.body.name,
        slug: req.body.slug,
        customDomain: req.body.customDomain,
        logoUrl: req.body.logoUrl,
        primaryColor: req.body.primaryColor || '#C9A14A',
        billingEmail: req.body.billingEmail,
        planId: req.body.planId,
        themeJson: req.body.themeJson,
        schemaKey: `tenant_${req.body.slug}`,
      },
    });
    res.status(201).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
});

router.get('/by-slug/:slug', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: param(req.params.slug) },
      include: { plan: true, packages: { where: { isActive: true } } },
    });
    if (!tenant || !tenant.isActive) throw new AppError('Tenant not found', 404);
    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        themeJson: tenant.themeJson ? JSON.parse(tenant.themeJson) : null,
        packages: tenant.packages,
        plan: tenant.plan,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.update({
      where: { id: param(req.params.id) },
      data: {
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.logoUrl !== undefined ? { logoUrl: req.body.logoUrl } : {}),
        ...(req.body.primaryColor ? { primaryColor: req.body.primaryColor } : {}),
        ...(req.body.customDomain !== undefined ? { customDomain: req.body.customDomain } : {}),
        ...(req.body.themeJson !== undefined ? { themeJson: req.body.themeJson } : {}),
        ...(req.body.planId !== undefined ? { planId: req.body.planId } : {}),
        ...(typeof req.body.isActive === 'boolean' ? { isActive: req.body.isActive } : {}),
      },
    });
    res.json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/packages', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const pkg = await prisma.tenantPackage.create({
      data: {
        tenantId: param(req.params.id),
        name: String(req.body.name || 'Custom Package'),
        price: Number(req.body.price || 0),
        description: req.body.description,
        featuresJson: req.body.features ? JSON.stringify(req.body.features) : null,
      },
    });
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/usage', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: param(req.params.id) }, include: { plan: true } });
    if (!tenant) throw new AppError('Tenant not found', 404);
    res.json({
      success: true,
      data: {
        usageMinutes: tenant.usageMinutes,
        usageBandwidthGb: tenant.usageBandwidthGb,
        plan: tenant.plan,
        billableEstimateInr: tenant.plan
          ? tenant.plan.monthlyPrice + tenant.usageBandwidthGb * 2.5
          : tenant.usageBandwidthGb * 2.5,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** White-label configuration (additive — does not change existing tenant fields contract) */
router.put('/:id/whitelabel', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const tenant = await prisma.tenant.update({
      where: { id: param(req.params.id) },
      data: {
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl as string | null } : {}),
        ...(body.primaryColor ? { primaryColor: String(body.primaryColor) } : {}),
        ...(body.customDomain !== undefined ? { customDomain: body.customDomain as string | null } : {}),
        ...(body.themeJson !== undefined
          ? { themeJson: typeof body.themeJson === 'string' ? body.themeJson : JSON.stringify(body.themeJson) }
          : {}),
        ...(body.emailTemplates !== undefined
          ? { emailTemplatesJson: JSON.stringify(body.emailTemplates) }
          : {}),
        ...(body.smsTemplates !== undefined ? { smsTemplatesJson: JSON.stringify(body.smsTemplates) } : {}),
        ...(body.smtpConfig !== undefined ? { smtpConfigJson: JSON.stringify(body.smtpConfig) } : {}),
        ...(body.paymentConfig !== undefined
          ? { paymentConfigJson: JSON.stringify(body.paymentConfig) }
          : {}),
        ...(body.storageConfig !== undefined
          ? { storageConfigJson: JSON.stringify(body.storageConfig) }
          : {}),
        ...(body.cdnConfig !== undefined ? { cdnConfigJson: JSON.stringify(body.cdnConfig) } : {}),
        ...(body.watermarkText !== undefined ? { watermarkText: body.watermarkText as string | null } : {}),
        ...(body.analyticsConfig !== undefined
          ? { analyticsConfigJson: JSON.stringify(body.analyticsConfig) }
          : {}),
      },
    });
    res.json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/whitelabel', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: param(req.params.id) } });
    if (!tenant || !tenant.isActive) throw new AppError('Tenant not found', 404);
    res.json({
      success: true,
      data: {
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        customDomain: tenant.customDomain,
        theme: tenant.themeJson ? JSON.parse(tenant.themeJson) : null,
        watermarkText: tenant.watermarkText,
        hasSmtp: Boolean(tenant.smtpConfigJson),
        hasPaymentGateway: Boolean(tenant.paymentConfigJson),
        hasStorage: Boolean(tenant.storageConfigJson),
        hasCdn: Boolean(tenant.cdnConfigJson),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
