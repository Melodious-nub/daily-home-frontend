import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './auth';
import { map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Wait for both initialization and authentication state
  return combineLatest([
    auth.isInitialized$,
    auth.currentUser$
  ]).pipe(
    take(1),
    map(([isInitialized, user]) => {
      // If not initialized yet, wait
      if (!isInitialized) {
        return false;
      }

      // Check if user is authenticated
      if (auth.isLoggedIn && auth.isTokenValid()) {
        return true;
      }

      // Clear invalid tokens and redirect to login
      auth.clearInvalidTokens();
      router.navigate(['/login']);
      return false;
    })
  );
};
