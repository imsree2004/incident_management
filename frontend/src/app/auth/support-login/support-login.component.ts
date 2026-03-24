import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportAuthService } from '../../services/support-auth.service';

@Component({
  selector: 'app-support-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support-login.component.html',
  styleUrls: ['./support-login.component.css']
})
export class SupportLoginComponent implements OnInit {

  username = '';
  email = '';
  password = '';
  department = '';   // ✅ NEW FIELD

  isRegister = false;
  isLoading = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private supportAuth: SupportAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    if (this.supportAuth.isLoggedIn()) {
      this.router.navigate(['/support/dashboard']);
      return;
    }

    // reset autofill values
    this.username = '';
    this.email = '';
    this.password = '';
    this.department = '';
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.resetForm();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const username = this.username.trim();
    const email = this.email.trim();
    const password = this.password.trim();
    const department = this.department.trim();

    if (!username) {
      this.errorMessage = 'Please enter your username.';
      return;
    }
    if (!password) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    if (this.isRegister) {
      if (!email) {
        this.errorMessage = 'Please enter your email address.';
        return;
      }
      if (!this.isValidEmail(email)) {
        this.errorMessage = 'Please enter a valid email address (e.g. user@example.com).';
        return;
      }
      if (password.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters long.';
        return;
      }
      if (!department) {
        this.errorMessage = 'Please enter your department.';
        return;
      }
    }

    this.isLoading = true;

    if (this.isRegister) {
      this.register(username, email, password, department);
    } else {
      this.login(username, password);
    }
  }

  /* ---------------- REGISTER ---------------- */

  private register(
    username: string,
    email: string,
    password: string,
    department: string
  ): void {

    this.supportAuth.register(username, email, password, department).subscribe({
      next: () => {

        this.successMessage = 'Registration successful. Please login.';
        this.errorMessage = '';
        this.isRegister = false;

        // clear fields
        setTimeout(() => {
          this.username = '';
          this.password = '';
          this.department = '';
        }, 0);

        this.isLoading = false;
      },

      error: err => {
        if (err?.status === 409) {
          this.errorMessage = 'An account with this username or email already exists.';
        } else if (err?.status === 400 && err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err?.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        }
        this.successMessage = '';
        this.isLoading = false;
      }
    });
  }

  /* ---------------- RESET FORM ---------------- */

  private resetForm(): void {
    this.username = '';
    this.email = '';
    this.password = '';
    this.department = '';
    this.clearMessages();
  }

  /* ---------------- LOGIN ---------------- */

  private login(username: string, password: string): void {

    this.supportAuth.login(username, password).subscribe({
      next: () => {
            this.router.navigate(['/support/dashboard']);
      },
      error: err => {
        if (err?.status === 401) {
          this.errorMessage = 'Incorrect username or password. Please try again.';
        } else if (err?.status === 404) {
          this.errorMessage = 'No support agent account found with this username.';
        } else if (err?.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}