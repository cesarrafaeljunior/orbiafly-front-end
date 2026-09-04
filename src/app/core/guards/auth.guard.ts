import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../auth/auth-session';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  if (session.authenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};
