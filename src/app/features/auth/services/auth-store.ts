import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  ConfirmPasswordResetPayload,
  LoginPayload,
  RegisterPayload,
  RequestPasswordResetPayload,
} from '../models/auth.models';
import { AuthApi } from './auth-api';

const USER_STORAGE_KEY = 'orbiafly.auth.user';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly state = signal<AuthState>({
    user: this.readUser(),
    loading: false,
  });

  readonly user = computed(() => this.state().user);
  readonly loading = computed(() => this.state().loading);
  readonly isAuthenticated = computed(() => Boolean(this.state().user));
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

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.performAccountAction(
      () => firstValueFrom(this.api.changePassword(payload)),
      'Senha alterada com sucesso. Entre novamente.',
      'Não foi possível alterar a senha.',
    );
    this.logout(false);
    await this.router.navigate(['/login']);
  }

  async requestPasswordReset(payload: RequestPasswordResetPayload): Promise<void> {
    await this.performAccountAction(
      () => firstValueFrom(this.api.requestPasswordReset(payload)),
      'Se a conta existir, o código foi enviado.',
      'Não foi possível solicitar a recuperação.',
    );
  }

  async confirmPasswordReset(payload: ConfirmPasswordResetPayload): Promise<void> {
    await this.performAccountAction(
      () => firstValueFrom(this.api.confirmPasswordReset(payload)),
      'Senha redefinida com sucesso.',
      'Não foi possível redefinir a senha.',
    );
  }

  logout(redirect = true): void {
    this.clearSession();
    void firstValueFrom(this.api.logout()).catch(() => undefined);
    this.toastService.info('Sessão encerrada.');
    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  clearSession(): void {
    this.persistUser(null);
    this.state.set({ user: null, loading: false });
  }

  private async authenticate(
    request: () => Promise<AuthResponse>,
    successMessage: string,
    redirectUrl: string,
  ): Promise<void> {
    this.state.update((current) => ({ ...current, loading: true }));
    try {
      const response = await request();
      this.persistUser(response.user);
      this.state.set({ user: response.user, loading: false });
      this.toastService.success(successMessage);
      await this.router.navigateByUrl(redirectUrl);
    } catch (error) {
      this.state.update((current) => ({ ...current, loading: false }));
      this.toastService.error(this.errorMessage(error));
      throw error;
    }
  }

  private async performAccountAction(
    request: () => Promise<void>,
    successMessage: string,
    fallbackErrorMessage: string,
  ): Promise<void> {
    this.state.update((current) => ({ ...current, loading: true }));
    try {
      await request();
      this.state.update((current) => ({ ...current, loading: false }));
      this.toastService.success(successMessage);
    } catch (error) {
      this.state.update((current) => ({ ...current, loading: false }));
      this.toastService.error(this.errorMessage(error, fallbackErrorMessage));
      throw error;
    }
  }

  private persistUser(user: AuthUser | null): void {
    try {
      if (!user) {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem('orbiafly.auth.token');
        return;
      }
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      window.localStorage.removeItem('orbiafly.auth.token');
    } catch {
      // Storage local indisponível não deve quebrar a autenticação.
    }
  }

  private readUser(): AuthUser | null {
    try {
      window.localStorage.removeItem('orbiafly.auth.token');
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private errorMessage(error: unknown, fallback = 'Não foi possível autenticar.'): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }
    return fallback;
  }
}
