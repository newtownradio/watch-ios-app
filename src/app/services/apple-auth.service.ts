import { Injectable, inject } from '@angular/core';
import { DataPersistenceService } from './data-persistence.service';
import { User } from '../models/bid.interface';

export interface AppleAuthResponse {
  success: boolean;
  message: string;
  data?: User;
  error?: string;
}

export interface AppleUser {
  id: string;
  email?: string;
  name?: string;
  idVerified: boolean;
  disclaimerSigned: boolean;
  policySigned: boolean;
  termsSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AppleAuthService {
  private dataService = inject(DataPersistenceService);

  constructor() {
    console.log('AppleAuthService initialized');
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<AppleAuthResponse> {
    try {
      console.log('Starting Apple Sign In...');

      // Check if we're on iOS
      if (!this.isIOS()) {
        return {
          success: false,
          message: 'Apple Sign In is only available on iOS devices.',
          error: 'PLATFORM_NOT_SUPPORTED'
        };
      }

      // For now, simulate Apple Sign In
      // In production, this would use Apple's ASAuthorizationController
      const appleUser = await this.simulateAppleSignIn();

      if (appleUser) {
        // Save user locally
        this.dataService.saveUser(appleUser as User);
        this.dataService.setCurrentUser(appleUser as User);

        console.log('Apple Sign In successful:', appleUser.id);
        return {
          success: true,
          message: 'Sign in successful!',
          data: appleUser as User
        };
      } else {
        return {
          success: false,
          message: 'Apple Sign In was cancelled or failed.',
          error: 'SIGN_IN_CANCELLED'
        };
      }

    } catch (error: any) {
      console.error('Apple Sign In error:', error);
      return {
        success: false,
        message: 'Sign in failed. Please try again.',
        error: error.message
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.dataService.isAuthenticated();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.dataService.getCurrentUser();
  }

  /**
   * Logout user
   */
  logout(): void {
    this.dataService.logout();
    console.log('User logged out');
  }

  /**
   * Check if running on iOS
   */
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Simulate Apple Sign In (for development)
   * In production, this would be replaced with actual Apple Sign In
   */
  private async simulateAppleSignIn(): Promise<AppleUser | null> {
    return new Promise((resolve) => {
      // Simulate Apple Sign In flow
      const user: AppleUser = {
        id: 'apple_user_' + Date.now(),
        email: 'user@privaterelay.appleid.com', // Apple's private relay email
        name: 'Apple User',
        idVerified: true, // Apple users are pre-verified
        disclaimerSigned: true,
        policySigned: true,
        termsSigned: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Simulate network delay
      setTimeout(() => {
        resolve(user);
      }, 1000);
    });
  }

  /**
   * Get Apple Sign In status
   */
  getAppleSignInStatus(): { available: boolean; reason?: string } {
    if (!this.isIOS()) {
      return { 
        available: false, 
        reason: 'Apple Sign In is only available on iOS devices' 
      };
    }

    // Check if Apple Sign In is available (iOS 13+)
    const isIOS13Plus = this.getIOSVersion() >= 13;
    if (!isIOS13Plus) {
      return { 
        available: false, 
        reason: 'Apple Sign In requires iOS 13 or later' 
      };
    }

    return { available: true };
  }

  /**
   * Get iOS version
   */
  private getIOSVersion(): number {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Create demo Apple user for testing
   */
  createDemoAppleUser(): AppleUser {
    const demoUser: AppleUser = {
      id: 'apple_demo_user',
      email: 'demo@privaterelay.appleid.com',
      name: 'Demo Apple User',
      idVerified: true,
      disclaimerSigned: true,
      policySigned: true,
      termsSigned: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataService.saveUser(demoUser as User);
    this.dataService.setCurrentUser(demoUser as User);

    return demoUser;
  }
} 