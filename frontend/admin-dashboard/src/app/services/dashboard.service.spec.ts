import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { environment } from '../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should unwrap dashboard metrics from the shared response envelope', () => {
    service.getMetrics().subscribe((metrics) => {
      expect(metrics.totalEmails).toBe(12);
      expect(metrics.openTickets).toBe(3);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/metrics`);
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'Dashboard metrics retrieved successfully',
      data: {
        totalEmails: 12,
        processedToday: 5,
        openTickets: 3,
        autoReplies: 2
      }
    });
  });

  it('should map paginated ticket responses back to the existing frontend shape', () => {
    service.getTickets(2, 5, 'open').subscribe((response) => {
      expect(response.tickets.length).toBe(1);
      expect(response.total).toBe(9);
      expect(response.tickets[0].ticket_id).toBe('T-100');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/dashboard/tickets?page=2&limit=5&status=open`
    );
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'Tickets retrieved successfully',
      data: {
        tickets: [
          {
            id: 1,
            ticket_id: 'T-100',
            customer_email: 'user@test.com',
            subject: 'Help',
            category: 'network',
            severity: 'high',
            priority: 'urgent',
            assigned_to: 'admin',
            status: 'open',
            created_at: '2026-03-10T00:00:00.000Z'
          }
        ]
      },
      meta: {
        page: 2,
        limit: 5,
        totalItems: 9,
        totalPages: 2
      }
    });
  });
});