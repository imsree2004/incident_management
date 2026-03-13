import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { AdminLoginComponent } from './login.component';

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      login: jasmine.createSpy('login').and.returnValue(of({})),
      register: jasmine.createSpy('register').and.returnValue(of({}))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should hide email input in login mode', () => {
    const emailInput = fixture.nativeElement.querySelector('input[name="admin-email"]');

    expect(component.isRegister).toBeFalse();
    expect(emailInput).toBeNull();
  });

  it('should show email input in register mode', () => {
    component.toggleMode();
    fixture.detectChanges();

    const emailInput = fixture.nativeElement.querySelector('input[name="admin-email"]');

    expect(component.isRegister).toBeTrue();
    expect(emailInput).not.toBeNull();
  });

  it('should clear email when toggling back to login mode', () => {
    component.toggleMode();
    component.email = 'admin@test.com';

    component.toggleMode();

    expect(component.isRegister).toBeFalse();
    expect(component.email).toBe('');
  });

  it('should call login and navigate on success', () => {
    component.username = 'admin';
    component.password = '123';

    component.submit();

    expect(mockAuthService.login).toHaveBeenCalledWith('admin', '123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show a validation message when required fields are missing', () => {
    component.submit();

    expect(component.errorMessage).toBe('Please fill in all required fields.');
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should show a clear message for admin login 401 errors', () => {
    mockAuthService.login.and.returnValue(
      throwError(() => ({ status: 401, error: { message: 'Invalid username or password' } }))
    );

    component.username = 'wrong-admin';
    component.password = 'wrong-pass';

    component.submit();

    expect(component.errorMessage).toBe('Invalid admin username or password.');
  });

  it('should not register without email in register mode', () => {
    component.isRegister = true;
    component.username = 'admin';
    component.password = '123456';

    component.submit();

    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should call register when email is provided in register mode', () => {
    component.isRegister = true;
    component.username = 'admin';
    component.email = 'admin@test.com';
    component.password = '123456';

    component.submit();

    expect(mockAuthService.register).toHaveBeenCalledWith('admin', 'admin@test.com', '123456');
  });

  it('should show a success message after register succeeds', () => {
    component.isRegister = true;
    component.username = 'admin';
    component.email = 'admin@test.com';
    component.password = '123456';

    component.submit();

    expect(component.successMessage).toBe('Admin account created successfully. You can sign in now.');
    expect(component.isRegister).toBeFalse();
  });
});