const request = require('supertest');
const { jwtVerify, importJWK } = require('jose');
const { createApp } = require('../src/index');
const keystore = require('../src/keystore');

let app;

beforeAll(async () => {
  app = await createApp();
});

async function fetchJwks() {
  const res = await request(app).get('/jwks');
  return res.body;
}

describe('Auth endpoint', () => {
  test('POST /auth returns a valid JWT signed by one of JWKS keys', async () => {
    const res = await request(app).post('/auth');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    const { token } = res.body;

    // Extract header
    const [headerB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
    expect(header).toHaveProperty('kid');

    // Get JWKS and match key
    const jwks = await fetchJwks();
    const jwk = jwks.keys.find((k) => k.kid === header.kid);
    expect(jwk).toBeDefined();

    // Import key and verify token
    const key = await importJWK(jwk, 'RS256');
    const verified = await jwtVerify(token, key, { issuer: 'jwks-server' });
    expect(verified.payload).toHaveProperty('sub', 'test-user');
  });

  test('POST /auth?expired=1 returns token signed with an expired key and token is expired', async () => {
    const res = await request(app).post('/auth?expired=1');

    if (res.status === 404) {
      // No expired key available
      expect(res.body).toHaveProperty('error');
      return;
    }

    expect(res.status).toBe(200);
    const { token } = res.body;

    // Parse header and payload
    const [headerB64, payloadB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));

    // Expired keys are not in JWKS
    const jwks = await fetchJwks();
    const jwk = jwks.keys.find((k) => k.kid === header.kid);
    expect(jwk).toBeUndefined();

    // Ensure exp is in the past
    const now = Math.floor(Date.now() / 1000);
    expect(payload).toHaveProperty('exp');
    expect(payload.exp).toBeLessThanOrEqual(now);
  });
});

test('POST /auth returns 503 if no unexpired key is available', async () => {
  // Temporarily override method
  keystore.getAnUnexpiredKey = () => null;

  const res = await request(app).post('/auth');
  expect(res.status).toBe(503);
  expect(res.body).toHaveProperty('error', 'No unexpired signing key available');
});

test('POST /auth?expired=1 returns 404 if no expired key is available', async () => {
  keystore.getAnExpiredKey = () => null;

  const res = await request(app).post('/auth?expired=1');
  expect(res.status).toBe(404);
  expect(res.body).toHaveProperty('error', 'No expired key available');
});
