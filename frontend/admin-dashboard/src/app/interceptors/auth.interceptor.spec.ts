import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor (functional)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  let mockAuthService: any;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = {
      token: 'fake-jwt-token',
      logout: jasmine.createSpy('logout')
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor])
        ),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ------------------------------------
  // 1️⃣ Should attach token to protected routes
  // ------------------------------------
  it('should attach Authorization header if token exists', () => {
    http.get('/api/dashboard').subscribe();

    const req = httpMock.expectOne('/api/dashboard');

    expect(req.request.headers.get('Authorization'))
      .toBe('Bearer fake-jwt-token');

    req.flush({});
  });

  // ------------------------------------
  // 2️⃣ Should NOT attach token to auth routes
  // ------------------------------------
  it('should NOT attach token to auth routes', () => {
    http.get('/auth/login').subscribe();

    const req = httpMock.expectOne('/auth/login');

    expect(req.request.headers.has('Authorization'))
      .toBeFalse();

    req.flush({});
  });

  // ------------------------------------
  // 3️⃣ Should NOT attach token if no token
  // ------------------------------------
  it('should NOT attach token if user not logged in', () => {
    mockAuthService.token = null;

    http.get('/api/dashboard').subscribe();

    const req = httpMock.expectOne('/api/dashboard');

    expect(req.request.headers.has('Authorization'))
      .toBeFalse();

    req.flush({});
  });

  // ------------------------------------
  // 4️⃣ Should logout and redirect on 401
  // ------------------------------------
  it('should logout and redirect on 401 error', () => {
    http.get('/api/dashboard').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/dashboard');

    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

});