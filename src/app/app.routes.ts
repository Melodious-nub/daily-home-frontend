import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login) },
  { path: 'signup', loadComponent: () => import('./auth/signup/signup').then(m => m.Signup) },
  { path: 'signup/otp-verify', loadComponent: () => import('./auth/signup/otp-verify/otp-verify').then(m => m.OtpVerify) },
  { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'forgot-password/otp-verify', loadComponent: () => import('./auth/forgot-password/otp-verify/otp-verify').then(m => m.OtpVerify) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  { 
    path: 'members', 
    loadComponent: () => import('./pages/members/members').then(m => m.Members),
    canActivate: [authGuard]
  },
  { 
    path: 'meals', 
    loadComponent: () => import('./pages/meals/meals').then(m => m.Meals),
    canActivate: [authGuard]
  },
  { 
    path: 'wallet', 
    loadComponent: () => import('./pages/wallet/wallet').then(m => m.Wallet),
    canActivate: [authGuard]
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./pages/reports/reports').then(m => m.Reports),
    canActivate: [authGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings').then(m => m.Settings),
    canActivate: [authGuard]
  },
  { 
    path: 'bazar', 
    loadComponent: () => import('./pages/bazar/bazar').then(m => m.Bazar),
    canActivate: [authGuard]
  },
  { 
    path: 'test-keyboard', 
    loadComponent: () => import('./pages/test-keyboard/test-keyboard').then(m => m.TestKeyboard)
  },
  { 
    path: 'simple-test', 
    loadComponent: () => import('./pages/simple-test/simple-test').then(m => m.SimpleTest)
  },
  { path: '**', redirectTo: 'dashboard' }
];
