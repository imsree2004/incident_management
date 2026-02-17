import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface SupportAgent {
  id: number;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportAuthService {
  private readonly apiUrl = 'http://localhost:4000/api/support';
  private readonly STORAGE_KEY = 'supportAgent';

  private supportSubject = new BehaviorSubject<SupportAgent | null>(
    JSON.parse(localStorage.getItem(this.STORAGE_KEY) || 'null')
  );

  support$ = this.supportSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // --------------------
  // REGISTER
  // --------------------
  register(username: string, email: string, password: string): Observable<SupportAgent> {
    return this.http.post<SupportAgent>(`${this.apiUrl}/register`, {
      username,
      email,
      password
    });
  }

  // --------------------
  // LOGIN
  // --------------------
 login(username: string, password: string) {
  return this.http.post<any>(
    'http://localhost:4000/api/support/login',
    { username, password }
  ).pipe(
    tap(agent => {
      localStorage.setItem('supportAgent', JSON.stringify(agent));
      this.supportSubject.next(agent);
      this.router.navigate(['/support/dashboard']);
    })
  );
}


  // --------------------
  // LOGOUT
  // --------------------
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.supportSubject.next(null);
    this.router.navigate(['/support/login']);
  }

  // --------------------
  // HELPERS
  // --------------------
  getToken(): string | null {
    return this.supportSubject.value?.token || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
