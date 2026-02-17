import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupportTicketService } from '../support-ticket.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-detail.component.html'
})
export class TicketDetailComponent implements OnInit {

  ticket: any = null;
  showEmail = false;
  replyText = '';

  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: SupportTicketService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTicket(id);
  }

  loadTicket(id: number): void {
    this.ticketService.getTicketById(id).subscribe({
      next: (data: any) => {
        // 🔥 Normalize backend response
        this.ticket = {
          id,
          aiSummary: data.aiSummary,
          aiInsights: data.aiInsights,
          originalEmail: data.originalEmail,
          status: data.aiSummary?.severity || 'Open'
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load ticket details';
        this.isLoading = false;
      }
    });
  }

  sendReply(): void {
    this.ticketService.sendReply(this.ticket.id, this.replyText).subscribe(() => {
      alert('Reply sent');
      this.replyText = '';
    });
  }

  updateStatus(status: string): void {
    this.ticketService.updateStatus(this.ticket.id, status).subscribe(() => {
      alert(`Status updated to ${status}`);
      this.ticket.status = status;
    });
  }
}
