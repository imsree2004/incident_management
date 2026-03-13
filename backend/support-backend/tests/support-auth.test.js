import request from 'supertest';
import app from '../src/server.js';
import sequelize from '../src/config/database.js';

describe('Support Agent Authentication', () => {

  const uniqueId = Date.now();

  const agent = {
    username: `agent_auth_test_${uniqueId}`,
    email: `agent_auth_test_${uniqueId}@test.com`,
    password: 'password123'
  };

  afterAll(async () => {
    await sequelize.close();
  });

  test('should register a new support agent', async () => {
    const res = await request(app)
      .post('/api/support/auth/register')
      .send(agent);

    expect(res.statusCode).toBe(201);
  });

  test('should not allow duplicate username', async () => {
    const res = await request(app)
      .post('/api/support/auth/register')
      .send(agent);

    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Username already exists'
    });
  });

  test('should login successfully and return token', async () => {
    const res = await request(app)
      .post('/api/support/auth/login')
      .send({
        username: agent.username,
        password: agent.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Login successful',
      data: {
        id: expect.any(Number),
        username: agent.username,
        email: agent.email,
        token: expect.any(String)
      }
    });
  });

  test('should login successfully with different username casing', async () => {
    const res = await request(app)
      .post('/api/support/auth/login')
      .send({
        username: agent.username.toUpperCase(),
        password: agent.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Login successful',
      data: {
        username: agent.username,
        token: expect.any(String)
      }
    });
  });

});