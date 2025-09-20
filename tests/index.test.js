const request = require('supertest');
const { createApp } = require('../src/index');

let app;

beforeAll(async () => {
  app = await createApp();
});

describe('Index.js routes', () => {
  test('Non-GET methods on /jwks return 405', async () => {
    const res = await request(app).post('/jwks');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Method Not Allowed');
  });

  test('Non-POST methods on /auth return 405', async () => {
    const res = await request(app).get('/auth');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Method Not Allowed');
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('Non-GET methods on /health return 405', async () => {
    const res = await request(app).post('/health');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Method Not Allowed');
  });
});

test('Non-GET methods on /.well-known/jwks.json return 405', async () => {
  const res = await request(app).post('/.well-known/jwks.json');
  expect(res.status).toBe(405);
  expect(res.body).toHaveProperty('error', 'Method Not Allowed');
});
