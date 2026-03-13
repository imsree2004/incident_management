import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const storedAdmin = localStorage.getItem('currentAdmin');

    if (!storedAdmin) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const admin = JSON.parse(storedAdmin);
      const token = admin?.token;

      if (!token) {
        localStorage.removeItem('currentAdmin');
        this.router.navigate(['/login']);
        return false;
      }

      const tokenParts = token.split('.');

      if (tokenParts.length !== 3) {
        localStorage.removeItem('currentAdmin');
        this.router.navigate(['/login']);
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const isExpired = !!payload?.exp && payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem('currentAdmin');
        this.router.navigate(['/login']);
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem('currentAdmin');
      this.router.navigate(['/login']);
      return false;
    }
  }
}