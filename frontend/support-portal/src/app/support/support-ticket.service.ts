import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SupportTicketService {

  // 🔥 MUST MATCH BACKEND
  private baseUrl = 'http://localhost:4000/api/tickets';

  constructor(private http: HttpClient) {}

  // GET ALL TICKETS
  getTickets() {
    return this.http.get<any[]>(`${this.baseUrl}/tickets`);
  }

  // GET SINGLE TICKET
  getTicketById(id: number) {
    return this.http.get(`${this.baseUrl}/tickets/${id}`);
  }

  // UPDATE STATUS
  updateStatus(id: number, status: string) {
    return this.http.patch(
      `${this.baseUrl}/tickets/${id}/status`,
      { status }
    );
  }

  // SEND REPLY
  sendReply(id: number, replyText: string) {
    return this.http.post(
      `${this.baseUrl}/tickets/${id}/reply`,
      { replyText }
    );
  }
}
