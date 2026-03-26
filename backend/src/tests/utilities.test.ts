const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const Utility = require('@/models/Utility');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Utilities Module', () => {
  let managerToken;
  let adminToken;
  let createdUtilityId;

  beforeAll(async () => {
    await connectDatabase();

    const managerEmail = `${uniqueId('utility-manager')}@example.com`;
    const adminEmail = `${uniqueId('utility-admin')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Utility Manager',
      email: managerEmail,
      password,
      role: 'manager',
    });

    await request(app).post('/api/auth/register').send({
      name: 'Utility Admin',
      email: adminEmail,
      password,
      role: 'admin',
    });

    const managerLoginRes = await request(app).post('/api/auth/login').send({ email: managerEmail, password });
    const adminLoginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password });

    managerToken = managerLoginRes.body?.data?.token;
    adminToken = adminLoginRes.body?.data?.token;
  });

  afterAll(async () => {
    if (createdUtilityId) {
      await Utility.findByIdAndDelete(createdUtilityId);
    }
    await mongoose.connection.close();
  });

  test('POST /api/utilities creates utility record', async () => {
    const response = await request(app)
      .post('/api/utilities')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        utilityType: 'electricity',
        billingMonth: 3,
        billingYear: 2026,
        meterReadingPrevious: 1200,
        meterReadingCurrent: 1450,
        unitCost: 45,
        billingDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        vendorName: 'WAPDA',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.unitsConsumed).toBe(250);
    expect(response.body.data.totalAmount).toBe(11250);
    createdUtilityId = response.body.data._id;
  });

  test('GET /api/utilities returns list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/utilities')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('PUT /api/utilities/:id updates utility record', async () => {
    const response = await request(app)
      .put(`/api/utilities/${createdUtilityId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        meterReadingCurrent: 1500,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.unitsConsumed).toBe(300);
  });

  test('DELETE /api/utilities/:id requires admin role', async () => {
    const managerDelete = await request(app)
      .delete(`/api/utilities/${createdUtilityId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(managerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/utilities/${createdUtilityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDelete.statusCode).toBe(200);
    expect(adminDelete.body.success).toBe(true);
    createdUtilityId = null;
  });

  test('GET /api/utilities requires auth', async () => {
    const response = await request(app).get('/api/utilities');
    expect(response.statusCode).toBe(401);
  });
});
