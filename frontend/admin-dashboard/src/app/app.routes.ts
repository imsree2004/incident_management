import { Routes } from '@angular/router';
import { AdminLoginComponent} from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminAuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: AdminLoginComponent, data: { mode: 'login' } },
  { path: 'register', component: AdminLoginComponent, data: { mode: 'register' } },
  { path: 'dashboard', canActivate: [AdminAuthGuard], component: DashboardComponent },
  { path: '**', redirectTo: '/login' }
];
