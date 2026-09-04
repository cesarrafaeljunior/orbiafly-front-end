import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthSession } from '../auth/auth-session';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  const token = session.token();
  const authRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.includes('/auth/login')) {
        session.clearSession();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
