const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Auth and Health Routes', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /api/health returns success response', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /api/auth/register and POST /api/auth/login return success with token', async () => {
    const email = `${uniqueId('auth-user')}@example.com`;
    const password = 'Passw0rd!';

    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Auth User',
      email,
      password,
      role: 'operator',
    });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.token).toBeTruthy();

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeTruthy();
  });

  test('GET /api/auth/me with valid token returns current user', async () => {
    const email = `${uniqueId('auth-me')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Auth Me User',
      email,
      password,
      role: 'manager',
    });

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    const token = loginRes.body?.data?.token;

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(email);
  });

  test('GET /api/auth/me without token returns unauthorized', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.statusCode).toBe(401);
  });
});
