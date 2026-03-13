import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SupportTicketService } from './support-ticket.service';
import { environment } from '../../environments/environment';

describe('SupportTicketService', () => {

  let service: SupportTicketService;
  let httpMock: HttpTestingController;

  const BASE_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SupportTicketService]
    });

    service = TestBed.inject(SupportTicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all tickets', () => {

    const mockTickets = [
      { id: 1, summary: 'Issue A', severity: 'HIGH', status: 'OPEN' },
      { id: 2, summary: 'Issue B', severity: 'LOW', status: 'CLOSED' }
    ];

    service.getTickets().subscribe((tickets: any[]) => {
      expect(tickets.length).toBe(2);
      expect(tickets[0].summary).toBe('Issue A');
    });

    const req = httpMock.expectOne(`${BASE_URL}/tickets`);
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'Tickets retrieved successfully',
      data: { tickets: mockTickets },
      meta: { page: 1, limit: 10, totalItems: 2, totalPages: 1 }
    });
  });

  it('should fetch ticket by ID', () => {

    const mockTicket = {
      id: 1,
      aiSummary: {
        category: 'Bug',
        severity: 'HIGH',
        confidence: 0.9,
        description: 'Test issue'
      },
      aiInsights: 'AI insights text',
      originalEmail: 'Original email content'
    };

    service.getTicketById(1).subscribe((ticket: any) => {
      expect(ticket.aiSummary.category).toBe('Bug');
    });

    const req = httpMock.expectOne(`${BASE_URL}/tickets/1`);
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'Ticket retrieved successfully',
      data: mockTicket
    });
  });

  it('should fetch dashboard metrics', () => {
    const mockMetrics = {
      assignedTickets: 4,
      openTickets: 2,
      pendingTickets: 2,
      resolvedTickets: 7,
      resolvedToday: 1
    };

    service.getDashboardMetrics().subscribe(metrics => {
      expect(metrics.assignedTickets).toBe(4);
      expect(metrics.resolvedToday).toBe(1);
    });

    const req = httpMock.expectOne(`${BASE_URL}/tickets/metrics`);
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'Dashboard metrics retrieved successfully',
      data: mockMetrics
    });
  });

  it('should update ticket status', () => {

    service.updateStatus(1, 'CLOSED').subscribe((res: any) => {
      expect(res.message).toBe('Status updated');
    });

    const req = httpMock.expectOne(`${BASE_URL}/tickets/1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('CLOSED');

    req.flush({
      success: true,
      message: 'Status updated',
      data: { id: 1, status: 'CLOSED' }
    });
  });

  it('should send reply to ticket', () => {

    service.sendReply(1, 'Issue resolved').subscribe((res: any) => {
      expect(res.message).toBe('Reply sent');
    });

    const req = httpMock.expectOne(`${BASE_URL}/tickets/1/reply`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.replyText).toBe('Issue resolved');

    req.flush({
      success: true,
      message: 'Reply sent',
      data: { id: 1, draftReply: 'Issue resolved' }
    });
  });

});