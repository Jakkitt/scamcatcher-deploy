import test from 'node:test';
import assert from 'node:assert/strict';
import { csrfProtection } from '../src/middlewares/csrf.js';
import { COOKIE_NAMES } from '../src/utils/cookies.js';

function createRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
}

test('csrf middleware allows safe methods without tokens', () => {
  let nextCalled = false;
  const req = { method: 'GET', cookies: {}, path: '/' };
  const res = createRes();
  csrfProtection()(req, res, () => {
    nextCalled = true;
  });
  assert.equal(res.statusCode, 200);
  assert.ok(nextCalled);
});

test('csrf middleware blocks unsafe methods without matching tokens', () => {
  const req = { method: 'POST', cookies: {}, path: '/api/test', baseUrl: '' };
  const res = createRes();
  let nextCalled = false;
  csrfProtection()(req, res, () => {
    nextCalled = true;
  });
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload?.error?.message, 'CSRF token mismatch');
  assert.equal(nextCalled, false);
});

test('csrf middleware allows matching tokens on unsafe methods', () => {
  let nextCalled = false;
  const token = 'abc123';
  const req = {
    method: 'POST',
    cookies: { [COOKIE_NAMES.csrf]: token },
    path: '/api/secure',
    baseUrl: '',
    get: (header) => (header.toLowerCase() === 'x-csrf-token' ? token : ''),
  };
  const res = createRes();
  csrfProtection()(req, res, () => {
    nextCalled = true;
  });
  assert.equal(res.statusCode, 200);
  assert.ok(nextCalled);
});
