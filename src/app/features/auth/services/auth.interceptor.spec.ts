import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthStore } from './auth-store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthStore,
          useValue: {
            token: () => 'jwt-token',
            clearSession: vi.fn(),
          },
        },
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('adds bearer token to protected API requests', () => {
    const http = TestBed.inject(HttpClient);

    http.get('/api/v1/accounts').subscribe();

    const request = httpTesting.expectOne('/api/v1/accounts');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({});
  });

  it('does not add bearer token to public auth requests', () => {
    const http = TestBed.inject(HttpClient);

    http.post('/api/v1/auth/login', {}).subscribe();

    const request = httpTesting.expectOne('/api/v1/auth/login');
    expect(request.request.headers.has('Authorization')).toBeFalsy();
    request.flush({});
  });

  it('adds bearer token to authenticated auth requests', () => {
    const http = TestBed.inject(HttpClient);

    http.post('/api/v1/auth/change-password', {}).subscribe();

    const request = httpTesting.expectOne('/api/v1/auth/change-password');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({});
  });
});
