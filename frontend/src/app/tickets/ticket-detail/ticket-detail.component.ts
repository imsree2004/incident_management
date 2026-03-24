
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupportTicketService } from '../../services/support-ticket.service';
import { finalize } from 'rxjs/operators';

type ToastType = 'success' | 'error';

interface TicketDetailVm {
  id: number;
  status: string;
  aiSummary: {
    category: string;
    severity: string;
    confidence: number;
    description: string;
  };
  originalEmail: string;
}

interface ToastMessage {
  type: ToastType;
  text: string;
}

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  summaryOpen = true;
  emailOpen = false;

  ticket: TicketDetailVm | null = null;
  currentTicketId = 0;
  replyText = '';
  replyValidationMessage = '';

  isLoading = true;
  isSendingReply = false;
  isUpdatingStatus = false;
  pendingStatus: string | null = null;
  errorMessage = '';
  toastMessage: ToastMessage | null = null;
  private toastTimer: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: SupportTicketService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.isLoading = false;
      this.errorMessage = 'Invalid ticket ID.';
      return;
    }

    this.currentTicketId = id;
    this.loadTicket(id);
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
  }

  retryLoad(): void {
    if (this.currentTicketId) {
      this.loadTicket(this.currentTicketId);
    }
  }

  loadTicket(id: number): void {
    this.currentTicketId = id;
    this.isLoading = true;
    this.errorMessage = '';
    this.ticket = null;

    this.ticketService.getTicketById(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: data => {
        this.ticket = mapTicket(data, id);
      },
      error: (err) => {
        this.errorMessage = err?.status === 404
          ? 'Ticket not found.'
          : 'Failed to load ticket details. Please try again.';
      }
    });
  }

  sendReply(): void {
    const ticket = this.ticket;

    if (!ticket) {
      this.showToast('error', 'Ticket details are not loaded yet.');
      return;
    }

    const replyText = this.replyText.trim();

    if (!replyText) {
      this.replyValidationMessage = 'Reply message cannot be empty.';
      this.showToast('error', this.replyValidationMessage);
      return;
    }

    this.replyValidationMessage = '';
    this.isSendingReply = true;

    this.ticketService.sendReply(ticket.id || this.currentTicketId, replyText).pipe(
      finalize(() => this.isSendingReply = false)
    ).subscribe({
      next: () => {
        this.replyText = '';
        this.showToast('success', 'Reply sent successfully.');
      },
      error: () => {
        this.showToast('error', 'Failed to send reply. Please try again.');
      }
    });
  }

  updateStatus(status: string): void {
    const ticket = this.ticket;

    if (!ticket) {
      this.showToast('error', 'Ticket details are not loaded yet.');
      return;
    }

    if (ticket.status === status) {
      return;
    }

    this.isUpdatingStatus = true;
    this.pendingStatus = status;

    this.ticketService.updateStatus(ticket.id || this.currentTicketId, status).pipe(
      finalize(() => {
        this.isUpdatingStatus = false;
        this.pendingStatus = null;
      })
    ).subscribe({
      next: () => {
        ticket.status = status;
        this.showToast('success', `Ticket marked ${this.formatStatus(status)}.`);
      },
      error: () => {
        this.showToast('error', 'Failed to update ticket status.');
      }
    });
  }

  getConfidencePercentage(confidence: number): number {
    const numericConfidence = Number(confidence) || 0;
    const normalized = numericConfidence <= 1 ? numericConfidence * 100 : numericConfidence;

    return Math.max(0, Math.min(100, Math.round(normalized)));
  }

  severityClass(severity: string): string {
    const normalized = severity.toLowerCase();

    if (normalized.includes('high') || normalized.includes('critical')) {
      return 'high';
    }

    if (normalized.includes('medium')) {
      return 'medium';
    }

    return 'low';
  }

  statusClass(status: string): string {
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  formatStatus(status: string): string {
    return status
      .toLowerCase()
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  getStatusButtonLabel(status: string): string {
    if (this.pendingStatus === status && this.isUpdatingStatus) {
      return 'Updating...';
    }

    return status === 'IN_PROGRESS' ? 'Mark In Progress' : 'Mark Resolved';
  }

  showToast(type: ToastType, text: string): void {
    this.clearToastTimer();
    this.toastMessage = { type, text };
    this.toastTimer = window.setTimeout(() => this.toastMessage = null, 3000);
  }

  private clearToastTimer(): void {
    if (this.toastTimer !== null) {
      window.clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }
}

function mapTicket(data: any, fallbackId: number): TicketDetailVm {
  const aiSummary = data?.aiSummary ?? {};

  return {
    id: data?.id ?? fallbackId,
    status: data?.status ?? 'OPEN',
    aiSummary: {
      category: aiSummary.category ?? data?.category ?? 'Uncategorized',
      severity: aiSummary.severity ?? data?.severity ?? 'Unknown',
      confidence: aiSummary.confidence ?? data?.confidence ?? 0,
      description: aiSummary.description ?? data?.summary ?? 'No summary available.'
    },
    originalEmail: data?.originalEmail ?? 'No original email available.'
  };
}
