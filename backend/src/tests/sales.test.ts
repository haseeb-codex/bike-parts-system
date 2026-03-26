const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const SalesTransaction = require('@/models/SalesTransaction');
const Product = require('@/models/Product');
const Inventory = require('@/models/Inventory');
const InventoryMovement = require('@/models/InventoryMovement');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Sales Module', () => {
  let managerToken;
  let adminToken;
  let createdSaleId;
  let productCode;
  let inventoryId;

  beforeAll(async () => {
    await connectDatabase();

    const managerEmail = `${uniqueId('sales-manager')}@example.com`;
    const adminEmail = `${uniqueId('sales-admin')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Sales Manager',
      email: managerEmail,
      password,
      role: 'manager',
    });

    await request(app).post('/api/auth/register').send({
      name: 'Sales Admin',
      email: adminEmail,
      password,
      role: 'admin',
    });

    const managerLoginRes = await request(app).post('/api/auth/login').send({ email: managerEmail, password });
    const adminLoginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password });

    managerToken = managerLoginRes.body?.data?.token;
    adminToken = adminLoginRes.body?.data?.token;

    productCode = uniqueId('PRD-SALE').toUpperCase();

    await Product.create({
      name: 'Sales Test Product',
      code: productCode,
      bikeModel: 'Honda CD70',
      category: 'Mirror',
      sellingPrice: 500,
      currentStock: 100,
    });

    const inventory = await Inventory.create({
      productCode,
      productName: 'Sales Test Product',
      quantityAvailable: 100,
      reorderLevel: 20,
    });

    inventoryId = inventory._id;
  });

  afterAll(async () => {
    if (createdSaleId) {
      await SalesTransaction.findByIdAndDelete(createdSaleId);
    }
    if (inventoryId) {
      await InventoryMovement.deleteMany({ inventoryId });
      await Inventory.findByIdAndDelete(inventoryId);
    }
    if (productCode) {
      await Product.deleteOne({ code: productCode });
    }

    await mongoose.connection.close();
  });

  test('POST /api/sales creates sale and deducts stock', async () => {
    const response = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        transactionNumber: uniqueId('SAL'),
        productCode,
        quantity: 10,
        unitPrice: 500,
        customerName: 'Ahmed Raza',
        saleDate: new Date().toISOString(),
        paymentMethod: 'cash',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalAmount).toBe(5000);
    createdSaleId = response.body.data._id;

    const product = await Product.findOne({ code: productCode });
    const inventory = await Inventory.findOne({ productCode });
    expect(product.currentStock).toBe(90);
    expect(inventory.quantityAvailable).toBe(90);
  });

  test('GET /api/sales returns list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/sales')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('PUT /api/sales/:id updates non-stock fields', async () => {
    const response = await request(app)
      .put(`/api/sales/${createdSaleId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ notes: 'Updated notes' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notes).toBe('Updated notes');
  });

  test('DELETE /api/sales/:id requires admin role and restores stock', async () => {
    const managerDelete = await request(app)
      .delete(`/api/sales/${createdSaleId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(managerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/sales/${createdSaleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDelete.statusCode).toBe(200);
    expect(adminDelete.body.success).toBe(true);
    createdSaleId = null;

    const product = await Product.findOne({ code: productCode });
    const inventory = await Inventory.findOne({ productCode });
    expect(product.currentStock).toBe(100);
    expect(inventory.quantityAvailable).toBe(100);
  });

  test('GET /api/sales requires auth', async () => {
    const response = await request(app).get('/api/sales');
    expect(response.statusCode).toBe(401);
  });
});
