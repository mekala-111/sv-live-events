#!/usr/bin/env bash
# Chaos: drain first healthy ORIGIN and verify assign-origin still succeeds.
set -euo pipefail
API="${API_URL:-http://127.0.0.1:5001/api}"
TOKEN="${ADMIN_TOKEN:?Set ADMIN_TOKEN from login accessToken}"

nodes=$(curl -sf -H "Authorization: Bearer $TOKEN" "$API/cluster/nodes")
id=$(node -e "const d=JSON.parse(process.argv[1]); const n=(d.data||[]).find(x=>x.role==='ORIGIN'&&x.status==='HEALTHY'); if(!n) process.exit(2); console.log(n.id)" "$nodes")

echo "Draining $id"
curl -sf -X POST -H "Authorization: Bearer $TOKEN" "$API/cluster/nodes/$id/drain" >/dev/null
curl -sf -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{}' "$API/cluster/assign-origin" | head -c 300
echo
echo "Undraining $id"
curl -sf -X POST -H "Authorization: Bearer $TOKEN" "$API/cluster/nodes/$id/undrain" >/dev/null
echo "Chaos complete"
