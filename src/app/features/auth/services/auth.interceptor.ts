import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth-store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const token = store.token();
  const isAuthRequest = request.url.includes('/auth/');
  const authenticatedRequest = token && !isAuthRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      if (error.status === 401 && !isAuthRequest) {
        store.clearSession();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
