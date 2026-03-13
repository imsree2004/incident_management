process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const request = require('supertest');
const { sequelize, Admin } = require('../models');
const app = require('../server'); // keep server after model imports

// -----------------------------

beforeEach(async () => {
  // ensure admin table exists
  await Admin.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

// -----------------------------

describe('Admin Auth API', () => {

  test('should allow admin registration', async () => {

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin1',
        email: 'admin1@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.username).toBe('admin1');
  });


  test('should allow registration after an admin already exists', async () => {

    await Admin.create({
      username: 'existing-admin',
      email: 'existing@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin3',
        email: 'admin3@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('admin3');
  });


  test('should reject duplicate email during registration', async () => {

    await Admin.create({
      username: 'existing-admin',
      email: 'existing@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin4',
        email: 'existing@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });


  test('should reject duplicate username during registration', async () => {

    await Admin.create({
      username: 'existing-admin',
      email: 'existing@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'existing-admin',
        email: 'admin5@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });


  test('should login with correct credentials', async () => {

    await Admin.create({
      username: 'loginadmin',
      email: 'login@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginadmin',
        password: '123456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });


  test('should reject wrong password', async () => {

    await Admin.create({
      username: 'wrongpass',
      email: 'wrong@test.com',
      password: '123456'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'wrongpass',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
  });


  test('should reject invalid login payloads with a consistent validation response', async () => {

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: '',
        password: '123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

});