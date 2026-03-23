import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupportAuthService } from '../../services/support-auth.service';
import { SupportDashboardMetrics, SupportTicketService } from '../../services/support-ticket.service';

@Component({
  selector: 'app-support-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './support-dashboard.component.html',
  styleUrls: ['./support-dashboard.component.css']
})
export class SupportDashboardComponent implements OnInit {

  activeTab = 'tickets';
  readonly currentUser$;
  metrics: SupportDashboardMetrics = {
    assignedTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    resolvedToday: 0,
    pendingTickets: 0
  };
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: SupportAuthService,
    private ticketService: SupportTicketService
  ) {
    this.currentUser$ = this.authService.support$;
  }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ticketService.getDashboardMetrics().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load dashboard metrics right now. Please try again.';
        this.isLoading = false;
      }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  retryLoad(): void {
    this.loadMetrics();
  }
}