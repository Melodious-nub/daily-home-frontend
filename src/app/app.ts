import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from "./layout/header/header";
import { BottomNav } from "./layout/bottom-nav/bottom-nav";
import { Capacitor } from '@capacitor/core';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Auth } from './core/services/auth';
import { NavigationService } from './core/services/navigation.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { PreventCopyDirective } from './core/directives/keyboard-handler.directive';
import { SafeArea } from '@capacitor-community/safe-area';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    BottomNav,
    CommonModule,
    PreventCopyDirective
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isAuthenticated = false;
  isInitialized = false;
  isOnLandingPage = false;
  hasCurrentMess = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private navigationService: NavigationService
  ) {
    // Subscribe to authentication changes
    this.auth.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.hasCurrentMess = !!user?.currentMess;
    });

    // Subscribe to initialization state
    this.auth.isInitialized$.subscribe(initialized => {
      this.isInitialized = initialized;
      
      // Only handle routing after initialization
      if (initialized) {
        this.handleInitialRouting();
      }
    });

    // Subscribe to route changes to track landing page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isOnLandingPage = event.url.startsWith('/landing');
    });
  }

  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      this.configureNativeUI();
      this.configureKeyboard();
      this.configureSafeArea();
    }
    
    // Add global event listeners to prevent copy/paste
    this.preventCopyPaste();
  }

  private preventCopyPaste(): void {
    // Prevent copy
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      return false;
    });

    // Prevent cut
    document.addEventListener('cut', (e) => {
      e.preventDefault();
      return false;
    });

    // Prevent paste (except in input fields)
    document.addEventListener('paste', (e) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable="true"]')) {
        e.preventDefault();
        return false;
      }
      return true;
    });

    // Prevent context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Prevent drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
  }

  private handleInitialRouting(): void {
    // Check if user should be redirected to login
    if (!this.isAuthenticated && this.auth.shouldRedirectToLogin()) {
      this.router.navigate(['/login']);
    }
  }

  private async configureNativeUI() {
    try {
      await this.configureNavigationBar();
    } catch (error) {
      // Silent fail for web platform or unsupported devices
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

  private async configureSafeArea() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Enable Safe Area plugin with custom configuration
        await SafeArea.enable({
          config: {
            customColorsForSystemBars: true,
            statusBarColor: '#ffffff',
            statusBarContent: 'dark',
            navigationBarColor: '#ffffff',
            navigationBarContent: 'dark',
            offset: 0,
          }
        });
      }
    } catch (error) {
      console.error('Safe Area configuration failed:', error);
    }
  }

  private async configureKeyboard() {
    try {
      if (Capacitor.getPlatform() === 'android') {
        // Configure keyboard behavior for Android
        await this.navigationService.setResizeMode('native');
        await this.navigationService.setScroll(false);
        await this.navigationService.setAccessoryBarVisible(false);
        // console.log('Keyboard configuration applied successfully');
      }
    } catch (error) {
      console.error('Keyboard configuration failed:', error);
    }
  }
}
