# Disaster Recovery

## RPO / RTO targets

| Component | RPO | RTO |
|-----------|-----|-----|
| MySQL / SQLite app DB | 15 min (incremental) | 1 h |
| Recordings (object storage) | Near-zero (replicate) | 30 min |
| SRS origins | N/A (stateless + DVR) | 5 min (failover edge) |

## Daily backups

```bash
./platform/deploy/backup.sh
```

Store artefacts off-box (S3/R2). Enable MySQL binlog for PITR when on MySQL.

## Database snapshots

1. Stop writes (maintenance window) or use consistent snapshot.
2. `mysqldump --single-transaction` or copy `prisma/dev.db`.
3. Verify restore on staging monthly.

## Recording replication

Set `STORAGE_PROVIDER` + cross-region bucket replication. `enqueueBackup()` marks intent; wire SQS/Lambda for copy.

## Media server failover

1. `POST /api/cluster/nodes/:id/drain` on failing origin.
2. New publishes via `assign-origin` land on healthy nodes.
3. Edges continue serving HLS from cache / failover URL (`originFailover`).

## Runbook

1. Declare incident → create `OpsAlert` (Slack/Email).
2. Drain unhealthy nodes.
3. Restore DB from latest backup if corrupted.
4. Re-point GeoDNS if regional outage.
5. Post-mortem within 48h.
