import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shawon.dailyhomedev',
  appName: 'DailyHomeDev',
  webDir: 'dist/daily-home/browser',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#ffffffff",
    },
  }
};

export default config;