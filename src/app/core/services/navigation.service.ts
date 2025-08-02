import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationHistory: string[] = [];
  private isBackButtonEnabled = true;

  constructor(private router: Router) {
    this.initializeNavigationHandling();
  }

  private async initializeNavigationHandling() {
    if (Capacitor.isNativePlatform()) {
      try {
        // Handle back button press
        App.addListener('backButton', ({ canGoBack }) => {
          console.log('Back button pressed, canGoBack:', canGoBack);
          this.handleBackButton();
        });

        // Handle keyboard events
        Keyboard.addListener('keyboardWillShow', (info) => {
          console.log('Keyboard will show:', info);
          this.handleKeyboardShow(info);
        });

        Keyboard.addListener('keyboardWillHide', () => {
          console.log('Keyboard will hide');
          this.handleKeyboardHide();
        });

        console.log('Navigation handling initialized successfully');
      } catch (error) {
        console.error('Failed to initialize navigation handling:', error);
      }

      // Track navigation history
      this.router.events.subscribe((event: any) => {
        if (event.url) {
          this.addToHistory(event.url);
        }
      });
    } else {
      console.log('Not on native platform, skipping navigation initialization');
    }
  }

  private handleBackButton() {
    const currentUrl = this.router.url;
    
    // If we're on login page, exit app
    if (currentUrl === '/login') {
      this.exitApp();
      return;
    }
    
    if (this.navigationHistory.length > 1) {
      // Remove current route from history
      this.navigationHistory.pop();
      
      // Navigate to previous route
      const previousRoute = this.navigationHistory[this.navigationHistory.length - 1];
      if (previousRoute) {
        this.router.navigateByUrl(previousRoute);
      }
    } else {
      // No previous route, exit app
      this.exitApp();
    }
  }

  private addToHistory(url: string) {
    // Don't add duplicate consecutive routes
    if (this.navigationHistory[this.navigationHistory.length - 1] !== url) {
      this.navigationHistory.push(url);
    }
  }

  private async exitApp() {
    try {
      await App.exitApp();
    } catch (error) {
      console.error('Failed to exit app:', error);
    }
  }

  private handleKeyboardShow(info: any) {
    // You can add custom logic here when keyboard shows
    console.log('Keyboard will show:', info);
    
    // Add class to body to handle keyboard styling
    if (typeof document !== 'undefined') {
      document.body.classList.add('keyboard-open');
      document.body.style.backgroundColor = '#ffffff';
    }
  }

  private handleKeyboardHide() {
    // You can add custom logic here when keyboard hides
    console.log('Keyboard will hide');
    
    // Remove class from body
    if (typeof document !== 'undefined') {
      document.body.classList.remove('keyboard-open');
      document.body.style.backgroundColor = '#ffffff';
    }
  }

  // Public methods for manual navigation control
  public canGoBack(): boolean {
    const currentUrl = this.router.url;
    
    // If we're on login page, we can't go back (will exit app)
    if (currentUrl === '/login') {
      return false;
    }
    
    return this.navigationHistory.length > 1;
  }

  public goBack(): void {
    this.handleBackButton();
  }

  public clearHistory(): void {
    this.navigationHistory = [];
  }

  public getHistory(): string[] {
    return [...this.navigationHistory];
  }

  // Keyboard control methods
  public async hideKeyboard(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Keyboard.hide();
      } catch (error) {
        console.error('Failed to hide keyboard:', error);
      }
    }
  }

  public async showKeyboard(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Keyboard.show();
      } catch (error) {
        console.error('Failed to show keyboard:', error);
      }
    }
  }

  public async setAccessoryBarVisible(visible: boolean): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Keyboard.setAccessoryBarVisible({ isVisible: visible });
      } catch (error) {
        console.error('Failed to set accessory bar visibility:', error);
      }
    }
  }

  public async setScroll(disabled: boolean): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Keyboard.setScroll({ isDisabled: disabled });
      } catch (error) {
        console.error('Failed to set keyboard scroll:', error);
      }
    }
  }

  public async setResizeMode(mode: 'body' | 'ionic' | 'native'): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Keyboard.setResizeMode({ mode: mode as any });
      } catch (error) {
        console.error('Failed to set keyboard resize mode:', error);
      }
    }
  }
} 