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

  isRegister = false;
  isLoading = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private supportAuth: SupportAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 👇 safety reset (browser autofill happens after render)
    this.username = '';
    this.email = '';
    this.password = '';
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;

    this.username = '';
    this.email = '';
    this.password = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const username = this.username.trim();
    const email = this.email.trim();
    const password = this.password.trim();

    if (!username || !password || (this.isRegister && !email)) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;

    if (this.isRegister) {
      this.register(username, email, password);
    } else {
      this.login(username, password);
    }
  }

private register(username: string, email: string, password: string): void {
  this.supportAuth.register(username, email, password).subscribe({
    next: () => {
      this.successMessage = 'Registration successful. Please login.';
      this.errorMessage = '';
      this.isRegister = false;

      // 🔥 force-clear fields after switching mode
      setTimeout(() => {
        this.username = '';
        this.password = '';
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
