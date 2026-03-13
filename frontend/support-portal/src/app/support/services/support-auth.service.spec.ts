import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { SupportAuthService } from './support-auth.service';
import { environment } from '../../../environments/environment';

describe('SupportAuthService', () => {

  let service: SupportAuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockAgent = {
    id: 1,
    username: 'test_user',
    email: 'test@example.com',
    token: 'mock-jwt-token'
  };

  beforeEach(() => {

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SupportAuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(SupportAuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // -------------------------
  // LOGIN
  // -------------------------
  it('should call login API and store supportAgent', () => {

    service.login('test_user', 'password123')
      .subscribe((res: any) => {
        expect(res.token).toBe('mock-jwt-token');
        expect(res.username).toBe('test_user');
      });

   const req = httpMock.expectOne(`${environment.apiUrl}/support/auth/login`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      username: 'test_user',
      password: 'password123'
    });

    req.flush({
      success: true,
      message: 'Login successful',
      data: mockAgent
    });

    const stored = JSON.parse(localStorage.getItem('supportAgent')!);
    expect(stored.username).toBe('test_user');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should unwrap register response envelope', () => {
    service.register('test_user', 'test@example.com', 'password123').subscribe((res) => {
      expect(res).toEqual({
        id: 1,
        username: 'test_user',
        email: 'test@example.com'
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/support/auth/register`);
    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
      message: 'Support agent registered successfully',
      data: {
        id: 1,
        username: 'test_user',
        email: 'test@example.com'
      }
    });
  });

  // -------------------------
  // GET TOKEN
  // -------------------------
  it('should return token from stored supportAgent', () => {

    localStorage.setItem('supportAgent', JSON.stringify(mockAgent));

    // reload service state
    (service as any).supportSubject.next(mockAgent);

    const token = service.getToken();

    expect(token).toBe('mock-jwt-token');

  });

  // -------------------------
  // LOGOUT
  // -------------------------
  it('should clear storage and navigate to the root page on logout', () => {

    localStorage.setItem('supportAgent', JSON.stringify(mockAgent));

    service.logout();

    expect(localStorage.getItem('supportAgent')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);

  });

});