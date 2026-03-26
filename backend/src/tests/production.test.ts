const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const ProductionRecord = require('@/models/ProductionRecord');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Production Module', () => {
  let managerToken;
  let adminToken;
  let createdRecordId;

  beforeAll(async () => {
    await connectDatabase();

    const managerEmail = `${uniqueId('production-manager')}@example.com`;
    const adminEmail = `${uniqueId('production-admin')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Production Manager',
      email: managerEmail,
      password,
      role: 'manager',
    });

    await request(app).post('/api/auth/register').send({
      name: 'Production Admin',
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
    if (createdRecordId) {
      await ProductionRecord.findByIdAndDelete(createdRecordId);
    }
    await mongoose.connection.close();
  });

  test('POST /api/production creates production record with manager role', async () => {
    const response = await request(app)
      .post('/api/production')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        productionNumber: uniqueId('PRD-REC'),
        productCode: 'PRD-MF-CD70',
        machineCode: 'MCH-01',
        shift: 'morning',
        quantityProduced: 220,
        quantityRejected: 5,
        productionDate: new Date().toISOString(),
        operatorName: 'Ali Raza',
        status: 'completed',
        notes: 'Stable run',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    createdRecordId = response.body.data._id;
  });

  test('GET /api/production returns list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/production')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('PUT /api/production/:id updates production record', async () => {
    const response = await request(app)
      .put(`/api/production/${createdRecordId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ quantityRejected: 7 });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantityRejected).toBe(7);
  });

  test('DELETE /api/production/:id requires admin role', async () => {
    const managerDelete = await request(app)
      .delete(`/api/production/${createdRecordId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(managerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/production/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDelete.statusCode).toBe(200);
    expect(adminDelete.body.success).toBe(true);
    createdRecordId = null;
  });

  test('GET /api/production requires auth', async () => {
    const response = await request(app).get('/api/production');
    expect(response.statusCode).toBe(401);
  });
});
