import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailLog {
  id: number;
  from_email: string;
  subject: string;
  content: string;
  category: string;
  severity: string;
  status: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_id: string;
  customer_email: string;
  subject: string;
  category: string;
  severity: string;
  priority: string;
  assigned_to: string;
  status: string;
  created_at: string;
}

export interface SystemMetrics {
  totalEmails: number;
  processedToday: number;
  openTickets: number;
  autoReplies: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  getMetrics(): Observable<SystemMetrics> {
    return this.http.get<SystemMetrics>(`${this.apiUrl}/dashboard/metrics`);
  }

  getEmailLogs(page: number = 1, limit: number = 10, search: string = ''): Observable<{logs: EmailLog[], total: number}> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    return this.http.get<{logs: EmailLog[], total: number}>(`${this.apiUrl}/dashboard/email-logs`, { params });
  }

  getTickets(page: number = 1, limit: number = 10, status: string = ''): Observable<{tickets: Ticket[], total: number}> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (status) params.status = status;
    return this.http.get<{tickets: Ticket[], total: number}>(`${this.apiUrl}/dashboard/tickets`, { params });
  }

  updateTicketStatus(ticketId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/dashboard/tickets/${ticketId}`, { status });
  }
}