import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationSubject = new BehaviorSubject<NotificationState | null>(null);
  readonly notification$ = this.notificationSubject.asObservable();
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: NotificationState['type'] = 'info', duration = 3500): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }

    this.notificationSubject.next({ message, type });
    this.clearTimer = setTimeout(() => this.clear(), duration);
  }

  showSuccess(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  clear(): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }

    this.notificationSubject.next(null);
  }
}