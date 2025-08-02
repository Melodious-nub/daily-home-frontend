import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shawon.dailyhome',
  appName: 'DailyHome',
  webDir: 'dist/daily-home/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#ffffff",
      androidNavigationBarColor: "#ffffff",
      androidNavigationBarDividerColor: "#e0e0e0",
      androidBackgroundColor: "#ffffff"
    },
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
    }
  },
  android: {
    backgroundColor: "#ffffff"
  }
};

export default config;