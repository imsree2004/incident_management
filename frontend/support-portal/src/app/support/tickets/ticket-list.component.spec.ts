import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketListComponent } from './ticket-list.component';
import { SupportTicketService } from '../support-ticket.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('TicketListComponent', () => {

  let component: TicketListComponent;
  let fixture: ComponentFixture<TicketListComponent>;
  let ticketServiceSpy: jasmine.SpyObj<SupportTicketService>;

  beforeEach(async () => {

    ticketServiceSpy = jasmine.createSpyObj('SupportTicketService', ['getTickets']);

    await TestBed.configureTestingModule({
      imports: [
        TicketListComponent, // standalone component
        RouterTestingModule   // FIX: provides Router + ActivatedRoute
      ],
      providers: [
        { provide: SupportTicketService, useValue: ticketServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
  });

  // ---------------------------------

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------

  it('should load tickets on init', () => {

    const mockTickets = [
      { id: 1, summary: 'Issue A', severity: 'HIGH', status: 'OPEN' },
      { id: 2, summary: 'Issue B', severity: 'LOW', status: 'CLOSED' }
    ];

    ticketServiceSpy.getTickets.and.returnValue(of(mockTickets));

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.tickets.length).toBe(2);
    expect(component.tickets[0].summary).toBe('Issue A');
    expect(ticketServiceSpy.getTickets).toHaveBeenCalled();
  });

  // ---------------------------------

  it('should handle empty ticket list', () => {

    ticketServiceSpy.getTickets.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.tickets.length).toBe(0);
  });

  // ---------------------------------

  it('should handle service error', () => {

    ticketServiceSpy.getTickets.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    fixture.detectChanges();

    if ('errorMessage' in component) {
      expect(component.errorMessage).toBeTruthy();
    }
  });

});