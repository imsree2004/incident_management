import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class AdminLoginComponent {

  username: string = '';
  email: string = '';
  password: string = '';

  isRegister: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isRegister) {
      this.email = '';
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username || !this.password || (this.isRegister && !this.email)) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;

    if (this.isRegister) {

      this.authService.register(
        this.username,
  this.email,
  this.password
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.isRegister = false;
          this.email = '';
          this.password = '';
          this.successMessage = 'Admin account created successfully. You can sign in now.';
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed.';
        }
      });

    } else {

      this.authService.login(
        this.username,
  this.password
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = error.status === 401
            ? 'Invalid admin username or password.'
            : (error.error?.message || 'Login failed.');
        }
      });

    }
  }
}