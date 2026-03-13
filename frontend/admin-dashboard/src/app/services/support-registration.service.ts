import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface SupportRegistrationResponse {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportRegistrationService {
  private readonly apiUrl = `${environment.supportApiUrl}/support/auth/register`;

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<SupportRegistrationResponse> {
    return this.http
      .post<ApiEnvelope<SupportRegistrationResponse> | SupportRegistrationResponse>(this.apiUrl, {
        username,
        email,
        password
      })
      .pipe(map((response) => ('data' in response ? response.data : response)));
  }
}