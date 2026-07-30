# Production Readiness Report — SV Live Events

**Date:** 2026-07-29  
**Scope:** Hardening only (no public API breaks, no feature regeneration)

---

## 1. Architecture review

| Layer | Status | Notes |
|-------|--------|-------|
| SPA + Express + Prisma | Ready | Unchanged contracts |
| SRS + cluster registry | Ready | Drain / assign-origin / edge resolve |
| Redis namespaced cache | Ready | Falls back to no-op without `REDIS_URL` |
| Multi-tenant row isolation | Ready | Physical DB-per-tenant still debt |
| Blue/green + PM2 | Ready | `deploy/blue-green.sh` |

**Verdict:** Suitable for commercial launch with managed Redis + MySQL + multi-region edges.

---

## 2. Security review

| Control | Status |
|---------|--------|
| JWT dual-secret + expiry | Pass |
| Production secret assert | Pass |
| Auth / join rate limits | Pass |
| Signed HLS + segment helpers | Pass |
| Helmet + extra security headers | Pass |
| Zod on mutating routes | Pass (spot-check remaining stubs) |
| Audit login | Pass |
| Dependency / secret CI scans | Pass (non-blocking) |

**Residual risks:** DRM license servers not wired; SMS/WhatsApp notify are log stubs until credentials exist.

---

## 3. Performance review

| Optimisation | Status |
|--------------|--------|
| Composite DB indexes (stream, session, chat, booking, payment, nodes, jobs) | Applied |
| Viewer count Redis cache (5s TTL) + read replica hook | Applied |
| Cache warming on boot | Applied |
| Admin route code-splitting | Applied |
| Error boundary + skip link | Applied |
| Compression + Prometheus gauges | Applied |

**Targets vs current lab:** 100k viewers / 5k streams require real edge CDN + horizontal API. Lab harnesses: `deploy/load-test-viewers.sh`, chaos drain script.

---

## 4. Scalability review

- **Horizontal API:** Stateless JWT + Redis  
- **Media:** ORIGIN/EDGE pool, autoscaling recommendations  
- **DB:** Indexes + `DATABASE_READ_URL` + pooler URL hints  
- **Frontend:** Lazy admin chunks reduce initial JS  

**Bottleneck at extreme scale:** MySQL must run with pooling/read replicas and tuned indexes for sustained peak traffic.

---

## 5. Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Single-region SRS outage | Med | High | Multi-region nodes + failover URLs |
| Redis unavailable | Med | Med | No-op fallback (higher DB load) |
| Weak secrets in misconfigured prod | Low | Critical | Boot assert |
| AI/FFmpeg workers local sim only | High | Med | GPU claim API ready |
| 100k soak unproven on this hardware | High | High | External load platform + CDN |

---

## 6. Remaining technical debt

1. Physical tenant DB sharding  
2. Real Widevine/FairPlay license exchange  
3. Full OpenTelemetry SDK (stubs present)  
4. E2E Playwright suite (not yet automated in CI)  
5. Replace notify stubs with Twilio/Meta/SMTP  
6. Native OBS C++ plugin (companion script only)  
7. Formal WCAG audit with axe CI  

---

## 7. Go-live checklist

- [ ] Rotate all JWT / Razorpay / SMTP secrets via secrets manager  
- [ ] Point `DATABASE_URL` to MySQL primary; set `DATABASE_READ_URL`  
- [ ] Set `REDIS_URL`; verify `svlive:*` keys  
- [ ] Deploy ≥2 ORIGIN + edges per critical region; GeoDNS  
- [ ] Confirm SRS `on_publish` hooks reach API  
- [ ] TLS certificates on API, SPA, HLS CDN  
- [ ] Grafana dashboards + `alertmanager-rules.yml` wired  
- [ ] Daily `backup.sh` + restore drill documented  
- [ ] Run load test from CDN PoP; chaos drain test  
- [ ] Legal: privacy policy, DPA, recording consent  
- [ ] On-call rota + runbooks reviewed  

---

## 8. Compatibility statement

All existing public routes retain prior request/response shapes. Additive fields only (`requestId` on errors, optional pagination meta helpers, extra metrics). Rate limits may yield HTTP 429 under abuse — expected hardening behaviour.

**Recommendation:** **Go-live with conditions** — complete checklist items for MySQL, Redis, multi-region media, and secrets before marketing 100k-concurrent capacity.
