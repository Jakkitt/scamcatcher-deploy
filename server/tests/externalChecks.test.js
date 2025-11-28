import test from 'node:test';
import assert from 'node:assert/strict';

process.env.BLACKLISTSELLER_API_URL = 'https://api.test/api/api/v1/queries';
process.env.BLACKLISTSELLER_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';

const { queryBlacklistSeller, __clearExternalCache } = await import('../src/services/externalChecks.js');

test('queryBlacklistSeller prefers explicit first/last names', async () => {
  __clearExternalCache();
  const originalFetch = globalThis.fetch;
  let calledWith;

  globalThis.fetch = async (url, init) => {
    calledWith = { url, init };
    const payload = { data: [{ name: 'mock-name' }] };
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const result = await queryBlacklistSeller({ firstName: 'สมชาย', lastName: 'ใจดี' });

  assert.ok(result.found);
  assert.ok(calledWith);
  assert.equal(calledWith.url, 'https://api.test/api/api/v1/queries/fullname-detail/');
  assert.equal(calledWith.init.method, 'POST');
  assert.equal(calledWith.init.headers['X-API-Key'], 'test-key');
  const sentBody = JSON.parse(calledWith.init.body);
  assert.equal(sentBody.first_name, 'สมชาย');
  assert.equal(sentBody.last_name, 'ใจดี');

  globalThis.fetch = originalFetch;
});

test('queryBlacklistSeller caches identical requests', async () => {
  __clearExternalCache();
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  globalThis.fetch = async () => {
    callCount += 1;
    const payload = { data: [{ name: 'cached-name' }] };
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  await queryBlacklistSeller({ name: 'ชื่อ ทดสอบ' });
  await queryBlacklistSeller({ name: 'ชื่อ ทดสอบ' });

  assert.equal(callCount, 1);

  globalThis.fetch = originalFetch;
});
