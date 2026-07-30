import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signHlsUrl } from '../utils/streamLifecycle.js';
import { verifyMediaSignature, buildViewerWatermark } from '../services/signedMedia.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';

describe('signed HLS / media', () => {
  it('signs HLS urls with exp and sig', () => {
    const url = signHlsUrl('http://cdn/live/x.m3u8', 'stream1', 'sess1');
    assert.match(url, /exp=/);
    assert.match(url, /sig=/);
    assert.match(url, /nonce=/);
  });

  it('rejects expired segment signatures', () => {
    const ok = verifyMediaSignature({
      streamId: 's',
      sessionToken: 't',
      path: '/seg.ts',
      exp: String(Math.floor(Date.now() / 1000) - 10),
      nonce: 'abc',
      sig: 'deadbeef',
      kind: 'segment',
    });
    assert.equal(ok, false);
  });

  it('builds watermark lines', () => {
    const w = buildViewerWatermark({
      name: 'Asha',
      email: 'a@b.com',
      ipHash: 'abcdef12zzzz',
      sessionId: 'sessiontoken123',
    });
    assert.ok(w.lines.length >= 3);
  });
});

describe('pagination', () => {
  it('clamps limit and computes skip', () => {
    const p = parsePagination({ page: '2', limit: '50' });
    assert.equal(p.page, 2);
    assert.equal(p.limit, 50);
    assert.equal(p.skip, 50);
  });

  it('reports hasMore', () => {
    const m = pageMeta(120, 2, 50);
    assert.equal(m.totalPages, 3);
    assert.equal(m.hasMore, true);
  });
});
