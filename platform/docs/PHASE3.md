# Phase 3 — Global Scale

Additive subsystems for multi-region streaming, orchestration, AI/FFmpeg workers, CRM, mobile/TV APIs, and executive reporting. **Existing Phase 1/2 APIs are unchanged.**

## Global edge & cluster

| Endpoint | Purpose |
|----------|---------|
| `GET /api/edge/resolve` | Nearest edge + origin failover for viewers |
| `GET /api/cluster/nodes` | List ORIGIN/EDGE nodes (IN, SG, AE, GB, DE, US, AU) |
| `POST /api/cluster/nodes/:id/health` | Node heartbeat metrics |
| `POST /api/cluster/nodes/:id/drain` | Drain for maintenance |
| `POST /api/cluster/assign-origin` | Place stream on healthy origin |
| `GET /api/cluster/autoscaling` | Scale recommendations |
| `POST /api/cluster/rolling-upgrade` | Rolling upgrade plan |

Admin UI: `/admin/cluster`

## Media processing

`POST /api/media/jobs` — `TRANSCODE | ABR_HLS | THUMBNAILS | PREVIEW | POSTER | WAVEFORM`  
Local FFmpeg worker simulator; swap for GPU/CPU worker fleet.

## AI GPU workers

- `GET /api/ai/workers/capabilities`
- `POST /api/ai/workers/claim` (header `X-Worker-Key`)
- `POST /api/ai/workers/complete/:id`

Contracts: face, person, object, crowd, emotion, scene, STT, highlights, reels, wedding timeline.

## Events

Clone, bulk schedule, series, templates, ICS, Google/Outlook links under `/api/events/*`.

## CRM

`/api/crm/leads`, pipeline, quotations, contracts, follow-ups, customer history. UI: `/admin/crm`

## White-label

`PUT /api/tenants/:id/whitelabel` — domain, logo, colours, email/SMS templates, SMTP, payment gateway, storage, CDN, watermark, analytics.

## Mobile / TV

- `GET /api/mobile/config`
- Device tokens, offline manifest, QR login, playback session
- `GET /api/tv/config`, `/api/tv/catalog`, `/api/tv/live/:slug`

## Reporting

`GET /api/reporting/executive` · export CSV/PDF · scheduled reports. UI: `/admin/reporting`

## Security helpers

`services/signedMedia.ts` — segment signing, token rotation, multi-line viewer watermark (name, email, IP hash, session).

## Observability

Correlation ID middleware (`X-Correlation-Id`), structured span stubs, Prometheus `/api/metrics`, Alertmanager via existing `OpsAlert` + notify channels.

## Ops scripts

- `deploy/load-test-viewers.sh` — concurrent viewer simulation
- `deploy/chaos-node-failure.sh` — drain origin chaos
- `docs/DISASTER_RECOVERY.md`
- `obs-plugin/README.md` — OBS WebSocket companion
