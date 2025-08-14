import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './auth';
import { UserStateService } from './user-state.service';
import { map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const userStateService = inject(UserStateService);
  const router = inject(Router);

  // Wait for both auth initialization and user state initialization
  return combineLatest([
    auth.isInitialized$,
    userStateService.isInitialized$
  ]).pipe(
    take(1),
    map(([authInitialized, userStateInitialized]) => {
      // console.log('Auth guard check:', { authInitialized, userStateInitialized, route: state.url });
      
      // If not initialized yet, wait
      if (!authInitialized || !userStateInitialized) {
        // console.log('Not initialized yet, waiting...');
        return false;
      }

      // Check if user is authenticated
      if (auth.isLoggedIn && auth.isTokenValid()) {
        // console.log('User authenticated, allowing access');
        return true;
      }

      // Clear invalid tokens and redirect to login
      // console.log('User not authenticated, redirecting to login');
      auth.clearInvalidTokens();
      router.navigate(['/login']);
      return false;
    })
  );
};
