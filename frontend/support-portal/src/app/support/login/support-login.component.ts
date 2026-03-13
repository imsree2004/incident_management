import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportAuthService } from '../services/support-auth.service';

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

    if (!username || !password || (this.isRegister && (!email || !department))) {
      this.errorMessage = 'Please fill all required fields';
      return;
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
        this.errorMessage =
          err?.error?.message || 'Registration failed';
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
        this.isLoading = false;
        this.router.navigate(['/support/dashboard']);
      },
      error: err => {
        this.errorMessage =
          err?.error?.message || 'Invalid username or password';
        this.isLoading = false;
      }
    });
  }

}