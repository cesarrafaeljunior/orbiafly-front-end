import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  AuthResponse,
  ChangePasswordPayload,
  ConfirmPasswordResetPayload,
  LoginPayload,
  RegisterPayload,
  RequestPasswordResetPayload,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload);
  }

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload);
  }

  logout() {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  changePassword(payload: ChangePasswordPayload) {
    return this.http.post<void>(`${this.baseUrl}/change-password`, payload);
  }

  requestPasswordReset(payload: RequestPasswordResetPayload) {
    return this.http.post<void>(`${this.baseUrl}/password-reset/request`, payload);
  }

  confirmPasswordReset(payload: ConfirmPasswordResetPayload) {
    return this.http.post<void>(`${this.baseUrl}/password-reset/confirm`, payload);
  }
}
