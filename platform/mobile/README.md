# SV Live Events — Mobile & TV clients

Native clients consume the **same REST + Socket.IO APIs** as the web app.

## Planned Flutter apps

| Target | Package (suggested) |
|--------|---------------------|
| Android / iOS | `apps/viewer` |
| Android TV / Apple TV / Fire TV | `apps/tv` |

## Auth

`POST /api/auth/login` → store access token securely → `Authorization: Bearer …`

## Live playback

1. `POST /api/stream/verify-password/:slug`
2. Play returned `hlsUrl` with `video_player` / ExoPlayer / AVPlayer
3. Join Socket.IO room `join-stream`

## Casting

Use Google Cast / AirPlay SDKs against the signed HLS URL. Chromecast custom receiver can load Video.js or native HLS.

## Push notifications

Register device tokens with a future `POST /api/devices`. Wire FCM / APNs for stream-started and invite events via `notifyEvent`.

## Offline recordings

Download library assets (`GET /api/library`) to local storage when `isPublic` or entitlement allows.

Do not fork API contracts — extend backend modules instead.
