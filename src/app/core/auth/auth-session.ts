import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthApi } from './auth-api';
import { AuthResponse, AuthenticatedUser, LoginPayload, RegisterPayload } from './auth.models';

const TOKEN_KEY = 'orbiafly.auth.token';
const USER_KEY = 'orbiafly.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthenticatedUser | null>(this.readUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly authenticated = computed(() => Boolean(this.tokenSignal()));

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.api.login(payload).pipe(tap((response) => this.storeSession(response)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.api.register(payload).pipe(tap((response) => this.storeSession(response)));
  }

  refreshUser(): Observable<AuthenticatedUser | null> {
    if (!this.tokenSignal()) {
      return of(null);
    }
    return this.api.me().pipe(
      tap((user) => this.storeUser(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  logout(): void {
    this.api.logout().pipe(catchError(() => of(undefined))).subscribe(() => {
      this.clearSession();
      this.router.navigateByUrl('/login');
    });
  }

  clearSession(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }

  private storeSession(response: AuthResponse): void {
    this.tokenSignal.set(response.token);
    this.storeUser(response.user);
    window.localStorage.setItem(TOKEN_KEY, response.token);
  }

  private storeUser(user: AuthenticatedUser): void {
    this.userSignal.set(user);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private readToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthenticatedUser | null {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  }
}
