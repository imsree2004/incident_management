import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupportTicketService } from '../support-ticket.service';

interface TicketListItem {
  id: number;
  summary: string;
  severity: string;
  status: string;
}

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets: TicketListItem[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private ticketService: SupportTicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ticketService.getTickets().subscribe({
      next: (data: TicketListItem[]) => {
        this.tickets = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load tickets. Please try again.';
        this.isLoading = false;
      }
    });
  }

  retryLoad(): void {
    this.loadTickets();
  }
}