import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'support/login',
    pathMatch: 'full'
  },
  {
    path: 'support',
    loadChildren: () =>
      import('./support/support.routes').then(m => m.supportRoutes)
  }
];
