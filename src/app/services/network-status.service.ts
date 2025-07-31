import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
  connectionType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });

  public networkStatus$: Observable<NetworkStatus> = this.networkStatusSubject.asObservable();

  constructor() {
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    // Monitor online/offline events
    window.addEventListener('online', () => {
      this.updateNetworkStatus(true);
    });

    window.addEventListener('offline', () => {
      this.updateNetworkStatus(false);
    });

    // Initial check
    this.checkNetworkConnectivity();
    
    // Periodic connectivity checks (every 30 seconds)
    setInterval(() => {
      this.checkNetworkConnectivity();
    }, 30000);
  }

  private updateNetworkStatus(isOnline: boolean): void {
    const currentStatus = this.networkStatusSubject.value;
    this.networkStatusSubject.next({
      ...currentStatus,
      isOnline,
      lastChecked: new Date()
    });
  }

  async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      this.updateNetworkStatus(true);
      return true;
    } catch (error) {
      console.error('Network connectivity check failed:', error);
      this.updateNetworkStatus(false);
      return false;
    }
  }

  getCurrentStatus(): NetworkStatus {
    return this.networkStatusSubject.value;
  }

  isOnline(): boolean {
    return this.networkStatusSubject.value.isOnline;
  }

  // Test specific service connectivity
  async testServiceConnectivity(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error(`Service connectivity test failed for ${url}:`, error);
      return false;
    }
  }
} 