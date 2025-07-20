import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'members', loadComponent: () => import('./pages/members/members').then(m => m.Members) },
  { path: 'rooms', loadComponent: () => import('./pages/rooms/rooms').then(m => m.Rooms) },
  { path: 'meals', loadComponent: () => import('./pages/meals/meals').then(m => m.Meals) },
  { path: 'wallet', loadComponent: () => import('./pages/wallet/wallet').then(m => m.Wallet) },
  { path: 'reports', loadComponent: () => import('./pages/reports/reports').then(m => m.Reports) },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
];
