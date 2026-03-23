import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';

export interface SystemMetrics {
  totalEmails: number;
  processedToday: number;
  openTickets: number;
  autoReplies: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab = 'operations';
  menuOpen = false;
  metrics: SystemMetrics = {
    totalEmails: 0,
    processedToday: 0,
    openTickets: 0,
    autoReplies: 0
  };
  isLoading = true;
  errorMessage = '';
  readonly currentAdmin$;
  readonly notification$;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {
    this.currentAdmin$ = this.authService.currentAdmin$;
    this.notification$ = this.notificationService.notification$;
  }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getMetrics().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'We could not load the latest dashboard metrics. Please try again.';
        this.isLoading = false;
        this.notificationService.showError('Dashboard metrics failed to load.');
      }
    });
  }

  retryLoad(): void {
    this.loadMetrics();
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  hasMetricData(): boolean {
    return Object.values(this.metrics).some(value => value > 0);
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
  }
}