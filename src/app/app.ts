import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { BottomNav } from "./layout/bottom-nav/bottom-nav";
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    BottomNav
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      this.configureStatusBar();
    }
  }

  private async configureStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Light }); // Dark icons (light background)
      await StatusBar.setBackgroundColor({ color: '#000000' }); // White background
      await StatusBar.setOverlaysWebView({ overlay: false }); // Avoids content under status bar
      await StatusBar.show();
    } catch (error) {
      console.error('Failed to configure status bar:', error);
    }
  }
}
