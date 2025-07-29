import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.newtownradio.watchios',
  appName: 'watch-ios',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
