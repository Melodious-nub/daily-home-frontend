import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from "./layout/header/header";
import { BottomNav } from "./layout/bottom-nav/bottom-nav";
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Auth } from './core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    BottomNav,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isAuthenticated = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Subscribe to authentication changes
    this.auth.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      
      // Check if user should be redirected to login
      if (!this.isAuthenticated && this.auth.shouldRedirectToLogin()) {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit(): void {
    // Clear any invalid tokens on app start
    this.auth.clearInvalidTokens();
    
    if (Capacitor.isNativePlatform()) {
      this.configureStatusBar();
      this.setNavigationBar();
    }
  }

  private async configureStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // Light icons (dark background)
      await StatusBar.setBackgroundColor({ color: '#ffffff' }); // White background
      await StatusBar.setOverlaysWebView({ overlay: false }); // Avoids content under status bar
      await StatusBar.show();
    } catch (error) {
      console.error('Failed to configure status bar:', error);
    }
  }

  async setNavigationBar() {
    try {
      await NavigationBar.setNavigationBarColor({ color: '#ffffff', darkButtons: true }); // White nav bar with dark buttons
    } catch (error) {
      console.error('Navigation bar setup failed', error);
    }
  }
}
