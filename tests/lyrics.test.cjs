'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/lyrics.js');

async function request(query, rows) {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => rows });
  try {
    let status = 200;
    const headers = {};
    let result;
    await handler({ method: 'GET', query }, {
      setHeader(name, value) { headers[name] = value; },
      status(value) { status = value; return this; },
      json(data) { result = { status, data, headers }; return this; }
    });
    return result;
  } finally {
    global.fetch = originalFetch;
  }
}

test('normalizes YouTube metadata and accepts realistic duration rounding', async () => {
  const response = await request({
    title: 'Example Song (Official Video)',
    artist: 'Example Artist - Topic',
    duration: '180'
  }, [{
    trackName: 'Example Song',
    artistName: 'Example Artist',
    duration: 187,
    plainLyrics: 'A line',
    syncedLyrics: '[00:00.00]A line'
  }]);

  assert.equal(response.status, 200);
  assert.equal(response.data.syncedLyrics, '[00:00.00]A line');
  assert.equal(response.data.plainLyrics, 'A line');
});

test('does not return out-of-sync timestamps but can provide plain lyrics', async () => {
  const response = await request({
    title: 'Example Song',
    artist: 'Example Artist',
    duration: '180'
  }, [{
    trackName: 'Example Song',
    artistName: 'Example Artist',
    duration: 210,
    plainLyrics: 'A line',
    syncedLyrics: '[00:00.00]A line'
  }]);

  assert.equal(response.status, 200);
  assert.equal(response.data.plainLyrics, 'A line');
  assert.equal(response.data.syncedLyrics, '');
});

test('rejects invalid duration values', async () => {
  const response = await request({ title: 'Example Song', artist: 'Example Artist', duration: 'Infinity' }, []);
  assert.equal(response.status, 400);
});
