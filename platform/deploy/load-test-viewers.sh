#!/usr/bin/env bash
# Simulate concurrent viewer joins against verify-password (local load smoke).
# For 100k use k6/locust against edge CDN — this is an API contract smoke harness.
set -euo pipefail
API="${API_URL:-http://127.0.0.1:5001/api}"
SLUG="${STREAM_SLUG:-rahul-priya-wedding}"
PASS="${STREAM_PASSWORD:-Wedding@2027}"
N="${VIEWERS:-50}"

echo "Spawning $N verify-password requests against $SLUG"
ok=0
fail=0
for i in $(seq 1 "$N"); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/stream/verify-password/$SLUG" \
    -H 'Content-Type: application/json' \
    -d "{\"password\":\"$PASS\",\"displayName\":\"Load$i\",\"device\":\"LoadTest\"}" || true)
  if [[ "$code" == "200" ]]; then ok=$((ok+1)); else fail=$((fail+1)); fi
done
echo "OK=$ok FAIL=$fail"
curl -s "$API/edge/resolve?slug=$SLUG&country=IN" | head -c 400
echo
