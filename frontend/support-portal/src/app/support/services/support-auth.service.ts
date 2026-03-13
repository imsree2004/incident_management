import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SupportAgentProfile {
  id: number;
  username: string;
  email: string;
}

export interface SupportAgent extends SupportAgentProfile {
  token: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SupportAuthService {
  private readonly apiUrl = `${environment.apiUrl}/support/auth`;
  private readonly STORAGE_KEY = 'supportAgent';

  private supportSubject = new BehaviorSubject<SupportAgent | null>(
    this.getStoredAgent()
  );

  readonly support$ = this.supportSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // --------------------
  // REGISTER
  // --------------------
  register(
    username: string,
    email: string,
    password: string,
  department: string
  ): Observable<SupportAgentProfile> {

    return this.http.post<ApiEnvelope<SupportAgentProfile> | SupportAgentProfile>(
      `${this.apiUrl}/register`,
      {
        username,
        email,
        password,
      department   
      }
    ).pipe(
      map(response => this.unwrapResponse(response))
    );

  }

  // --------------------
  // LOGIN
  // --------------------
  login(username: string, password: string): Observable<SupportAgent> {

    return this.http.post<ApiEnvelope<SupportAgent> | SupportAgent>(
      `${this.apiUrl}/login`,
      { username, password }
    ).pipe(
      map(response => this.unwrapResponse(response)),

      tap(agent => {

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(agent));

        this.supportSubject.next(agent);

      })

    );

  }

  // --------------------
  // LOGOUT
  // --------------------
  logout(): void {

    localStorage.removeItem(this.STORAGE_KEY);
    this.supportSubject.next(null);

    this.router.navigate(['/']);

  }

  // --------------------
  // GET TOKEN
  // --------------------
  getToken(): string | null {

    return this.supportSubject.value?.token || null;

  }

  // --------------------
  // LOGIN STATUS
  // --------------------
  isLoggedIn(): boolean {
    const token = this.getToken();

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

  private getStoredAgent(): SupportAgent | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as SupportAgent;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  private unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    return response as T;
  }

}