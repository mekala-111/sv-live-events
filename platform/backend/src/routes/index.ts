import { Router } from 'express';
import authRoutes from './auth.routes.js';
import packagesRoutes from './packages.routes.js';
import bookingsRoutes from './bookings.routes.js';
import galleryRoutes from './gallery.routes.js';
import testimonialsRoutes from './testimonials.routes.js';
import paymentsRoutes from './payments.routes.js';
import adminRoutes from './admin.routes.js';
import liveRoutes from './live.routes.js';
import extrasRoutes from './extras.routes.js';
import blogsRoutes from './blogs.routes.js';
import streamRoutes from './stream.routes.js';
import ticketsRoutes from './tickets.routes.js';
import tenantRoutes from './tenant.routes.js';
import inviteRoutes from './invite.routes.js';
import studioRoutes from './studio.routes.js';
import engageRoutes from './engage.routes.js';
import libraryRoutes from './library.routes.js';
import aiRoutes from './ai.routes.js';
import analyticsEnterpriseRoutes from './analytics.enterprise.routes.js';
import clusterRoutes from './cluster.routes.js';
import edgeRoutes from './edge.routes.js';
import mediaRoutes from './media.routes.js';
import eventsRoutes from './events.routes.js';
import crmRoutes from './crm.routes.js';
import mobileRoutes from './mobile.routes.js';
import tvRoutes from './tv.routes.js';
import reportingRoutes from './reporting.routes.js';
import themesRoutes from './themes.routes.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/packages', packagesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/gallery', galleryRoutes);
router.use('/testimonials', testimonialsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/admin', adminRoutes);
router.use('/live', liveRoutes);
router.use('/stream', streamRoutes);
router.use('/extras', extrasRoutes);
router.use('/blogs', blogsRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/tenants', tenantRoutes);
router.use('/invites', inviteRoutes);
router.use('/studio', studioRoutes);
router.use('/engage', engageRoutes);
router.use('/library', libraryRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsEnterpriseRoutes);
router.use('/cluster', clusterRoutes);
router.use('/edge', edgeRoutes);
router.use('/media', mediaRoutes);
router.use('/events', eventsRoutes);
router.use('/crm', crmRoutes);
router.use('/mobile', mobileRoutes);
router.use('/tv', tvRoutes);
router.use('/reporting', reportingRoutes);
router.use('/themes', themesRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'SV Live Events API is running', ts: Date.now() });
});

/** Prometheus text exposition (process + streaming gauges) */
router.get('/metrics', async (_req, res) => {
  const mem = process.memoryUsage();
  let liveStreams = 0;
  let currentViewers = 0;
  try {
    liveStreams = await prisma.stream.count({ where: { status: 'LIVE' } });
    const agg = await prisma.stream.aggregate({ _sum: { currentViewers: true } });
    currentViewers = agg._sum.currentViewers || 0;
  } catch {
    /* db may be unavailable during boot */
  }
  const lines = [
    '# HELP process_uptime_seconds Process uptime',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${process.uptime()}`,
    '# HELP process_resident_memory_bytes Resident memory',
    '# TYPE process_resident_memory_bytes gauge',
    `process_resident_memory_bytes ${mem.rss}`,
    '# HELP process_heap_used_bytes Heap used',
    '# TYPE process_heap_used_bytes gauge',
    `process_heap_used_bytes ${mem.heapUsed}`,
    '# HELP svlive_live_streams Live stream count',
    '# TYPE svlive_live_streams gauge',
    `svlive_live_streams ${liveStreams}`,
    '# HELP svlive_current_viewers Concurrent viewers',
    '# TYPE svlive_current_viewers gauge',
    `svlive_current_viewers ${currentViewers}`,
  ];
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(lines.join('\n') + '\n');
});

/** Dynamic sitemap for public marketing + live event pages */
router.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const base = process.env.CLIENT_URL || 'http://localhost:5173';
    const streams = await prisma.stream.findMany({
      select: { slug: true, updatedAt: true, status: true },
      take: 500,
      orderBy: { updatedAt: 'desc' },
    });
    const staticPaths = ['', '/services', '/portfolio', '/packages', '/booking', '/about', '/contact', '/blog', '/faq'];
    const urls = [
      ...staticPaths.map(
        (p) =>
          `<url><loc>${base}${p}</loc><changefreq>weekly</changefreq><priority>${p === '' ? '1.0' : '0.7'}</priority></url>`,
      ),
      ...streams.map(
        (s) =>
          `<url><loc>${base}/live/${s.slug}</loc><lastmod>${s.updatedAt.toISOString()}</lastmod><changefreq>hourly</changefreq><priority>0.8</priority></url>`,
      ),
    ];
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`,
    );
  } catch (err) {
    next(err);
  }
});

export default router;
