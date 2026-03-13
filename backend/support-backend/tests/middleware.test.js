import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';

import { authMiddleware, supportOnly } from '../src/middleware/auth.middleware.js';

const app = express();

// Dummy protected route
app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

app.get('/support-only', authMiddleware, supportOnly, (req, res) => {
  res.status(200).json({ message: 'Support access granted' });
});

describe('Auth Middleware Protection', () => {

  let token;

  beforeAll(() => {

    const payload = {
      id: 1,
      username: 'testagent',
      role: 'SUPPORT_AGENT'
    };

    const secret = process.env.JWT_SECRET;

    token = jwt.sign(payload, secret);

  });

  test('should allow access with valid token', async () => {

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

  });

  test('should allow support-only route with support agent role', async () => {
    const res = await request(app)
      .get('/support-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  test('should reject support-only route with non-support role', async () => {
    const invalidRoleToken = jwt.sign({ id: 2, role: 'ADMIN' }, process.env.JWT_SECRET);

    const res = await request(app)
      .get('/support-only')
      .set('Authorization', `Bearer ${invalidRoleToken}`);

    expect(res.statusCode).toBe(403);
  });

});