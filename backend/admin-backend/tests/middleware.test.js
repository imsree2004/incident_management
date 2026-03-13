process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const sequelize = require('../config/database');
const Admin = require('../models/Admin');

describe('Auth Middleware Token Verification', () => {
  let validToken;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const admin = await Admin.create({
      username: 'middleware-admin',
      email: 'middleware@test.com',
      password: '123456'
    });

    validToken = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should allow access with valid token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Access granted');
    expect(res.body.data.adminId).toBeDefined();
  });

  test('should reject request without token', async () => {
    const res = await request(app)
      .get('/api/protected');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authorization token missing or malformed');
  });

  test('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Token is invalid or expired');
  });

});