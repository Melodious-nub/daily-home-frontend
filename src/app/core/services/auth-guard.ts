import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isLoggedIn && auth.isTokenValid()) {
    return true;
  }

  // Clear invalid tokens and redirect to login
  auth.clearInvalidTokens();
  router.navigate(['/login']);
  return false;
};
