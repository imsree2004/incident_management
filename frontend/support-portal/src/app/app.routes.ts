import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [

  // LOGIN PAGE
  {
    path: '',
    title: 'Support Login',
    loadComponent: () =>
      import('./support/login/support-login.component')
        .then(m => m.SupportLoginComponent)
  },

  // SUPPORT LAYOUT (SIDEBAR + HEADER)
  {
    path: 'support',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./support/layout/support-layout.component')
        .then(m => m.SupportLayoutComponent),

    children: [

      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () =>
          import('./support/dashboard/support-dashboard.component')
            .then(m => m.SupportDashboardComponent)
      },

      {
        path: 'tickets',
        title: 'Tickets',
        loadComponent: () =>
          import('./support/tickets/ticket-list.component')
            .then(m => m.TicketListComponent)
      },

      {
        path: 'tickets/:id',
        title: 'Ticket Details',
        loadComponent: () =>
          import('./support/tickets/ticket-detail.component')
            .then(m => m.TicketDetailComponent)
      }

    ]
  },

  { path: '**', redirectTo: '' }

];