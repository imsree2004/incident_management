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
    this.username = '';
    this.email = '';
    this.password = '';
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (this.isRegister) {
      if (!this.username.trim()) {
        this.errorMessage = 'Please enter a username.';
        return;
      }
      if (!this.email.trim()) {
        this.errorMessage = 'Please enter your email address.';
        return;
      }
      if (!this.isValidEmail(this.email)) {
        this.errorMessage = 'Please enter a valid email address (e.g. user@example.com).';
        return;
      }
      if (!this.password) {
        this.errorMessage = 'Please enter a password.';
        return;
      }
      if (this.password.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters long.';
        return;
      }
    } else {
      if (!this.email.trim()) {
        this.errorMessage = 'Please enter your email address.';
        return;
      }
      if (!this.isValidEmail(this.email)) {
        this.errorMessage = 'Please enter a valid email address.';
        return;
      }
      if (!this.password) {
        this.errorMessage = 'Please enter your password.';
        return;
      }
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
          this.username = '';
          this.email = '';
          this.password = '';
          this.successMessage = 'Admin account created successfully. You can sign in now.';
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.status === 409) {
            this.errorMessage = 'An account with this email already exists. Please sign in instead.';
          } else if (error.status === 400 && error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Registration failed. Please check your details and try again.';
          }
        }
      });

    } else {

      this.authService.login(
        this.email,
        this.password
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.errorMessage = 'Incorrect email or password. Please try again.';
          } else if (error.status === 404) {
            this.errorMessage = 'No admin account found with this email address.';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check your connection.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
        }
      });

    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}