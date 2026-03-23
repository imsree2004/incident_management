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

    // ✅ VALIDATION FIX
    if (this.isRegister) {
      if (!this.username || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all required fields.';
        return;
      }
    } else {
      if (!this.email || !this.password) {
        this.errorMessage = 'Please fill in all required fields.';
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
          this.errorMessage = error.error?.message || 'Registration failed.';
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
          this.errorMessage = error.status === 401
            ? 'Invalid email or password.'
            : (error.error?.message || 'Login failed.');
        }
      });

    }
  }
}