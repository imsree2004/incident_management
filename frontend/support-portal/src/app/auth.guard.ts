import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const storedAgent = localStorage.getItem('supportAgent');

    if (!storedAgent) {
      this.router.navigate(['/']);
      return false;
    }

    try {
      const agent = JSON.parse(storedAgent);
      const token = agent?.token;

      if (!token) {
        localStorage.removeItem('supportAgent');
        this.router.navigate(['/']);
        return false;
      }

      const tokenParts = token.split('.');

      if (tokenParts.length !== 3) {
        localStorage.removeItem('supportAgent');
        this.router.navigate(['/']);
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const isExpired = !!payload?.exp && payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem('supportAgent');
        this.router.navigate(['/']);
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem('supportAgent');
      this.router.navigate(['/']);
      return false;
    }
  }
}
