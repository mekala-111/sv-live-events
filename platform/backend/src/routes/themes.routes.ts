import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();

const assetSchema = z.object({
  id: z.string().optional(),
  assetType: z.string().min(1),
  assetPath: z.string().min(1),
  label: z.string().optional().nullable(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  blendMode: z.string().optional(),
  scale: z.number().optional(),
  blur: z.number().optional(),
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  metaJson: z.string().optional().nullable(),
});

const themeBody = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(1),
  description: z.string().optional().nullable(),
  previewImage: z.string().optional().nullable(),
  desktopBackground: z.string().optional().nullable(),
  tabletBackground: z.string().optional().nullable(),
  mobileBackground: z.string().optional().nullable(),
  landscapeBackground: z.string().optional().nullable(),
  portraitBackground: z.string().optional().nullable(),
  waitingBackground: z.string().optional().nullable(),
  liveBackground: z.string().optional().nullable(),
  popupBackground: z.string().optional().nullable(),
  loginBackground: z.string().optional().nullable(),
  chatBackground: z.string().optional().nullable(),
  overlayImage: z.string().optional().nullable(),
  frameImage: z.string().optional().nullable(),
  particles: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  cardColor: z.string().optional(),
  glassColor: z.string().optional(),
  buttonColor: z.string().optional(),
  textColor: z.string().optional(),
  borderColor: z.string().optional(),
  glowColor: z.string().optional(),
  gradientColors: z.string().optional().nullable(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
  fontButton: z.string().optional().nullable(),
  fontCountdown: z.string().optional().nullable(),
  customFontsJson: z.string().optional().nullable(),
  animationType: z.string().optional(),
  animationSpeed: z.number().optional(),
  animationDensity: z.number().optional(),
  animationOpacity: z.number().optional(),
  layersJson: z.string().optional().nullable(),
  musicUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  watermarkUrl: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  assets: z.array(assetSchema).optional(),
});

function serializeTheme(theme: {
  assets?: unknown[];
  gradientColors: string | null;
  customFontsJson: string | null;
  layersJson: string | null;
  [key: string]: unknown;
}) {
  return {
    ...theme,
    gradientColors: theme.gradientColors ? safeJson(theme.gradientColors) : [],
    customFonts: theme.customFontsJson ? safeJson(theme.customFontsJson) : [],
    layers: theme.layersJson ? safeJson(theme.layersJson) : [],
    assets: theme.assets ?? [],
  };
}

function safeJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function toDb(body: z.infer<typeof themeBody>) {
  const { assets: _a, ...rest } = body;
  return rest;
}

/** Public — published themes for streaming page */
router.get('/public', async (req, res, next) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const themes = await prisma.eventTheme.findMany({
      where: { status: 'PUBLISHED', ...(category ? { category } : {}) },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: themes.map(serializeTheme) });
  } catch (err) {
    next(err);
  }
});

router.get('/public/:slugOrId', async (req, res, next) => {
  try {
    const key = param(req.params.slugOrId);
    const theme = await prisma.eventTheme.findFirst({
      where: {
        status: 'PUBLISHED',
        OR: [{ slug: key }, { id: key }],
      },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!theme) throw new AppError('Theme not found', 404);
    res.json({ success: true, data: serializeTheme(theme) });
  } catch (err) {
    next(err);
  }
});

router.use(requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'));

router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const category = req.query.category ? String(req.query.category) : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;
    const themes = await prisma.eventTheme.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { slug: { contains: q } },
                { category: { contains: q } },
              ],
            }
          : {}),
      },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: themes.map(serializeTheme) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const theme = await prisma.eventTheme.findUnique({
      where: { id: param(req.params.id) },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!theme) throw new AppError('Theme not found', 404);
    res.json({ success: true, data: serializeTheme(theme) });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(themeBody), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof themeBody>;
    const exists = await prisma.eventTheme.findUnique({ where: { slug: body.slug } });
    if (exists) throw new AppError('Slug already in use', 409);

    const theme = await prisma.eventTheme.create({
      data: {
        ...toDb(body),
        assets: body.assets?.length
          ? {
              create: body.assets.map((a, i) => ({
                assetType: a.assetType,
                assetPath: a.assetPath,
                label: a.label ?? null,
                positionX: a.positionX ?? 0,
                positionY: a.positionY ?? 0,
                opacity: a.opacity ?? 1,
                blendMode: a.blendMode ?? 'normal',
                scale: a.scale ?? 1,
                blur: a.blur ?? 0,
                visible: a.visible ?? true,
                sortOrder: a.sortOrder ?? i,
                metaJson: a.metaJson ?? null,
              })),
            }
          : undefined,
      },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
    });
    res.status(201).json({ success: true, data: serializeTheme(theme) });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(themeBody.partial().extend({ name: z.string().min(2).optional(), slug: z.string().min(2).optional() })), async (req, res, next) => {
  try {
    const id = param(req.params.id);
    const existing = await prisma.eventTheme.findUnique({ where: { id } });
    if (!existing) throw new AppError('Theme not found', 404);

    const body = req.body as Partial<z.infer<typeof themeBody>>;
    if (body.slug && body.slug !== existing.slug) {
      const clash = await prisma.eventTheme.findUnique({ where: { slug: body.slug } });
      if (clash) throw new AppError('Slug already in use', 409);
    }

    if (body.assets) {
      await prisma.themeAsset.deleteMany({ where: { themeId: id } });
    }

    const theme = await prisma.eventTheme.update({
      where: { id },
      data: {
        ...toDb(body as z.infer<typeof themeBody>),
        ...(body.assets
          ? {
              assets: {
                create: body.assets.map((a, i) => ({
                  assetType: a.assetType,
                  assetPath: a.assetPath,
                  label: a.label ?? null,
                  positionX: a.positionX ?? 0,
                  positionY: a.positionY ?? 0,
                  opacity: a.opacity ?? 1,
                  blendMode: a.blendMode ?? 'normal',
                  scale: a.scale ?? 1,
                  blur: a.blur ?? 0,
                  visible: a.visible ?? true,
                  sortOrder: a.sortOrder ?? i,
                  metaJson: a.metaJson ?? null,
                })),
              },
            }
          : {}),
      },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
    });
    res.json({ success: true, data: serializeTheme(theme) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const status = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).parse(req.body.status);
    const theme = await prisma.eventTheme.update({
      where: { id: param(req.params.id) },
      data: { status },
      include: { assets: true },
    });
    res.json({ success: true, data: serializeTheme(theme) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.eventTheme.delete({ where: { id: param(req.params.id) } });
    res.json({ success: true, message: 'Theme deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const src = await prisma.eventTheme.findUnique({
      where: { id: param(req.params.id) },
      include: { assets: true },
    });
    if (!src) throw new AppError('Theme not found', 404);
    const slug = `${src.slug}-copy-${Date.now().toString(36)}`;
    const { id: _id, createdAt: _c, updatedAt: _u, assets, ...rest } = src;
    const theme = await prisma.eventTheme.create({
      data: {
        ...rest,
        name: `${src.name} (Copy)`,
        slug,
        status: 'DRAFT',
        assets: {
          create: assets.map(({ assetType, assetPath, label, positionX, positionY, opacity, blendMode, scale, blur, visible, sortOrder, metaJson }) => ({
            assetType,
            assetPath,
            label,
            positionX,
            positionY,
            opacity,
            blendMode,
            scale,
            blur,
            visible,
            sortOrder,
            metaJson,
          })),
        },
      },
      include: { assets: true },
    });
    res.status(201).json({ success: true, data: serializeTheme(theme) });
  } catch (err) {
    next(err);
  }
});

export default router;
