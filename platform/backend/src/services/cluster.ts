import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const REGIONS = [
  { code: 'IN', name: 'India', lat: 20.59, lon: 78.96, city: 'Mumbai' },
  { code: 'SG', name: 'Singapore', lat: 1.35, lon: 103.82, city: 'Singapore' },
  { code: 'AE', name: 'Dubai', lat: 25.2, lon: 55.27, city: 'Dubai' },
  { code: 'GB', name: 'London', lat: 51.5, lon: -0.12, city: 'London' },
  { code: 'DE', name: 'Frankfurt', lat: 50.11, lon: 8.68, city: 'Frankfurt' },
  { code: 'US', name: 'New York', lat: 40.71, lon: -74.0, city: 'New York' },
  { code: 'AU', name: 'Sydney', lat: -33.87, lon: 151.21, city: 'Sydney' },
] as const;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function ensureDefaultNodes() {
  const count = await prisma.mediaNode.count();
  if (count > 0) return;
  await prisma.mediaNode.createMany({
    data: REGIONS.map((r) => ({
      name: `srs-${r.code.toLowerCase()}-1`,
      role: 'ORIGIN',
      region: r.code,
      city: r.city,
      rtmpUrl: `rtmp://${r.code.toLowerCase()}.ingest.svliveevents.com/live`,
      hlsBaseUrl: `https://${r.code.toLowerCase()}.cdn.svliveevents.com/live`,
      webrtcBaseUrl: `webrtc://${r.code.toLowerCase()}.rtc.svliveevents.com/live`,
      apiUrl: `https://${r.code.toLowerCase()}.api.svliveevents.com`,
      status: 'HEALTHY',
      latitude: r.lat,
      longitude: r.lon,
      lastHealthAt: new Date(),
    })),
  });
  await prisma.mediaNode.createMany({
    data: REGIONS.map((r) => ({
      name: `edge-${r.code.toLowerCase()}-1`,
      role: 'EDGE',
      region: r.code,
      city: r.city,
      rtmpUrl: `rtmp://${r.code.toLowerCase()}.ingest.svliveevents.com/live`,
      hlsBaseUrl: `https://${r.code.toLowerCase()}.edge.svliveevents.com/live`,
      status: 'HEALTHY',
      latitude: r.lat,
      longitude: r.lon,
      lastHealthAt: new Date(),
      maxViewers: 50000,
    })),
  });
  await prisma.scalingPolicy.create({
    data: { name: 'default' },
  });
  logger.info('Seeded default global media nodes');
}

/** Pick healthiest ORIGIN that is not draining */
export async function assignOriginForStream() {
  await ensureDefaultNodes();
  const nodes = await prisma.mediaNode.findMany({
    where: { role: 'ORIGIN', status: { in: ['HEALTHY', 'DEGRADED'] } },
    orderBy: [{ cpuPercent: 'asc' }, { activeStreams: 'asc' }],
  });
  const eligible = nodes.filter((n) => n.activeStreams < n.maxStreams && n.status !== 'DRAINING');
  return eligible[0] || nodes[0] || null;
}

export async function resolveNearestEdge(opts: {
  country?: string;
  lat?: number;
  lon?: number;
}) {
  await ensureDefaultNodes();
  const edges = await prisma.mediaNode.findMany({
    where: { role: 'EDGE', status: { in: ['HEALTHY', 'DEGRADED'] } },
  });
  if (!edges.length) return null;

  const countryToRegion: Record<string, string> = {
    IN: 'IN', SG: 'SG', AE: 'AE', GB: 'GB', DE: 'DE', US: 'US', AU: 'AU',
    IND: 'IN', UAE: 'AE', UK: 'GB',
  };
  if (opts.country) {
    const region = countryToRegion[opts.country.toUpperCase()];
    const match = edges.find((e) => e.region === region && e.status === 'HEALTHY');
    if (match) return match;
  }

  if (opts.lat != null && opts.lon != null) {
    let best = edges[0];
    let bestD = Infinity;
    for (const e of edges) {
      if (e.latitude == null || e.longitude == null) continue;
      const d = haversineKm(opts.lat, opts.lon, e.latitude, e.longitude);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  return edges.find((e) => e.region === 'IN') || edges[0];
}

export async function recordNodeHealth(
  nodeId: string,
  metrics: { cpuPercent?: number; bandwidthMbps?: number; activeStreams?: number; activeViewers?: number },
) {
  const status =
    (metrics.cpuPercent ?? 0) > 90 || (metrics.bandwidthMbps ?? 0) > 8000
      ? 'DEGRADED'
      : 'HEALTHY';
  return prisma.mediaNode.update({
    where: { id: nodeId },
    data: {
      ...metrics,
      status,
      lastHealthAt: new Date(),
    },
  });
}

/** Evaluate scaling policy — returns recommended actions (provision/deprovision stubs) */
export async function evaluateAutoscaling() {
  const policy = (await prisma.scalingPolicy.findFirst({ where: { isActive: true } })) || {
    cpuThreshold: 70,
    bandwidthMbpsMax: 5000,
    viewersPerNodeMax: 15000,
    minNodes: 1,
    maxNodes: 20,
    cooldownSec: 300,
  };

  const origins = await prisma.mediaNode.findMany({ where: { role: 'ORIGIN' } });
  const healthy = origins.filter((n) => n.status === 'HEALTHY' || n.status === 'DEGRADED');
  const overloaded = healthy.filter(
    (n) =>
      n.cpuPercent >= policy.cpuThreshold ||
      n.bandwidthMbps >= policy.bandwidthMbpsMax ||
      n.activeViewers >= policy.viewersPerNodeMax,
  );
  const idle = healthy.filter(
    (n) => n.activeStreams === 0 && n.cpuPercent < 20 && n.activeViewers === 0,
  );

  const actions: Array<{ action: 'PROVISION' | 'DRAIN_REMOVE'; region?: string; reason: string }> = [];
  if (overloaded.length && healthy.length < policy.maxNodes) {
    actions.push({
      action: 'PROVISION',
      region: overloaded[0].region,
      reason: `CPU/bandwidth/viewers above threshold on ${overloaded[0].name}`,
    });
  }
  if (idle.length > 1 && healthy.length > policy.minNodes) {
    actions.push({
      action: 'DRAIN_REMOVE',
      region: idle[idle.length - 1].region,
      reason: `Idle node ${idle[idle.length - 1].name} past cooldown candidate`,
    });
  }

  return { policy, healthy: healthy.length, overloaded: overloaded.length, actions };
}

export async function drainNode(nodeId: string) {
  return prisma.mediaNode.update({
    where: { id: nodeId },
    data: { status: 'DRAINING' },
  });
}
