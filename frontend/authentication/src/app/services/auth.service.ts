import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Admin {
  id: number;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private currentAdminSubject: BehaviorSubject<Admin | null>;
  public currentAdmin$: Observable<Admin | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedAdmin = localStorage.getItem('currentAdmin');

    this.currentAdminSubject = new BehaviorSubject<Admin | null>(
      storedAdmin ? JSON.parse(storedAdmin) : null
    );

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
    return !!this.token;
  }

  // --------------------
  // Auth APIs
  // --------------------
  login(username: string, password: string): Observable<Admin> {
  return this.http
    .post<Admin>(`${this.apiUrl}/auth/login`, { username, password })
    .pipe(
      timeout(5000), // ⏱️ 5 seconds max wait
      tap(admin => {
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        this.currentAdminSubject.next(admin);
      }),
      catchError(err => {
        if (err.name === 'TimeoutError') {
          return throwError(() => ({
            error: { message: 'Server is taking too long to respond. Try again.' }
          }));
        }
        return throwError(() => err);
      })
    );
}


  register(username: string, email: string, password: string): Observable<Admin> {
    return this.http.post<Admin>(`${this.apiUrl}/auth/register`, {
      username,
      email,
      password
    });
  }

  // --------------------
  // Logout
  // --------------------
  logout(): void {
    localStorage.removeItem('currentAdmin');
    this.currentAdminSubject.next(null);
    this.router.navigate(['/login']);
  }
}
