const request = require('supertest');
const app = require('../app');

describe('Auth and Health Routes', () => {
  test('GET /api/health returns success response', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/auth/me without token returns unauthorized', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.statusCode).toBe(401);
  });
});
