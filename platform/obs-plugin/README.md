# SV Live OBS Companion Plugin

Native C++ OBS plugin is out-of-repo; this companion uses **obs-websocket** against the existing API (no API renames).

## Features

1. One-click login → `POST /api/auth/login`
2. List events → `GET /api/stream/events`
3. Auto stream key → selected event `rtmpUrl` + `streamKey`
4. Go Live / Stop → `POST /api/stream/events/:id/start|stop`
5. Assign healthy origin → `POST /api/cluster/assign-origin`
6. Bandwidth monitor → poll `GET /api/cluster/nodes`
7. Scene sync → `POST /api/studio/:streamId/obs-remote`

## Quick script (Node)

```bash
cd platform/obs-plugin
npm install
node companion.mjs --email admin@svliveevents.com --password 'Admin@123'
```

Requires OBS WebSocket 5.x enabled on `ws://127.0.0.1:4455`.
