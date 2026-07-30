import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeLifecycle } from '../utils/streamLifecycle.js';

describe('computeLifecycle', () => {
  it('returns ENDED when endedAt set', () => {
    assert.equal(
      computeLifecycle({ status: 'LIVE', endedAt: new Date(), ingestActive: true }),
      'ENDED',
    );
  });

  it('returns LIVE when ingest active', () => {
    assert.equal(
      computeLifecycle({ status: 'LIVE', ingestActive: true, lastHeartbeatAt: new Date() }),
      'LIVE',
    );
  });

  it('returns STARTING_SOON within 15 minutes', () => {
    const scheduledAt = new Date(Date.now() + 5 * 60_000);
    assert.equal(computeLifecycle({ status: 'SCHEDULED', scheduledAt }), 'STARTING_SOON');
  });
});
