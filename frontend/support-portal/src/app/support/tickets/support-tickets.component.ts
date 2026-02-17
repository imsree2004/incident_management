import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupportTicketService } from '../support-ticket.service';

@Component({
  selector: 'app-support-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.css']
})
export class SupportTicketsComponent implements OnInit {

  tickets: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private ticketService: SupportTicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load tickets';
        this.isLoading = false;
      }
    });
  }

  openTicket(id: number): void {
    this.router.navigate(['/support/tickets', id]);
  }
}
