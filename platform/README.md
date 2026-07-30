# SV Live Events — Private Live Streaming Platform

Commercial wedding & event livestreaming platform (Vimeo OTT / LiveU style) with RTMP ingest, HLS playback, private passwords, chat, analytics, and recordings.

## Marketing + platform (local)

The Next.js marketing landing lives at the **repo root**. This `platform/` folder is the product app (booking, auth, live, dashboards). They link to each other via env URLs.

```bash
# Terminal 1 — landing (http://localhost:3000)
cd "/path/to/SV LIVE EVENTS"
cp .env.local.example .env.local   # if needed
npm run dev

# Terminal 2 — API (http://localhost:5001)
cd platform/backend
npm install
npm run prisma:seed
npm run dev

# Terminal 3 — platform app (http://localhost:5173)
cd platform/frontend
cp .env.example .env               # if needed
npm install
npm run dev
```

| Surface | URL |
|---------|-----|
| Marketing landing | http://localhost:3000 |
| Platform app | http://localhost:5173 |
| API health | http://localhost:5001/api/health |

Env:

- Landing: `NEXT_PUBLIC_PLATFORM_URL` (default `http://localhost:5173`)
- Platform: `VITE_LANDING_URL` (default `http://localhost:3000`)

Platform `/` redirects to the landing. Landing **Sign In** / **Book Now** / **Live Demo** open the platform.

## Architecture

```
Camera / ATEM / OBS
        │ RTMP
        ▼
   SRS Media Server  ──► HLS (+ WebRTC)
        │
        ▼
 React Viewer (Video.js)  ◄── JWT playback token
        │
   Express API + Socket.IO + Prisma
```

## Quick start (platform only)

```bash
# API
cd platform/backend
npm install
npm run prisma:seed
npm run dev

# Web
cd platform/frontend
npm install
npm run dev
```

- Platform app: http://localhost:5173  
- Marketing landing: http://localhost:3000  
- API: http://localhost:5001/api/health  
- Backend startup automatically runs `prisma db push --skip-generate`, so schema changes sync on a fresh machine or server boot.

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@svliveevents.com | Admin@123 |
| Customer | customer@svliveevents.com | Customer@123 |

### Demo private stream

- Viewer: http://localhost:5173/live/rahul-priya-wedding  
- Password: `Wedding@2027`  
- Admin: `/admin/streams` → create RTMP credentials, Go Live, End + auto recording  

Without SRS running, the viewer falls back to a public demo HLS URL so the player UI still works.

## Streaming server (SRS)

```bash
cd platform
docker compose up -d srs
```

Ports: `1935` RTMP · `8080` HLS · `1985` API/WebRTC  

OBS → Settings → Stream → Custom:
- Server: `rtmp://localhost:1935/live`
- Stream Key: from Admin → Live Streams  

Playback: `http://localhost:8080/live/{streamKey}.m3u8`

## Key APIs

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/stream/events` | Create event (RTMP URL, key, viewer URL, password) |
| GET | `/api/stream/events` | Admin list |
| POST | `/api/stream/events/:id/start\|stop` | Go live / end + recording |
| GET | `/api/stream/status/:slug` | Public status |
| POST | `/api/stream/verify-password/:slug` | Password → playback JWT |
| GET/POST | `/api/stream/chat/:slug` | Chat |
| GET | `/api/stream/analytics/:id` | Viewer analytics |
| GET/PATCH/DELETE | `/api/stream/recordings` | Recordings |

## Production deploy

1. **Landing** → host repo-root Next.js (`NEXT_PUBLIC_PLATFORM_URL` → platform origin)
2. **Frontend** → Vercel (`platform/frontend`, set `VITE_LANDING_URL`)
3. **API** → Ubuntu VPS + PM2 (`deploy/ecosystem.config.js`)
4. **Nginx** → `deploy/nginx.conf` (API + Socket.IO + HLS proxy)
5. **SRS** → Docker on streaming VPS
6. Set env:

```env
RTMP_BASE_URL=rtmp://stream.svliveevents.com/live
HLS_BASE_URL=https://stream.svliveevents.com/live
CLIENT_URL=https://svliveevents.com
DATABASE_URL=mysql://...
```

## Security

- Password-gated streams  
- Signed playback tokens (HMAC, 6h)  
- JWT admin auth + roles  
- Rate limiting, Helmet, CORS  
- IP hashing on viewer sessions  
- Audit logs on stream create  

## Folders

```
platform/
  frontend/          React viewer + admin + booking
  backend/           Express + Prisma + Socket.IO
  streaming/srs.conf SRS config
  deploy/            Nginx + PM2
  docker-compose.yml MySQL + Redis + SRS
```
