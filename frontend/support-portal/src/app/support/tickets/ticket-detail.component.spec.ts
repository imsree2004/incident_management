import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketDetailComponent } from './ticket-detail.component';
import { SupportTicketService } from '../support-ticket.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('TicketDetailComponent', () => {

  let component: TicketDetailComponent;
  let fixture: ComponentFixture<TicketDetailComponent>;
  let ticketServiceSpy: jasmine.SpyObj<SupportTicketService>;

  const mockTicket = {
    id: 1,
    summary: 'Test issue',
    severity: 'HIGH',
    status: 'OPEN',
    aiSummary: {
      category: 'Bug',
      severity: 'HIGH',
      confidence: 0.95,
      description: 'Test issue'
    },
    aiInsights: 'AI insights content',
    originalEmail: 'Original email body'
  };

  beforeEach(async () => {

    ticketServiceSpy = jasmine.createSpyObj('SupportTicketService', [
      'getTicketById',
      'updateStatus',
      'sendReply'
    ]);

    await TestBed.configureTestingModule({
      imports: [CommonModule, TicketDetailComponent],
      providers: [
        { provide: SupportTicketService, useValue: ticketServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetailComponent);
    component = fixture.componentInstance;

  });

  // ---------------------------------

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------

it('should load ticket details on init', () => {

  ticketServiceSpy.getTicketById.and.returnValue(of(mockTicket));

  fixture.detectChanges(); // triggers ngOnInit

  expect(ticketServiceSpy.getTicketById).toHaveBeenCalledWith(1);

  expect(component.ticket).not.toBeNull();
  const ticket = component.ticket!;

  expect(ticket.aiSummary.category).toBe('Bug');
  expect(ticket.aiSummary.severity).toBe('HIGH');
  expect(ticket.aiInsights).toBe('AI insights content');

});

  // ---------------------------------

  it('should update ticket status', () => {

    ticketServiceSpy.getTicketById.and.returnValue(of(mockTicket));
    ticketServiceSpy.updateStatus.and.returnValue(of({ message: 'Status updated' }));

    fixture.detectChanges();

    component.updateStatus('CLOSED');

    expect(ticketServiceSpy.updateStatus).toHaveBeenCalledWith(1, 'CLOSED');

  });

  // ---------------------------------

  it('should send reply', () => {

    ticketServiceSpy.getTicketById.and.returnValue(of(mockTicket));
    ticketServiceSpy.sendReply.and.returnValue(of({ message: 'Reply sent' }));

    fixture.detectChanges();

    component.replyText = 'Issue resolved';
    component.sendReply();

    expect(ticketServiceSpy.sendReply).toHaveBeenCalledWith(1, 'Issue resolved');

  });

  // ---------------------------------

  it('should handle error while loading ticket', () => {

    ticketServiceSpy.getTicketById.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    fixture.detectChanges();

    expect(component.errorMessage).toBeTruthy();

  });

});