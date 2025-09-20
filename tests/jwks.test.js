const request = require('supertest');
const { createApp } = require('../src/index');

let app;

beforeAll(async () => {
  app = await createApp();
});

describe('JWKS endpoint', () => {
  test('GET /jwks returns 200 and contains keys array', async () => {
    const res = await request(app).get('/jwks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('keys');
    expect(Array.isArray(res.body.keys)).toBe(true);

    // Each JWK must have kid and alg or use
    res.body.keys.forEach((k) => {
      expect(k).toHaveProperty('kid');
      expect(k.kid).toMatch(/key-|expired-/);
      expect(k).toHaveProperty('alg', 'RS256');
      expect(k).toHaveProperty('use', 'sig');
    });
  });

  test('Expired key is not returned in JWKS', async () => {
    const res = await request(app).get('/.well-known/jwks.json');
    expect(res.status).toBe(200);

    const kids = res.body.keys.map((k) => k.kid);

    // At least one non-expired key
    expect(kids.some((kid) => !kid.startsWith('expired-'))).toBe(true);

    // No expired should be returned
    expect(kids.every((kid) => !kid.startsWith('expired-'))).toBe(true);
  });
});
