import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.newtownradio.watchiosapp',
  appName: 'Watch iOS App',
  webDir: 'dist/watch-ios/browser',
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff',
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: false,
    webViewAllowsBackForwardNavigationGestures: true,
    webViewAllowsLinkPreview: false,
    webViewAllowsInlineMediaPlayback: true,
    webViewMediaPlaybackRequiresUserAction: false,
    // Fix layout constraint issues
    webViewAllowsSafeBrowsing: false,
    webViewAllowsProtectedMedia: false,
    // Disable keyboard toolbar to prevent constraint conflicts
    keyboardAccessoryBarEnabled: false,
    // Improve viewport handling
    viewportFit: 'cover'
  },
  server: {
    androidScheme: 'https'
  },
  // Add plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
