import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  
  // Auth routes (no header/bottom-nav)
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login) },
  { path: 'signup', loadComponent: () => import('./auth/signup/signup').then(m => m.Signup) },
  { path: 'signup/otp-verify', loadComponent: () => import('./auth/signup/otp-verify/otp-verify').then(m => m.OtpVerify) },
  { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'forgot-password/otp-verify', loadComponent: () => import('./auth/forgot-password/otp-verify/otp-verify').then(m => m.OtpVerify) },
  
  // Landing routes (no header/bottom-nav)
  { 
    path: 'landing', 
    loadComponent: () => import('./landing/landing').then(m => m.Landing),
    canActivate: [authGuard]
  },
  { 
    path: 'landing/create-mess', 
    loadComponent: () => import('./landing/create-mess/create-mess').then(m => m.CreateMess),
    canActivate: [authGuard]
  },
  { 
    path: 'landing/join-mess', 
    loadComponent: () => import('./landing/join-mess/join-mess').then(m => m.JoinMess),
    canActivate: [authGuard]
  },
  { 
    path: 'landing/join-mess/request-status', 
    loadComponent: () => import('./landing/join-mess/request-status/request-status').then(m => m.RequestStatus),
    canActivate: [authGuard]
  },
  
  // Main app routes (with header/bottom-nav) - Parent route
  { 
    path: 'main', 
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      { 
        path: 'members', 
        loadComponent: () => import('./pages/members/members').then(m => m.Members)
      },
      { 
        path: 'meals', 
        loadComponent: () => import('./pages/meals/meals').then(m => m.Meals)
      },
      { 
        path: 'wallet', 
        loadComponent: () => import('./pages/wallet/wallet').then(m => m.Wallet)
      },
      { 
        path: 'reports', 
        loadComponent: () => import('./pages/reports/reports').then(m => m.Reports)
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
      },
      { 
        path: 'bazar', 
        loadComponent: () => import('./pages/bazar/bazar').then(m => m.Bazar)
      }
    ]
  },
  
  // Test routes
  { 
    path: 'test-keyboard', 
    loadComponent: () => import('./pages/test-keyboard/test-keyboard').then(m => m.TestKeyboard)
  },
  { 
    path: 'simple-test', 
    loadComponent: () => import('./pages/simple-test/simple-test').then(m => m.SimpleTest)
  },
  
  // Legacy routes - redirect to main
  { path: 'dashboard', redirectTo: 'main/dashboard' },
  { path: 'members', redirectTo: 'main/members' },
  { path: 'meals', redirectTo: 'main/meals' },
  { path: 'wallet', redirectTo: 'main/wallet' },
  { path: 'reports', redirectTo: 'main/reports' },
  { path: 'settings', redirectTo: 'main/settings' },
  { path: 'bazar', redirectTo: 'main/bazar' },
  
  { path: '**', redirectTo: 'landing' }
];
