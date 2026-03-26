const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const Material = require('@/models/Material');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Materials Module', () => {
  let token;
  let createdMaterialId;

  beforeAll(async () => {
    await connectDatabase();

    const email = `${uniqueId('materials')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Materials Manager',
      email,
      password,
      role: 'manager',
    });

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    token = loginRes.body?.data?.token;
  });

  afterAll(async () => {
    if (createdMaterialId) {
      await Material.findByIdAndDelete(createdMaterialId);
    }
    await mongoose.connection.close();
  });

  test('POST /api/materials creates material with valid token', async () => {
    const response = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Polypropylene',
        code: uniqueId('MAT'),
        type: 'PP',
        unit: 'kg',
        quantityInStock: 120,
        reorderLevel: 20,
        unitCost: 260,
        supplierName: 'Test Supplier',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    createdMaterialId = response.body.data._id;
  });

  test('GET /api/materials returns material list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/materials')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('PUT /api/materials/:id updates material', async () => {
    const response = await request(app)
      .put(`/api/materials/${createdMaterialId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reorderLevel: 35 });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.reorderLevel).toBe(35);
  });

  test('GET /api/materials requires auth', async () => {
    const response = await request(app).get('/api/materials');
    expect(response.statusCode).toBe(401);
  });
});
