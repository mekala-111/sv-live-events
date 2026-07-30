# Production Operations Handbook

## Architecture (current)

```
Viewers → CDN/Edge (regional) → Origin SRS → OBS publishers
                ↓
         Node API (:5001) ← Redis · Prisma(DB) · Socket.IO
                ↓
         Vite SPA (:5173) / Nginx / PM2
```

- **API**: Express + Prisma + JWT  
- **Media**: SRS RTMP/HLS with cluster registry (`MediaNode`)  
- **Cache**: Redis namespaces (`svlive:{ns}:*`)  
- **Observability**: `/api/metrics`, correlation IDs, Grafana/Prometheus compose  

## Deployment

1. Set production secrets (`JWT_*` ≥ 32 chars, no defaults).
2. `DATABASE_URL` (+ optional `DATABASE_READ_URL` replica).
3. `REDIS_URL` required at scale.
4. `docker compose up -d` for MySQL/Redis/SRS/Prometheus/Grafana.
5. `./deploy/blue-green.sh` for API/frontend cutover.
6. Health: `curl -sf $API/api/health`.

## Scaling guide

| Layer | Scale lever |
|-------|-------------|
| Viewers | Edge nodes + CDN; ABR HLS |
| Publishers | ORIGIN pool; drain + assign-origin |
| API | Horizontal PM2/K8s; Redis shared session/cache |
| DB | Indexes + read replica + PgBouncer/ProxySQL |

Targets: API p95 &lt;100ms (cache hot paths), playback start &lt;2s (HLS fragment 2s), 99.99% via multi-AZ edges + drained rolling upgrades.

## On-call

1. Check Grafana + `/api/metrics` (`svlive_current_viewers`, `svlive_live_streams`).
2. Cluster: `/admin/cluster` — drain unhealthy, assign-origin.
3. Alerts: `deploy/alertmanager-rules.yml`.
4. Runbooks: `docs/DISASTER_RECOVERY.md`, `docs/PHASE3.md`.
5. Escalate if &gt;2 regions degraded.

## Security baseline

- JWT access 15m / refresh 7d  
- Auth rate limit 30/15m; stream join 60/min  
- Signed HLS query params (exp/nonce/sig)  
- Production boot refuses weak JWT secrets  
- Audit: `AUTH_LOGIN` activity logs  

## Backup / recovery

- `./deploy/backup.sh` daily  
- Object storage replication for recordings  
- PITR when on MySQL binlog  

## Cache TTLs

| Namespace | TTL |
|-----------|-----|
| viewers | 5s |
| playback | 30m |
| session | 8h |
| chat | 30s |
| analytics | 60s |
| rate | 15m |
| edge warm | 5m |
