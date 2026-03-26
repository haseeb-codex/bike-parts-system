const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const Inventory = require('@/models/Inventory');
const InventoryMovement = require('@/models/InventoryMovement');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Inventory Module', () => {
  let managerToken;
  let adminToken;
  let createdInventoryId;

  beforeAll(async () => {
    await connectDatabase();

    const managerEmail = `${uniqueId('inventory-manager')}@example.com`;
    const adminEmail = `${uniqueId('inventory-admin')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Inventory Manager',
      email: managerEmail,
      password,
      role: 'manager',
    });

    await request(app).post('/api/auth/register').send({
      name: 'Inventory Admin',
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
    if (createdInventoryId) {
      await Inventory.findByIdAndDelete(createdInventoryId);
      await InventoryMovement.deleteMany({ inventoryId: createdInventoryId });
    }
    await mongoose.connection.close();
  });

  test('POST /api/inventory creates inventory record', async () => {
    const response = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        productCode: uniqueId('PRD-INV'),
        productName: 'Inventory Test Product',
        quantityAvailable: 150,
        reorderLevel: 40,
        location: 'Main Warehouse',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    createdInventoryId = response.body.data._id;
  });

  test('GET /api/inventory returns list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('PATCH /api/inventory/:id/adjust creates movement and updates stock', async () => {
    const response = await request(app)
      .patch(`/api/inventory/${createdInventoryId}/adjust`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        type: 'out',
        quantity: 20,
        reason: 'Issued for production batch',
        reference: uniqueId('ISSUE'),
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantityAvailable).toBe(130);

    const movementRes = await request(app)
      .get(`/api/inventory/${createdInventoryId}/movements`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(movementRes.statusCode).toBe(200);
    expect(movementRes.body.success).toBe(true);
    expect(Array.isArray(movementRes.body.data)).toBe(true);
    expect(movementRes.body.data.length).toBeGreaterThan(0);
  });

  test('DELETE /api/inventory/:id requires admin role', async () => {
    const managerDelete = await request(app)
      .delete(`/api/inventory/${createdInventoryId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(managerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/inventory/${createdInventoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDelete.statusCode).toBe(200);
    expect(adminDelete.body.success).toBe(true);
    createdInventoryId = null;
  });

  test('GET /api/inventory requires auth', async () => {
    const response = await request(app).get('/api/inventory');
    expect(response.statusCode).toBe(401);
  });
});
