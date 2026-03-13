import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService, Admin } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no pending HTTP requests
  });

  // -------------------------
  // Service Creation
  // -------------------------
  it('should create AuthService', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------
  // Login Success Test
  // -------------------------
  it('should send login request and store admin in localStorage', () => {
    const mockAdmin: Admin = {
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      token: 'fake-jwt-token'
    };

    service.login('admin', '123456').subscribe(response => {
      expect(response).toEqual(mockAdmin);
      expect(localStorage.getItem('currentAdmin')).toEqual(JSON.stringify(mockAdmin));
      expect(service.currentAdminValue).toEqual(mockAdmin);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'admin',
      password: '123456'
    });

    req.flush({
      success: true,
      message: 'Login successful',
      data: mockAdmin
    });
  });

  // -------------------------
  // Login Error Test
  // -------------------------
  it('should handle login error properly', () => {
    service.login('admin', 'wrongpassword').subscribe({
      next: () => fail('Should have failed with 401'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(
      { message: 'Invalid username or password' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should normalize a previously stored envelope-shaped admin session', () => {
    const mockAdmin: Admin = {
      id: 2,
      username: 'storedadmin',
      email: 'stored@test.com',
      token: 'stored-fake-token'
    };

    localStorage.setItem('currentAdmin', JSON.stringify({
      success: true,
      message: 'Login successful',
      data: mockAdmin
    }));

    const rehydratedService = new AuthService(TestBed.inject(HttpClient), mockRouter);

    expect(rehydratedService.currentAdminValue).toEqual(mockAdmin);
  });

  // -------------------------
  // Logout Test
  // -------------------------
  it('should logout and clear localStorage', () => {
    localStorage.setItem('currentAdmin', JSON.stringify({
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      token: 'token'
    }));

    service.logout();

    expect(localStorage.getItem('currentAdmin')).toBeNull();
    expect(service.currentAdminValue).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

});