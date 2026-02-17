import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupportTicketService } from '../support-ticket.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ticket-list.component.html'
})
export class TicketListComponent implements OnInit {

  tickets: any[] = [];

  constructor(private ticketService: SupportTicketService) {}

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe({
      next: (data: any) => {
        this.tickets = data;
        console.log('Tickets loaded:', this.tickets);
      },
      error: err => {
        console.error('Ticket fetch error', err);
      }
    });
  }
}
