import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '../models/auth.models';
import { AuthApi } from './auth-api';

const TOKEN_STORAGE_KEY = 'orbiafly.auth.token';
const USER_STORAGE_KEY = 'orbiafly.auth.user';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly state = signal<AuthState>({
    token: this.readToken(),
    user: this.readUser(),
    loading: false,
  });

  readonly token = computed(() => this.state().token);
  readonly user = computed(() => this.state().user);
  readonly loading = computed(() => this.state().loading);
  readonly isAuthenticated = computed(() => Boolean(this.state().token && this.state().user));
  readonly isAdmin = computed(() => this.state().user?.roles.includes('ROLE_ADMIN') ?? false);

  async login(payload: LoginPayload, returnUrl = '/dashboard'): Promise<void> {
    await this.authenticate(
      () => firstValueFrom(this.api.login(payload)),
      'Login realizado com sucesso.',
      returnUrl,
    );
  }

  async register(payload: RegisterPayload): Promise<void> {
    await this.authenticate(
      () => firstValueFrom(this.api.register(payload)),
      'Cadastro realizado com sucesso.',
      '/dashboard',
    );
  }

  logout(redirect = true): void {
    this.clearSession();
    this.toastService.info('Sessão encerrada.');
    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  clearSession(): void {
    this.persistSession(null);
    this.state.update((current) => ({
      ...current,
      token: null,
      user: null,
      loading: false,
    }));
  }

  private async authenticate(
    request: () => Promise<AuthResponse>,
    successMessage: string,
    redirectUrl: string,
  ): Promise<void> {
    this.state.update((current) => ({ ...current, loading: true }));
    try {
      const response = await request();
      this.persistSession(response);
      this.state.set({
        token: response.accessToken,
        user: response.user,
        loading: false,
      });
      this.toastService.success(successMessage);
      await this.router.navigateByUrl(redirectUrl);
    } catch (error) {
      this.state.update((current) => ({ ...current, loading: false }));
      this.toastService.error(this.errorMessage(error));
      throw error;
    }
  }

  private persistSession(response: AuthResponse | null): void {
    try {
      if (!response) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    } catch {
      // Storage local indisponivel nao deve quebrar o fluxo de autenticacao em runtime restrito.
    }
  }

  private readToken(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private readUser(): AuthUser | null {
    try {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }
    return 'Não foi possível autenticar.';
  }
}
