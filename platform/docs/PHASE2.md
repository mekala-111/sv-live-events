# Phase 2 — Enterprise Streaming Platform

Additive modules on top of the existing SV Live Events stack. **No core modules were rewritten.**

## New admin surfaces

| Route | Purpose |
|-------|---------|
| `/admin/studio` | Multi-camera director console |
| `/admin/invitations` | Guest invite + QR tracking |
| `/admin/library` | Content library / VOD |
| `/admin/tenants` | Multi-tenant SaaS control |
| `/admin/analytics` | Enterprise analytics |
| `/admin/ops` | Live ops (existing, extended APIs) |

## New API namespaces

- `GET/POST /api/tenants` — tenants, plans, usage
- `POST /api/invites` — WhatsApp/SMS/Email invite stubs + redeem
- `GET/POST /api/studio/:streamId` — cameras, take/preview/cut, PTZ, overlays, OBS remote, AI director toggle
- `GET/POST /api/engage/...` — polls, reactions, gifts, audio tracks, subtitles
- `GET/POST /api/library` — assets, favourites, playlists, from-recording
- `POST /api/ai/jobs` — DIRECTOR | HIGHLIGHT | STT | FACE_TRACK | REEL
- `GET /api/analytics/enterprise` — revenue, retention, geo, devices
- `GET /api/analytics/ops/extended` — Node/host/connection alerts

## Architecture notes

### Multi-tenant
Row-level `tenantId` + `schemaKey` (logical shard). Custom domain / logo / theme via `Tenant`. Full physical DB-per-tenant is a future ops migration using `schemaKey`.

### AI
Jobs queue in `AiJob` and complete via a local async runner (`services/aiJobs.ts`). Swap for Redis/Bull + GPU workers without changing API contracts.

### Storage / CDN
`services/storage.ts` and `services/cdn.ts` abstract S3/R2/B2/GCS/Azure and Cloudflare/Bunny/CloudFront. Set:

```
STORAGE_PROVIDER=s3|r2|b2|gcs|azure|local
CDN_PROVIDER=cloudflare|bunny|cloudfront|none
CDN_BASE_URL=https://cdn.example.com
```

### DRM / security
Stream fields: `drmMode`, `geoAllow`, `geoBlock`, `maxDevices`, `maxConcurrent`. Helpers in `services/securityLimits.ts`. Widevine/FairPlay license servers plug in at the player token layer.

### Mobile / TV
Scaffold: `platform/mobile/README.md`. Flutter apps consume the same JWT + `/api/stream` + `/api/engage` APIs.

## DevOps additions

- `deploy/backup.sh` — daily SQLite/MySQL dump
- `deploy/blue-green.sh` — symlink swap pattern for PM2
- Prometheus `/api/metrics` + compose Grafana
- GitHub Actions CI (backend + frontend build)

## Tests

- Backend: `platform/backend/src/__tests__/lifecycle.test.ts`
- Run: `cd platform/backend && npm test` (when script present)
