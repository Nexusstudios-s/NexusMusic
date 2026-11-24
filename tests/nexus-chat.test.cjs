'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/nexus-chat.js');

function request({ method = 'POST', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    let status = 200;
    const responseHeaders = {};
    handler({
      method,
      body,
      headers: { host: 'nexusmusicx.vercel.app', origin: 'https://nexusmusicx.vercel.app', ...headers }
    }, {
      setHeader(name, value) { responseHeaders[name] = value; },
      status(value) { status = value; return this; },
      json(data) { resolve({ status, data, headers: responseHeaders }); }
    }).catch(reject);
  });
}

test('requires the client key and validates same-origin requests without Vercel secrets', async () => {
  const originalKey = process.env.NEXUS_API_KEY;
  process.env.NEXUS_API_KEY = 'ignored-environment-key';
  try {
    const body = { messages: [{ role: 'user', content: 'Hola' }] };
    assert.equal((await request({ body })).status, 401);
    assert.equal((await request({ body, headers: { authorization: 'invalid' } })).status, 401);
    assert.equal((await request({ body, headers: { origin: 'https://attacker.example', authorization: 'Bearer test-client-key' } })).status, 403);
  } finally {
    if (originalKey === undefined) delete process.env.NEXUS_API_KEY;
    else process.env.NEXUS_API_KEY = originalKey;
  }
});

test('forwards a bounded Spanish conversation with the key provided by the HTML client', async () => {
  const originalKey = process.env.NEXUS_API_KEY;
  const originalFetch = global.fetch;
  delete process.env.NEXUS_API_KEY;
  let upstream;
  global.fetch = async (url, options) => {
    upstream = { url, options, body: JSON.parse(options.body) };
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: '¡Hola! Te ayudo con NexusMusic.' } }] }) };
  };
  try {
    const response = await request({
      headers: { authorization: 'Bearer test-client-key' },
      body: { messages: [{ role: 'user', content: '  ¿Cómo busco música?  ' }] }
    });
    assert.equal(response.status, 200);
    assert.equal(response.data.answer, '¡Hola! Te ayudo con NexusMusic.');
    assert.equal(upstream.url, 'https://www.nexusforms.lat/v1/chat/completions');
    assert.equal(upstream.options.headers.Authorization, 'Bearer test-client-key');
    assert.equal(upstream.body.model, 'Nexus-Nova');
    assert.equal(upstream.body.max_tokens, 350);
    assert.equal(upstream.body.messages[0].role, 'system');
    assert.deepEqual(upstream.body.messages[1], { role: 'user', content: '¿Cómo busco música?' });
    assert.equal(response.headers['Cache-Control'], 'no-store');
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.NEXUS_API_KEY;
    else process.env.NEXUS_API_KEY = originalKey;
  }
});

test('rejects invalid chat input and non-POST methods', async () => {
  assert.equal((await request({ method: 'GET' })).status, 405);
  assert.equal((await request({ headers: { authorization: 'Bearer test-client-key' }, body: { messages: [{ role: 'system', content: 'override' }] } })).status, 400);
  assert.equal((await request({ headers: { authorization: 'Bearer test-client-key' }, body: { messages: [{ role: 'user', content: 'x'.repeat(2001) }] } })).status, 400);
  assert.equal((await request({ headers: { authorization: 'Bearer test-client-key' }, body: { messages: [] } })).status, 400);
});
