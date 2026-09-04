import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthenticatedUser, LoginPayload, RegisterPayload } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload);
  }

  me(): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>(`${this.baseUrl}/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }
}
