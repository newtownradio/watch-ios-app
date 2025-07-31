import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private debugMode = true; // Set to false in production

  constructor() {
    if (this.debugMode) {
      this.log('Debug service initialized');
    }
  }

  log(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  error(message: string, error?: any): void {
    if (this.debugMode) {
      console.error(`[DEBUG ERROR] ${message}`, error || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.debugMode) {
      console.warn(`[DEBUG WARN] ${message}`, data || '');
    }
  }

  // Test Firebase connectivity
  async testFirebaseConnectivity(): Promise<boolean> {
    try {
      this.log('Testing Firebase connectivity...');
      
      // Test basic network connectivity
      const networkTest = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      this.log('Basic network connectivity: OK');
      
      // Test Firebase-specific endpoints
      const firebaseTest = await fetch('https://firebase.google.com', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      this.log('Firebase connectivity: OK');
      return true;
    } catch (error) {
      this.error('Firebase connectivity test failed', error);
      return false;
    }
  }

  // Test specific service endpoints
  async testServiceEndpoint(url: string): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      this.log(`Testing endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      const responseTime = Date.now() - startTime;
      this.log(`Endpoint test successful: ${url} (${responseTime}ms)`);
      
      return {
        success: true,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.error(`Endpoint test failed: ${url}`, error);
      
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get system information for debugging
  getSystemInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : 'Not available',
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight
      },
      location: {
        href: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        pathname: window.location.pathname
      }
    };
  }

  // Log system information
  logSystemInfo(): void {
    if (this.debugMode) {
      const systemInfo = this.getSystemInfo();
      this.log('System Information', systemInfo);
    }
  }

  // Test localStorage and sessionStorage
  testStorage(): { localStorage: boolean; sessionStorage: boolean; quotaExceeded: boolean } {
    const result = {
      localStorage: false,
      sessionStorage: false,
      quotaExceeded: false
    };

    try {
      // Test localStorage
      const testKey = '__debug_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      result.localStorage = true;
    } catch (error) {
      this.error('localStorage test failed', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        result.quotaExceeded = true;
      }
    }

    try {
      // Test sessionStorage
      const testKey = '__debug_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      result.sessionStorage = true;
    } catch (error) {
      this.error('sessionStorage test failed', error);
    }

    this.log('Storage test results', result);
    return result;
  }
} 