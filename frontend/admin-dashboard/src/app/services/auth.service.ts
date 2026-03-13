import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, timeout, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Admin {
  id: number;
  username: string;
  email: string;
  token: string;
}

interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly storageKey = 'currentAdmin';

  private currentAdminSubject: BehaviorSubject<Admin | null>;
  public currentAdmin$: Observable<Admin | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {

    this.currentAdminSubject = new BehaviorSubject<Admin | null>(this.getStoredAdmin());

    this.currentAdmin$ = this.currentAdminSubject.asObservable();
  }

  // --------------------
  // Helpers
  // --------------------

  get currentAdminValue(): Admin | null {
    return this.currentAdminSubject.value;
  }

  get token(): string | null {
    return this.currentAdminValue?.token || null;
  }

  isLoggedIn(): boolean {
    const token = this.token;

    if (!token) {
      return false;
    }

    try {
      const tokenParts = token.split('.');

      if (tokenParts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      return !payload?.exp || payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // --------------------
  // LOGIN
  // --------------------

  login(username: string, password: string): Observable<Admin> {

    return this.http
      .post<ApiSuccessResponse<Admin>>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map((response) => response.data),

        timeout(5000),

        tap((admin: Admin) => {

          this.setCurrentAdmin(admin);

        }),

        catchError(err => this.handleRequestError(err))
      );
  }

  register(username: string, email: string, password: string): Observable<Admin> {
    return this.http
      .post<ApiSuccessResponse<Admin>>(`${this.apiUrl}/auth/register`, { username, email, password })
      .pipe(
        map((response) => response.data),
        timeout(5000),
        catchError(err => this.handleRequestError(err))
      );
  }

  // --------------------
  // LOGOUT
  // --------------------

  logout(): void {

    localStorage.removeItem(this.storageKey);

    this.currentAdminSubject.next(null);

    this.router.navigate(['/login']);

  }

  private getStoredAdmin(): Admin | null {
    const storedAdmin = localStorage.getItem(this.storageKey);

    if (!storedAdmin) {
      return null;
    }

    try {
      const parsed = JSON.parse(storedAdmin);
      const admin = parsed?.data?.token ? parsed.data : parsed;

      if (admin?.token) {
        return admin as Admin;
      }
    } catch {
      // ignore corrupted storage and clear it below
    }

    localStorage.removeItem(this.storageKey);
    return null;
  }

  private setCurrentAdmin(admin: Admin): void {
    localStorage.setItem(this.storageKey, JSON.stringify(admin));
    this.currentAdminSubject.next(admin);
  }

  private handleRequestError(err: { name?: string }): Observable<never> {
    if (err.name === 'TimeoutError') {
      return throwError(() => ({
        error: { message: 'Server is taking too long to respond. Try again.' }
      }));
    }

    return throwError(() => err);
  }

}