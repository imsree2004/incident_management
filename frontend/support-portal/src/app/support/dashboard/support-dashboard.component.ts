import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-dashboard.component.html',
  styleUrls: ['./support-dashboard.component.css']
})
export class SupportDashboardComponent {
  activeTab = 'tickets';

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
