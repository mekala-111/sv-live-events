# Security Guide

## Threat model (streaming)

- Stream key hijacking → publisher tokens + SRS hooks + key regen  
- Playback URL sharing → short-lived signed HLS + session binding  
- Credential stuffing → auth rate limits + audit logs  
- XSS/injection → Zod validation + helmet + JSON API  
- Secrets leakage → CI gitleaks + production secret assert  

## JWT

- Access: `JWT_ACCESS_SECRET`, expiry `JWT_ACCESS_EXPIRES` (default 15m)  
- Refresh: separate secret; rotated on refresh  
- Never log tokens  

## Signed media

- Manifest: `signHlsUrl` (exp, nonce, HMAC)  
- Segments: `signMediaSegment` / `verifyMediaSignature`  
- Rotation: `rotatePlaybackUrl`  

## Rate limits

- Global: 200 / 15m  
- Auth: 30 / 15m  
- Stream join: 60 / min  

## Secrets management

Prefer Vault / AWS SM / GCP SM. Inject via env. Never commit `.env`.  
Production process exits if JWT secrets are default/short.

## Geo / device

Stream fields `geoAllow`, `geoBlock`, `maxDevices`, `maxConcurrent` enforced in `securityLimits.ts`.
