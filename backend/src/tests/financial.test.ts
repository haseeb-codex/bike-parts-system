const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const FinancialSummary = require('@/models/FinancialSummary');
const SalesTransaction = require('@/models/SalesTransaction');
const PurchaseOrder = require('@/models/PurchaseOrder');
const Utility = require('@/models/Utility');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Financial Module', () => {
  let managerToken;
  let adminToken;
  let summaryId;

  beforeAll(async () => {
    await connectDatabase();

    const managerEmail = `${uniqueId('financial-manager')}@example.com`;
    const adminEmail = `${uniqueId('financial-admin')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Financial Manager',
      email: managerEmail,
      password,
      role: 'manager',
    });

    await request(app).post('/api/auth/register').send({
      name: 'Financial Admin',
      email: adminEmail,
      password,
      role: 'admin',
    });

    const managerLoginRes = await request(app).post('/api/auth/login').send({ email: managerEmail, password });
    const adminLoginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password });

    managerToken = managerLoginRes.body?.data?.token;
    adminToken = adminLoginRes.body?.data?.token;

    const now = new Date();
    await SalesTransaction.create({
      transactionNumber: uniqueId('FIN-SAL').toUpperCase(),
      productCode: 'PRD-MF-CD70',
      quantity: 5,
      unitPrice: 500,
      totalAmount: 2500,
      customerName: 'Finance Customer',
      paymentMethod: 'cash',
      status: 'completed',
      saleDate: now,
    });

    await PurchaseOrder.create({
      purchaseNumber: uniqueId('FIN-PUR').toUpperCase(),
      materialCode: 'MAT-PP',
      quantity: 10,
      unitCost: 100,
      totalAmount: 1000,
      supplierName: 'Finance Supplier',
      status: 'received',
      purchaseDate: now,
    });

    await Utility.create({
      utilityType: 'electricity',
      billingMonth: now.getUTCMonth() + 1,
      billingYear: now.getUTCFullYear(),
      meterReadingPrevious: 10,
      meterReadingCurrent: 20,
      unitsConsumed: 10,
      unitCost: 20,
      totalAmount: 200,
      billingDate: now,
      dueDate: now,
      status: 'pending',
      vendorName: 'Power Co',
    });
  });

  afterAll(async () => {
    if (summaryId) {
      await FinancialSummary.findByIdAndDelete(summaryId);
    }
    await mongoose.connection.close();
  });

  test('GET /api/financial/summary returns computed summary', async () => {
    const response = await request(app)
      .get('/api/financial/summary')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalSales).toBeGreaterThanOrEqual(2500);
  });

  test('POST /api/financial creates summary snapshot', async () => {
    const now = new Date();
    const response = await request(app)
      .post('/api/financial')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        periodMonth: now.getUTCMonth() + 1,
        periodYear: now.getUTCFullYear(),
        notes: 'Monthly snapshot',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    summaryId = response.body.data._id;
  });

  test('GET /api/financial returns list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/financial')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('DELETE /api/financial/:id requires admin role', async () => {
    const managerDelete = await request(app)
      .delete(`/api/financial/${summaryId}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(managerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/financial/${summaryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminDelete.statusCode).toBe(200);
    expect(adminDelete.body.success).toBe(true);
    summaryId = null;
  });

  test('GET /api/financial requires auth', async () => {
    const response = await request(app).get('/api/financial');
    expect(response.statusCode).toBe(401);
  });
});
