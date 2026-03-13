import request from 'supertest';
import app from '../src/server.js';
import Ticket from '../src/models/Ticket.js';
import sequelize from '../src/config/database.js';

describe('Ticket Routes', () => {

  let token;
  let ticketId;
  const uniqueId = Date.now();

  const agent = {
    username: `agent_ticket_test_${uniqueId}`,
    email: `agent_ticket_test_${uniqueId}@test.com`,
    password: 'password123'
  };

  beforeAll(async () => {

    // Register agent
    await request(app).post('/api/support/auth/register').send(agent);

    // Login agent
    const loginRes = await request(app)
      .post('/api/support/auth/login')
      .send({
        username: agent.username,
        password: agent.password
      });

    token = loginRes.body.data.token;

    // ✅ Create ticket directly in DB
    const newTicket = await Ticket.create({
      summary: 'Test ticket',
      severity: 'HIGH',
      status: 'OPEN'
    });

    ticketId = newTicket.id;  // ✅ inside beforeAll
  });

  afterAll(async () => {
    await sequelize.close();  // ✅ close DB
  });

  // -----------------------------

  test('should get all tickets', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Tickets retrieved successfully',
      data: {
        tickets: expect.any(Array)
      },
      meta: expect.objectContaining({
        page: 1,
        limit: 10,
        totalItems: expect.any(Number),
        totalPages: expect.any(Number)
      })
    });
  });

  test('should get dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/tickets/metrics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Dashboard metrics retrieved successfully',
      data: expect.objectContaining({
        assignedTickets: expect.any(Number),
        openTickets: expect.any(Number),
        pendingTickets: expect.any(Number),
        resolvedTickets: expect.any(Number),
        resolvedToday: expect.any(Number)
      })
    });
  });

  test('should get ticket by ID', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Ticket retrieved successfully',
      data: expect.objectContaining({
        id: ticketId,
        status: expect.any(String)
      })
    });
  });

  test('should return 404 for invalid ticket ID', async () => {
    const res = await request(app)
      .get('/api/tickets/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('should update ticket status', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CLOSED' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Status updated',
      data: {
        id: ticketId,
        status: 'CLOSED'
      }
    });
  });

  test('should send reply', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/reply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ replyText: 'Issue resolved' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Reply sent',
      data: {
        id: ticketId,
        draftReply: 'Issue resolved'
      }
    });
  });

});