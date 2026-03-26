const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@/app');
const { connectDatabase } = require('@/config/database');
const Employee = require('@/models/Employee');

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Employees Module', () => {
  let managerToken;
  let adminToken;
  let createdEmployeeId;

  beforeAll(async () => {
    await connectDatabase();

    const managerEmail = `${uniqueId('employee-manager')}@example.com`;
    const adminEmail = `${uniqueId('employee-admin')}@example.com`;
    const password = 'Passw0rd!';

    await request(app).post('/api/auth/register').send({
      name: 'Employee Manager',
      email: managerEmail,
      password,
      role: 'manager',
    });

    await request(app).post('/api/auth/register').send({
      name: 'Employee Admin',
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
    if (createdEmployeeId) {
      await Employee.findByIdAndDelete(createdEmployeeId);
    }
    await mongoose.connection.close();
  });

  test('POST /api/employees creates employee record', async () => {
    const response = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        employeeCode: uniqueId('EMP'),
        name: 'Test Employee',
        department: 'Production',
        designation: 'Machine Operator',
        phone: '03001234567',
        email: `${uniqueId('emp')}@example.com`,
        salary: 45000,
        joiningDate: new Date().toISOString(),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    createdEmployeeId = response.body.data._id;
  });

  test('GET /api/employees returns list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('PUT /api/employees/:id updates employee record', async () => {
    const response = await request(app)
      .put(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        salary: 50000,
        status: 'active',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.salary).toBe(50000);
  });

  test('DELETE /api/employees/:id requires admin role', async () => {
    const managerDelete = await request(app)
      .delete(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(managerDelete.statusCode).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDelete.statusCode).toBe(200);
    expect(adminDelete.body.success).toBe(true);
    createdEmployeeId = null;
  });

  test('GET /api/employees requires auth', async () => {
    const response = await request(app).get('/api/employees');
    expect(response.statusCode).toBe(401);
  });
});
