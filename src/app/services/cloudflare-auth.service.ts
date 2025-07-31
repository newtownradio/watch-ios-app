import { Injectable, inject } from '@angular/core';
import { DataPersistenceService } from './data-persistence.service';
import { EmailService } from './email.service';
import { User } from '../models/bid.interface';

export interface CloudflareUser {
  id: string;
  email: string;
  name: string;
  idVerified: boolean;
  disclaimerSigned: boolean;
  policySigned: boolean;
  termsSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloudflareAuthResponse {
  success: boolean;
  message: string;
  data?: CloudflareUser;
  code?: string;
}

export interface CloudflareLoginRequest {
  email: string;
  password: string;
}

export interface CloudflareRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CloudflareResetPasswordRequest {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudflareAuthService {
  private dataService = inject(DataPersistenceService);
  private emailService = inject(EmailService);

  // Cloudflare Workers URL (you'll need to deploy this)
  private readonly CLOUDFLARE_WORKER_URL = 'https://your-worker.your-subdomain.workers.dev';

  constructor() {
    console.log('CloudflareAuthService initialized');
  }

  /**
   * Register a new user
   */
  async registerUser(request: CloudflareRegisterRequest): Promise<CloudflareAuthResponse> {
    try {
      console.log('Registering user with Cloudflare:', request.email);

      // Check if user already exists locally
      const existingUser = this.findUserByEmail(request.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email address.'
        };
      }

      // Create user locally
      const newUser: CloudflareUser = {
        id: this.generateUserId(),
        email: request.email,
        name: request.name,
        idVerified: false,
        disclaimerSigned: true,
        policySigned: true,
        termsSigned: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save user locally
      this.dataService.saveUser(newUser as User);
      this.savePasswordLocally(request.email, request.password);

      // Try to sync with Cloudflare (optional)
      await this.syncToCloudflare(newUser, request.password);

      console.log('User registered successfully:', newUser.id);
      return {
        success: true,
        message: 'Registration successful!',
        data: newUser
      };

    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login user
   */
  async loginUser(request: CloudflareLoginRequest): Promise<CloudflareAuthResponse> {
    try {
      console.log('Logging in user with Cloudflare:', request.email);

      // Check local storage first
      const user = this.findUserByEmail(request.email);
      if (!user) {
        return {
          success: false,
          message: 'User not found. Please register first.'
        };
      }

      // Verify password locally
      const storedPassword = this.getPasswordLocally(request.email);
      if (storedPassword !== request.password) {
        return {
          success: false,
          message: 'Invalid email or password.'
        };
      }

      // Set as current user
      this.dataService.setCurrentUser(user as User);

      console.log('Login successful:', user.id);
      return {
        success: true,
        message: 'Login successful!',
        data: user as CloudflareUser
      };

    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(request: CloudflareResetPasswordRequest): Promise<CloudflareAuthResponse> {
    try {
      console.log('Resetting password for:', request.email);

      // Check if user exists
      const user = this.findUserByEmail(request.email);
      if (!user) {
        return {
          success: false,
          message: 'User not found with this email address.'
        };
      }

      // Generate verification code
      const verificationCode = this.emailService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save password reset request
      this.dataService.savePasswordReset(request.email, verificationCode, expiresAt);

      // In a real app, you'd send this via email
      console.log('Password reset code generated:', verificationCode);
      console.log('Expires at:', expiresAt);

      return {
        success: true,
        message: `Password reset code sent to ${request.email}. Check console for code: ${verificationCode}`
      };

    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
      };
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(email: string, newPassword: string, verificationCode: string): Promise<CloudflareAuthResponse> {
    try {
      console.log('Updating password for:', email);

      // Verify the code
      const reset = this.dataService.getPasswordReset(email);
      if (!reset) {
        return {
          success: false,
          message: 'No password reset request found. Please request a reset first.'
        };
      }

      if (reset.code !== verificationCode) {
        return {
          success: false,
          message: 'Invalid verification code.'
        };
      }

      if (new Date() >= reset.expiresAt) {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        };
      }

      // Update password
      this.savePasswordLocally(email, newPassword);

      // Clear the reset request
      this.dataService.clearPasswordReset(email);

      console.log('Password updated successfully');
      return {
        success: true,
        message: 'Password updated successfully!'
      };

    } catch (error: any) {
      console.error('Password update error:', error);
      return {
        success: false,
        message: 'Password update failed. Please try again.'
      };
    }
  }

  /**
   * Check if user exists
   */
  async checkUserExists(): Promise<boolean> {
    const users = this.dataService.getAllUsers();
    return users.length > 0;
  }

  /**
   * Get current user
   */
  getCurrentUser(): CloudflareUser | null {
    const user = this.dataService.getCurrentUser();
    return user ? user as CloudflareUser : null;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.dataService.logout();
    console.log('User logged out');
  }

  /**
   * Generate a unique user ID
   */
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Find user by email
   */
  private findUserByEmail(email: string): CloudflareUser | null {
    const users = this.dataService.getAllUsers();
    const user = users.find(u => u.email === email);
    return user ? user as CloudflareUser : null;
  }

  /**
   * Save password locally
   */
  private savePasswordLocally(email: string, password: string): void {
    try {
      localStorage.setItem(`password_${email}`, password);
    } catch (error) {
      console.error('Error saving password locally:', error);
    }
  }

  /**
   * Get password locally
   */
  private getPasswordLocally(email: string): string | null {
    try {
      return localStorage.getItem(`password_${email}`);
    } catch (error) {
      console.error('Error getting password locally:', error);
      return null;
    }
  }

  /**
   * Sync user data to Cloudflare (optional)
   */
  private async syncToCloudflare(user: CloudflareUser, password: string): Promise<void> {
    try {
      // This would call your Cloudflare Worker
      const response = await fetch(`${this.CLOUDFLARE_WORKER_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          password: btoa(password) // Base64 encode for transmission
        })
      });

      if (response.ok) {
        console.log('User synced to Cloudflare successfully');
      } else {
        console.log('Cloudflare sync failed, but user saved locally');
      }
    } catch (error) {
      console.log('Cloudflare sync failed, but user saved locally:', error);
    }
  }

  /**
   * Test Cloudflare connectivity
   */
  async testCloudflareConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.CLOUDFLARE_WORKER_URL}/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      console.log('Cloudflare connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Create demo account for App Store reviewers
   */
  async createDemoAccount(): Promise<CloudflareAuthResponse> {
    try {
      const demoEmail = 'demo@watchios.com';
      const demoPassword = 'Demo123!';
      const demoName = 'Demo User';

      // Check if demo user already exists
      const existingUser = this.findUserByEmail(demoEmail);
      if (existingUser) {
        return {
          success: true,
          message: 'Demo account already exists. You can login with demo@watchios.com / Demo123!',
          data: existingUser
        };
      }

      // Create demo user
      const demoUser: CloudflareUser = {
        id: this.generateUserId(),
        email: demoEmail,
        name: demoName,
        idVerified: true, // Pre-verified for demo
        disclaimerSigned: true,
        policySigned: true,
        termsSigned: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save demo user locally
      this.dataService.saveUser(demoUser as User);
      this.savePasswordLocally(demoEmail, demoPassword);

      console.log('Demo account created successfully:', demoUser.id);
      return {
        success: true,
        message: 'Demo account created! Login with demo@watchios.com / Demo123!',
        data: demoUser
      };

    } catch (error: any) {
      console.error('Demo account creation error:', error);
      return {
        success: false,
        message: 'Failed to create demo account. Please try again.'
      };
    }
  }
} 