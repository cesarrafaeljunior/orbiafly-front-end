import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthApi } from './auth-api';
import { AuthStore } from './auth-store';

describe('AuthStore', () => {
  const response = {
    accessToken: 'jwt-token',
    user: {
      id: 'user-id',
      email: 'admin@admin.com.br',
      username: 'admin',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
  };

  let api: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };
  let toastService: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    api = {
      login: vi.fn(),
      register: vi.fn(),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };
    toastService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApi, useValue: api },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('persists login session and exposes admin role', async () => {
    api.login.mockReturnValue(of(response));
    const store = TestBed.inject(AuthStore);

    await store.login({ login: 'admin', password: 'admin' }, '/contas');

    expect(store.token()).toBe('jwt-token');
    expect(store.user()?.username).toBe('admin');
    expect(store.isAuthenticated()).toBeTruthy();
    expect(store.isAdmin()).toBeTruthy();
    expect(window.localStorage.getItem('orbiafly.auth.token')).toBe('jwt-token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/contas');
    expect(toastService.success).toHaveBeenCalledWith('Login realizado com sucesso.');
  });

  it('clears session on logout', () => {
    window.localStorage.setItem('orbiafly.auth.token', 'jwt-token');
    window.localStorage.setItem('orbiafly.auth.user', JSON.stringify(response.user));
    const store = TestBed.inject(AuthStore);

    store.logout();

    expect(store.isAuthenticated()).toBeFalsy();
    expect(window.localStorage.getItem('orbiafly.auth.token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastService.info).toHaveBeenCalledWith('Sessão encerrada.');
  });

  it('uses API error detail on authentication failure', async () => {
    api.login.mockReturnValue(throwError(() => new HttpErrorResponse({
      error: { detail: 'Credenciais inválidas.' },
      status: 401,
    })));
    const store = TestBed.inject(AuthStore);

    await expect(store.login({ login: 'admin', password: 'errada' })).rejects.toBeTruthy();

    expect(store.loading()).toBeFalsy();
    expect(toastService.error).toHaveBeenCalledWith('Credenciais inválidas.');
  });
});
