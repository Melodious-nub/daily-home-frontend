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
      this.configureNativeUI();
    }
  }

  private async configureNativeUI() {
    try {
      await this.configureStatusBar();
      await this.configureNavigationBar();
    } catch (error) {
      // Silent fail for web platform or unsupported devices
    }
  }

  private async configureStatusBar() {
    try {
      // Set status bar style for Android
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setStyle({ style: Style.Light }); // Dark icons (light background)
        await StatusBar.setBackgroundColor({ color: '#ffffff' }); // White background
        await StatusBar.setOverlaysWebView({ overlay: false }); // Don't overlay content
        await StatusBar.show();
      }
    } catch (error) {
      // Status bar configuration failed
    }
  }

  private async configureNavigationBar() {
    try {
      if (Capacitor.getPlatform() === 'android') {
        // Configure navigation bar for Android
        await NavigationBar.setNavigationBarColor({ 
          color: '#ffffff', 
          darkButtons: true 
        });
      }
    } catch (error) {
      // Navigation bar configuration failed
    }
  }
}
