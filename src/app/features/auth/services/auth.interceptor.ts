import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth-store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const token = store.token();
  const isPublicAuthRequest = [
    '/auth/login',
    '/auth/register',
    '/auth/password-reset/request',
    '/auth/password-reset/confirm',
  ].some((path) => request.url.includes(path));
  const authenticatedRequest =
    token && !isPublicAuthRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      if (error.status === 401 && !isPublicAuthRequest) {
        store.clearSession();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
