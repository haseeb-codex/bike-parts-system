const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const PurchaseOrder = require('@/models/PurchaseOrder');
const Material = require('@/models/Material');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Purchase Module', () => {
  let managerToken;
  let adminToken;
  let createdPurchaseId;
  let materialCode;

  beforeAll(async () => {
    await connectDatabase();

    const managerEmail = `${uniqueId('purchase-manager')}@example.com`;
    const adminEmail = `${uniqueId('purchase-admin')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Purchase Manager',
      email: managerEmail,
      password,
      role: 'manager',
    });

    await request(app).post('/api/auth/register').send({
      name: 'Purchase Admin',
      email: adminEmail,
      password,
      role: 'admin',
    });

    const managerLoginRes = await request(app).post('/api/auth/login').send({ email: managerEmail, password });
    const adminLoginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password });

    managerToken = managerLoginRes.body?.data?.token;
    adminToken = adminLoginRes.body?.data?.token;

    materialCode = uniqueId('MAT-PUR').toUpperCase();
    await Material.create({
      name: 'Purchase Test Material',
      code: materialCode,
      type: 'PP',
      quantityInStock: 100,
      reorderLevel: 20,
      unitCost: 200,
      supplierName: 'Supplier A',
    });
  });

  afterAll(async () => {
    if (createdPurchaseId) {
      await PurchaseOrder.findByIdAndDelete(createdPurchaseId);
    }
    if (materialCode) {
      await Material.deleteOne({ code: materialCode });
    }
    await mongoose.connection.close();
  });

  test('POST /api/purchases creates purchase and increases material stock', async () => {
    const response = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        purchaseNumber: uniqueId('PUR'),
        materialCode,
        quantity: 25,
        unitCost: 200,
        supplierName: 'Supplier A',
        purchaseDate: new Date().toISOString(),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalAmount).toBe(5000);
    createdPurchaseId = response.body.data._id;

    const material = await Material.findOne({ code: materialCode });
    expect(material.quantityInStock).toBe(125);
  });

  test('GET /api/purchases returns list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('PUT /api/purchases/:id updates purchase non-stock fields', async () => {
    const response = await request(app)
      .put(`/api/purchases/${createdPurchaseId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ notes: 'Received with check' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notes).toBe('Received with check');
  });

  test('DELETE /api/purchases/:id requires admin and rolls back stock', async () => {
    const managerDelete = await request(app)
      .delete(`/api/purchases/${createdPurchaseId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(managerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/purchases/${createdPurchaseId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDelete.statusCode).toBe(200);
    expect(adminDelete.body.success).toBe(true);
    createdPurchaseId = null;

    const material = await Material.findOne({ code: materialCode });
    expect(material.quantityInStock).toBe(100);
  });

  test('GET /api/purchases requires auth', async () => {
    const response = await request(app).get('/api/purchases');
    expect(response.statusCode).toBe(401);
  });
});
