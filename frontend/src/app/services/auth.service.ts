import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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

private readonly API_URL = `${environment.apiUrl}/auth`;
private readonly STORAGE_KEY = 'adminUser';

private adminSubject = new BehaviorSubject<Admin | null>(
this.getStoredAdmin()
);

public currentAdmin$ = this.adminSubject.asObservable();

constructor(
private http: HttpClient,
private router: Router
) {}

// ---------------- LOGIN ----------------
login(email: string, password: string): Observable<Admin> {
return this.http.post<Admin>(`${this.API_URL}/login`, {
email,
password
}).pipe(
tap(admin => {
localStorage.setItem(this.STORAGE_KEY, JSON.stringify(admin));
this.adminSubject.next(admin);
})
);
}

// ---------------- REGISTER ----------------
register(username: string, email: string, password: string): Observable<any> {
  return this.http.post(`${this.API_URL}/signup`, {
    username,
    email,
    password,
    role: 'admin'
  });
}

// ---------------- LOGOUT ----------------
logout(): void {
localStorage.removeItem(this.STORAGE_KEY);
this.adminSubject.next(null);
this.router.navigate(['/']);
}

// ---------------- GET TOKEN ----------------
getToken(): string | null {
return this.adminSubject.value?.token || null;
}

// ---------------- CHECK LOGIN ----------------
isLoggedIn(): boolean {
return !!this.getToken();
}

// ---------------- GET STORED ADMIN ----------------
private getStoredAdmin(): Admin | null {
const stored = localStorage.getItem(this.STORAGE_KEY);

if (!stored) return null;

try {
return JSON.parse(stored);
} catch {
localStorage.removeItem(this.STORAGE_KEY);
return null;
}
}
}