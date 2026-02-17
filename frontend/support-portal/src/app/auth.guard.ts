import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const storedAgent = localStorage.getItem('supportAgent');

    if (!storedAgent) {
      this.router.navigate(['/support/login']);
      return false;
    }

    try {
      const agent = JSON.parse(storedAgent);

      if (!agent.token) {
        this.router.navigate(['/support/login']);
        return false;
      }

      return true;
    } catch {
      this.router.navigate(['/support/login']);
      return false;
    }
  }
}
