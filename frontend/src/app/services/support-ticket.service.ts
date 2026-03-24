import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SupportDashboardMetrics {
  assignedTickets: number;
  openTickets: number;
  resolvedTickets: number;
  resolvedToday: number;
  pendingTickets: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
}

@Injectable({ providedIn: 'root' })
export class SupportTicketService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET ALL TICKETS
  getTickets() {
    return this.http
      .get<any>(`${this.baseUrl}/tickets`, {
  headers: this.getAuthHeaders()
})
      .pipe(
        map(res => res?.data?.tickets || res?.tickets || res)
      );
  }

  getDashboardMetrics(): Observable<SupportDashboardMetrics> {
    return this.http
      .get<ApiEnvelope<SupportDashboardMetrics> | SupportDashboardMetrics>(`${this.baseUrl}/tickets/metrics`, {
  headers: this.getAuthHeaders()
})
      .pipe(map(res => this.unwrapResponse(res)));
  }

  // GET SINGLE TICKET
  getTicketById(id: number) {
    return this.http
      .get(`${this.baseUrl}/tickets/${id}`, {
  headers: this.getAuthHeaders()
})
      .pipe(map(res => this.unwrapResponse(res)));
  }

  // UPDATE STATUS
  updateStatus(id: number, status: string) {
    return this.http
      .patch<ApiEnvelope<{ id: number; status: string }> | { message: string }>(
        `${this.baseUrl}/tickets/${id}/status`,
        { status },
  { headers: this.getAuthHeaders() }
      )
      .pipe(map(res => this.unwrapActionResponse(res)));
  }

  // SEND REPLY
  sendReply(id: number, replyText: string) {
    return this.http
      .post<ApiEnvelope<{ id: number; draftReply: string }> | { message: string }>(
        `${this.baseUrl}/tickets/${id}/reply`,
        { replyText },
  { headers: this.getAuthHeaders() }
      )
      .pipe(map(res => this.unwrapActionResponse(res)));
  }

  private unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    return response as T;
  }

  private unwrapActionResponse<T extends object>(response: ApiEnvelope<T> | { message: string }) {
    if (response && typeof response === 'object' && 'data' in response) {
      return {
        message: response.message,
        ...response.data
      };
    }

    return response;
  }

  private getAuthHeaders() {
  const stored = localStorage.getItem('supportUser');
  const token = stored ? JSON.parse(stored).token : null;

  return {
    Authorization: `Bearer ${token}`
  };
}

}