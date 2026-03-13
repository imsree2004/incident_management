import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMetrics(): Observable<SystemMetrics> {
    return this.http
      .get<ApiSuccessResponse<SystemMetrics>>(`${this.apiUrl}/dashboard/metrics`)
      .pipe(map((response) => response.data));
  }

  getEmailLogs(page: number = 1, limit: number = 10, search: string = ''): Observable<{logs: EmailLog[], total: number}> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    return this.http
      .get<ApiSuccessResponse<{ logs: EmailLog[] }>>(`${this.apiUrl}/dashboard/email-logs`, { params })
      .pipe(
        map((response) => ({
          logs: response.data.logs,
          total: response.meta?.totalItems ?? response.data.logs.length
        }))
      );
  }

  getTickets(page: number = 1, limit: number = 10, status: string = ''): Observable<{tickets: Ticket[], total: number}> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (status) params.status = status;
    return this.http
      .get<ApiSuccessResponse<{ tickets: Ticket[] }>>(`${this.apiUrl}/dashboard/tickets`, { params })
      .pipe(
        map((response) => ({
          tickets: response.data.tickets,
          total: response.meta?.totalItems ?? response.data.tickets.length
        }))
      );
  }

  updateTicketStatus(ticketId: string, status: string): Observable<{ ticket: Ticket }> {
    return this.http
      .put<ApiSuccessResponse<{ ticket: Ticket }>>(`${this.apiUrl}/dashboard/tickets/${ticketId}`, { status })
      .pipe(map((response) => response.data));
  }
}