import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SupportAuthService } from '../services/support-auth.service';

@Component({
  selector: 'app-support-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './support-layout.component.html',
  styleUrls: ['./support-layout.component.css']
})
export class SupportLayoutComponent {
  readonly currentUser$;
  menuOpen = false;
  pageTitle = 'Support Panel';
  breadcrumb = 'Support';

  constructor(
    private authService: SupportAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUser$ = this.authService.support$;
    this.updateRouteContext();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateRouteContext());
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
  }

  private updateRouteContext(): void {
    let activeRoute: ActivatedRoute | null = this.route.firstChild ?? null;

    while (activeRoute?.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    const routeTitle = activeRoute?.snapshot?.routeConfig?.title;
    this.pageTitle = typeof routeTitle === 'string' ? routeTitle : 'Support Panel';
    this.breadcrumb = `Support / ${this.pageTitle}`;
  }
}