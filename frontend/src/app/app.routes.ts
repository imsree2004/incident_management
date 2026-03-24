export const routes = [

{
path: '',
loadComponent: () =>
import('./auth/role-select/role-select')
.then(m => m.RoleSelect)
},
// LOGIN
{
path: 'admin-login',
loadComponent: () =>
import('./auth/admin-login/login.component')
.then(m => m.AdminLoginComponent)
},

{
path: 'support-login',
loadComponent: () =>
import('./auth/support-login/support-login.component')
.then(m => m.SupportLoginComponent)
},

// ADMIN
{
path: 'admin',
loadComponent: () =>
import('./dashboard/admin-dashboard/dashboard.component')
.then(m => m.DashboardComponent)
},

// SUPPORT (with layout)
{
path: 'support',
loadComponent: () =>
import('./layout/support-layout/support-layout.component')
.then(m => m.SupportLayoutComponent),

children: [
{
path: 'dashboard',
loadComponent: () =>
import('./dashboard/support-dashboard/support-dashboard.component')
.then(m => m.SupportDashboardComponent)
},
{
path: 'tickets',
loadComponent: () =>
import('./tickets/ticket-list/ticket-list.component')
.then(m => m.TicketListComponent)
},
{
path: 'tickets/:id',
loadComponent: () =>
import('./tickets/ticket-detail/ticket-detail.component')
.then(m => m.TicketDetailComponent)
}
]
},

{ path: '**', redirectTo: '' }
];
