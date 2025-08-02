import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from "./layout/header/header";
import { BottomNav } from "./layout/bottom-nav/bottom-nav";
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Auth } from './core/services/auth';
import { NavigationService } from './core/services/navigation.service';
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
  isInitialized = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private navigationService: NavigationService
  ) {
    // Subscribe to authentication changes
    this.auth.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    // Subscribe to initialization state
    this.auth.isInitialized$.subscribe(initialized => {
      this.isInitialized = initialized;
      
      // Only handle routing after initialization
      if (initialized) {
        this.handleInitialRouting();
      }
    });
  }

  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      this.configureNativeUI();
      this.configureKeyboard();
    }
  }

  private handleInitialRouting(): void {
    // Check if user should be redirected to login
    if (!this.isAuthenticated && this.auth.shouldRedirectToLogin()) {
      this.router.navigate(['/login']);
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
        await StatusBar.setOverlaysWebView({ overlay: false }); // Don't overlay content - prevents scroll issues
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

  private async configureKeyboard() {
    try {
      if (Capacitor.getPlatform() === 'android') {
        // Configure keyboard behavior for Android
        await this.navigationService.setResizeMode('native');
        await this.navigationService.setScroll(false);
        await this.navigationService.setAccessoryBarVisible(false);
        console.log('Keyboard configuration applied successfully');
      }
    } catch (error) {
      console.error('Keyboard configuration failed:', error);
    }
  }
}
