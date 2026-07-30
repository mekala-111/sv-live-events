#!/usr/bin/env bash
# Blue-green style deploy for PM2 + Nginx static frontend
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COLOR="${1:-blue}"
STAMP="$(date +%Y%m%d_%H%M%S)"
RELEASE="$ROOT/releases/${COLOR}_${STAMP}"

mkdir -p "$ROOT/releases" "$RELEASE"
echo "Building into $RELEASE"

(cd "$ROOT/frontend" && npm ci && npm run build)
(cd "$ROOT/backend" && npm ci && npx prisma generate && npm run build)

cp -R "$ROOT/frontend/dist" "$RELEASE/frontend"
cp -R "$ROOT/backend/dist" "$RELEASE/backend"
cp "$ROOT/backend/package.json" "$RELEASE/backend/"
cp -R "$ROOT/backend/prisma" "$RELEASE/backend/prisma"

ln -sfn "$RELEASE" "$ROOT/current"
echo "current → $RELEASE"

if command -v pm2 >/dev/null 2>&1; then
  pm2 reload "$ROOT/deploy/ecosystem.config.js" --update-env || pm2 start "$ROOT/deploy/ecosystem.config.js"
fi

echo "Blue-green cutover complete. Health: curl -sf http://127.0.0.1:5001/api/health"
