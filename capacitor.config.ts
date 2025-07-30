import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.colinilgen.watchios',
  appName: 'watch-ios',
  webDir: 'dist/watch-ios/browser',
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff',
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: true,
    webViewAllowsBackForwardNavigationGestures: true,
    webViewAllowsLinkPreview: false,
    webViewAllowsInlineMediaPlayback: true,
    webViewMediaPlaybackRequiresUserAction: false,
    webViewAllowsBackForwardNavigationGestures: true,
    webViewAllowsLinkPreview: false,
    webViewAllowsInlineMediaPlayback: true,
    webViewMediaPlaybackRequiresUserAction: false,
    webViewAllowsBackForwardNavigationGestures: true,
    webViewAllowsLinkPreview: false,
    webViewAllowsInlineMediaPlayback: true,
    webViewMediaPlaybackRequiresUserAction: false
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
