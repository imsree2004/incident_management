import { Routes } from '@angular/router';

import { SupportLayoutComponent } from './layout/support-layout.component';
import { SupportDashboardComponent } from './dashboard/support-dashboard.component';
import { SupportTicketsComponent } from './tickets/support-tickets.component';
import { TicketDetailComponent } from './tickets/ticket-detail.component';
import { SupportLoginComponent } from './login/support-login.component';

export const supportRoutes: Routes = [

  // PUBLIC
  {
    path: 'login',
    component: SupportLoginComponent
  },

  // SUPPORT AREA (NO AUTH FOR TICKETS)
  {
    path: '',
    component: SupportLayoutComponent,
    children: [
      { path: 'dashboard', component: SupportDashboardComponent },
      { path: 'tickets', component: SupportTicketsComponent },
      { path: 'tickets/:id', component: TicketDetailComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
