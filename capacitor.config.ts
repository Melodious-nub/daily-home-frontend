/// <reference types="@capacitor-community/safe-area" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shawon.dailyhome',
  appName: 'DailyHome',
  webDir: 'dist/daily-home/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true
    },
    "Keyboard": {
      "resize": "body",
      "style": "DARK",
      "resizeOnFullScreen": true
    },
    App: {
      backButtonDefaultBehavior: "auto"
    },
    SafeArea: {
      enabled: true,
      customColorsForSystemBars: true,
      statusBarColor: '#ffffff',
      statusBarContent: 'dark',
      navigationBarColor: '#ffffff',
      navigationBarContent: 'dark',
      offset: 0,
    },
  },
  android: {
    backgroundColor: "#ffffff"
  }
};

export default config;