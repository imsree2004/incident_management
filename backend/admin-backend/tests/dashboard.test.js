process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../server');
const sequelize = require('../config/database');

const { Admin, EmailLog, Ticket, AdminAuditLog } = require('../models');

describe('Admin Dashboard API', () => {

  let token;
  let admin;

  beforeEach(async () => {

    // Ensure all tables exist before tests
    await Admin.sync({ force: true });
    await EmailLog.sync({ force: true });
    await Ticket.sync({ force: true });
    await AdminAuditLog.sync({ force: true });

    admin = await Admin.create({
      username: 'dashboard-admin',
      email: 'dashboard@test.com',
      password: '123456'
    });

    // Token format expected by middleware
    token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // -----------------------------

  test('should return dashboard metrics in a consistent response envelope', async () => {

    await EmailLog.bulkCreate([
      { from_email: 'a@test.com', subject: 'A', status: 'processed' },
      { from_email: 'b@test.com', subject: 'B', status: 'auto_replied' }
    ]);

    await Ticket.bulkCreate([
      { ticket_id: 'T-100', customer_email: 'c@test.com', status: 'open' },
      { ticket_id: 'T-101', customer_email: 'd@test.com', status: 'resolved' }
    ]);

    const res = await request(app)
      .get('/api/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalEmails).toBe(2);
    expect(res.body.data.openTickets).toBe(1);
  });

  // -----------------------------

  test('should reject invalid pagination query values', async () => {

    const res = await request(app)
      .get('/api/dashboard/tickets?page=0&limit=500')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // -----------------------------

  test('should update ticket status and write an audit log entry', async () => {

    await Ticket.create({
      ticket_id: 'T-200',
      customer_email: 'customer@test.com',
      subject: 'Need help',
      status: 'open'
    });

    const res = await request(app)
      .put('/api/dashboard/tickets/T-200')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'resolved' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticket.status).toBe('resolved');

    const auditEntry = await AdminAuditLog.findOne();

    expect(auditEntry).toBeTruthy();
    expect(auditEntry.action).toBe('ticket_status_updated');
    expect(auditEntry.performedByUsername).toBe('dashboard-admin');
  });

});