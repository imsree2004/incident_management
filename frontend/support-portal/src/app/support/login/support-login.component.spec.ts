import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SupportTicketService } from '../support-ticket.service';

describe('SupportTicketService', () => {

  let service: SupportTicketService;
  let httpMock: HttpTestingController;

const BASE_URL = 'http://localhost:5001/api';

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

    req.flush(mockTickets);
  });

  it('should fetch ticket by ID', () => {

    const mockTicket = {
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

    req.flush(mockTicket);
  });

  it('should update ticket status', () => {

    service.updateStatus(1, 'CLOSED').subscribe((res: any) => {
      expect(res.message).toBe('Status updated');
    });

    const req = httpMock.expectOne(`${BASE_URL}/tickets/1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('CLOSED');

    req.flush({ message: 'Status updated' });
  });

  it('should send reply to ticket', () => {

    service.sendReply(1, 'Issue resolved').subscribe((res: any) => {
      expect(res.message).toBe('Reply sent');
    });

    const req = httpMock.expectOne(`${BASE_URL}/tickets/1/reply`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.replyText).toBe('Issue resolved');

    req.flush({ message: 'Reply sent' });
  });

});