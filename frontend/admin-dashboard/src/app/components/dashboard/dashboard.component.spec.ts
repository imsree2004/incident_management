import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: any;
  let dashboardService: any;
  let notificationService: any;

  beforeEach(async () => {
    authService = {
      currentAdmin$: of({ username: 'admin.user' }),
      logout: jasmine.createSpy('logout')
    };

    dashboardService = {
      getMetrics: jasmine.createSpy('getMetrics').and.returnValue(of({
        totalEmails: 20,
        processedToday: 4,
        openTickets: 7,
        autoReplies: 3
      }))
    };

    notificationService = {
      notification$: of(null),
      showError: jasmine.createSpy('showError')
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: DashboardService, useValue: dashboardService },
        { provide: NotificationService, useValue: notificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load metrics on init', () => {
    expect(dashboardService.getMetrics).toHaveBeenCalled();
    expect(component.metrics.totalEmails).toBe(20);
    expect(component.isLoading).toBeFalse();
  });

  it('should switch tabs', () => {
    component.setTab('tickets');

    expect(component.activeTab).toBe('tickets');
  });

  it('should handle dashboard load errors', () => {
    dashboardService.getMetrics.and.returnValue(throwError(() => new Error('boom')));

    component.loadMetrics();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('We could not load the latest dashboard metrics. Please try again.');
    expect(notificationService.showError).toHaveBeenCalledWith('Dashboard metrics failed to load.');
  });

  it('should delegate logout to auth service', () => {
    component.menuOpen = true;

    component.logout();

    expect(component.menuOpen).toBeFalse();
    expect(authService.logout).toHaveBeenCalled();
  });
});