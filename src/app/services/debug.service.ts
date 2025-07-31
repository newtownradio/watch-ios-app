import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private isDebugMode = true; // Set to false for production

  log(message: string, data?: any) {
    if (this.isDebugMode) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  error(message: string, error?: any) {
    if (this.isDebugMode) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  }

  warn(message: string, data?: any) {
    if (this.isDebugMode) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  // Test network connectivity
  async testNetworkConnectivity(): Promise<boolean> {
    try {
      this.log('Testing network connectivity...');
      
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.log('Network connectivity: OK');
        return true;
      } else {
        this.error('Network connectivity test failed');
        return false;
      }
    } catch (error) {
      this.error('Network connectivity test failed', error);
      return false;
    }
  }

  // Test ReSend API connectivity
  async testReSendConnectivity(): Promise<boolean> {
    try {
      this.log('Testing ReSend API connectivity...');
      
      const response = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer re_XfDN7Ek7_KDHYmDEMUQhD5SFS98phG7gP',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.log('ReSend API connectivity: OK');
        return true;
      } else {
        this.error('ReSend API connectivity test failed');
        return false;
      }
    } catch (error) {
      this.error('ReSend API connectivity test failed', error);
      return false;
    }
  }

  // Test local storage
  testLocalStorage(): boolean {
    try {
      this.log('Testing local storage...');
      
      const testKey = 'debug_test';
      const testValue = 'test_value';
      
      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrievedValue === testValue) {
        this.log('Local storage: OK');
        return true;
      } else {
        this.error('Local storage test failed');
        return false;
      }
    } catch (error) {
      this.error('Local storage test failed', error);
      return false;
    }
  }

  // Get system information
  getSystemInfo(): any {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString()
    };
    
    this.log('System info:', info);
    return info;
  }

  // Test all services
  async runAllTests(): Promise<any> {
    this.log('Running all debug tests...');
    
    const results = {
      network: await this.testNetworkConnectivity(),
      resend: await this.testReSendConnectivity(),
      localStorage: this.testLocalStorage(),
      systemInfo: this.getSystemInfo()
    };
    
    this.log('All test results:', results);
    return results;
  }
} 