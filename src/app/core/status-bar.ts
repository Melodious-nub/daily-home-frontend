// status-bar.service.ts
import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class StatusBarService {
  async init() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.show();

      // Configure navigation bar (Android only)
      if (Capacitor.getPlatform() === 'android') {
        await this.setNavigationBarColor('#000000', Style.Dark);
      }
    } catch (error) {
      console.error('Status bar/navigation configuration failed:', error);
    }
  }

  private async setNavigationBarColor(color: string, style: Style) {
    try {
      // @ts-ignore - NavigationBar plugin might not be in types
      if (typeof NavigationBar !== 'undefined') {
        // @ts-ignore
        await NavigationBar.setColor({ color, lightButtons: style === Style.Dark });
      }
    } catch (error) {
      console.warn('NavigationBar plugin not installed or failed:', error);
    }
  }
}