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
      console.log('Auth guard check:', { isInitialized, user: !!user, route: state.url });
      
      // If not initialized yet, wait
      if (!isInitialized) {
        console.log('Not initialized yet, waiting...');
        return false;
      }

      // Check if user is authenticated
      if (user && auth.isTokenValid()) {
        console.log('User authenticated, allowing access');
        return true;
      }

      // Clear invalid tokens and redirect to login
      console.log('User not authenticated, redirecting to login');
      auth.clearInvalidTokens();
      router.navigate(['/login']);
      return false;
    })
  );
};
