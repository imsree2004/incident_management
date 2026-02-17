import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  isRegistering = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // 🔒 Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      email: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.loginForm.reset();

    const username = this.loginForm.get('username');
    const email = this.loginForm.get('email');

    if (this.isRegistering) {
      email?.setValidators([Validators.required, Validators.email]);
    } else {
      email?.clearValidators();
    }

    username?.setValidators([Validators.required]);

    username?.updateValueAndValidity();
    email?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.loginForm.disable();

    const { username, email, password } = this.loginForm.value;

    const request$ = this.isRegistering
      ? this.authService.register(username, email, password)
      : this.authService.login(username, password);

    request$.subscribe({
      next: () => {
        if (this.isRegistering) {
          this.snackBar.open(
            'Registration successful! Please login.',
            'Close',
            { duration: 3000 }
          );
          this.toggleMode();
        } else {
          this.snackBar.open('Login successful!', 'Close', {
            duration: 2000
          });
          this.router.navigate(['/dashboard']);
        }
      },
     error: (err) => {
  let message = 'Login failed. Please try again.';

  if (err?.error?.message) {
    message = err.error.message;
  }

  this.snackBar.open(message, 'Close', {
    duration: 4000
  });

  this.isLoading = false;
  this.loginForm.enable();
}
,
      complete: () => {
        this.isLoading = false;
        this.loginForm.enable();
      }
    });
  }
}
