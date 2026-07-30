#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="${ROOT}/backups"
mkdir -p "$OUT"

if [[ -f "${ROOT}/backend/prisma/dev.db" ]]; then
  cp "${ROOT}/backend/prisma/dev.db" "${OUT}/sqlite_${STAMP}.db"
  echo "SQLite backup → ${OUT}/sqlite_${STAMP}.db"
fi

if command -v docker >/dev/null 2>&1; then
  if docker compose -f "${ROOT}/docker-compose.yml" ps mysql 2>/dev/null | grep -q Up; then
    docker compose -f "${ROOT}/docker-compose.yml" exec -T mysql \
      mysqldump -uroot -proot sv_live_events > "${OUT}/mysql_${STAMP}.sql"
    echo "MySQL backup → ${OUT}/mysql_${STAMP}.sql"
  fi
fi

echo "Backup complete (${STAMP})"
