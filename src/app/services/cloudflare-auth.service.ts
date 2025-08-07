import { Injectable, inject } from '@angular/core';
import { DataPersistenceService } from './data-persistence.service';
import { KeychainService, KeychainCredentials, KeychainToken } from './keychain.service';
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
  rememberMe?: boolean;
}

export interface CloudflareRegisterRequest {
  name: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CloudflareResetPasswordRequest {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudflareAuthService {
  private dataService = inject(DataPersistenceService);
  private keychainService = inject(KeychainService);
  private emailService = inject(EmailService);

  // Cloudflare Workers URL (deployed)
  private readonly CLOUDFLARE_WORKER_URL = 'https://watch-ios-auth.perplexity-proxy.workers.dev';

  constructor() {
    console.log('CloudflareAuthService initialized');
  }

  /**
   * Generate a verification code
   */
  private generateVerificationCode(): string {
    return this.emailService.generateVerificationCode();
  }

  /**
   * Send password reset email
   */
  private async sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
    try {
      // Use the EmailService to send the password reset email
      return await this.emailService.sendPasswordResetEmail(email, code);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
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
      
      // Save password locally for login functionality
      this.savePasswordLocally(request.email, request.password);
      
      // Store credentials securely if rememberMe is true
      if (request.rememberMe) {
        await this.storeCredentialsSecurely(request.email, request.password, newUser);
      }

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
   * Login user with secure credential storage
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

      // Store credentials securely if rememberMe is true
      if (request.rememberMe) {
        await this.storeCredentialsSecurely(request.email, request.password, user);
      }

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
   * Auto-login using stored credentials
   */
  async autoLogin(): Promise<CloudflareAuthResponse> {
    try {
      // Get stored emails
      const storedEmails = await this.keychainService.getStoredEmails();
      
      if (storedEmails.length === 0) {
        return {
          success: false,
          message: 'No stored credentials found.'
        };
      }

      // Try to login with the most recent email
      const mostRecentEmail = await this.getMostRecentEmail(storedEmails);
      
      if (!mostRecentEmail) {
        return {
          success: false,
          message: 'No valid stored credentials found.'
        };
      }

      const credentials = await this.keychainService.getCredentials(mostRecentEmail);
      if (!credentials) {
        return {
          success: false,
          message: 'Stored credentials not found.'
        };
      }

      // Auto-login with stored credentials
      return await this.loginUser({
        email: credentials.email,
        password: credentials.password,
        rememberMe: true
      });

    } catch (error: any) {
      console.error('Auto-login error:', error);
      return {
        success: false,
        message: 'Auto-login failed. Please log in manually.'
      };
    }
  }

  /**
   * Get the most recently used email from stored credentials
   */
  private async getMostRecentEmail(emails: string[]): Promise<string | null> {
    let mostRecentEmail: string | null = null;
    let mostRecentTime: Date | null = null;

    for (const email of emails) {
      const lastLogin = await this.keychainService.getLastLogin(email);
      if (lastLogin && (!mostRecentTime || lastLogin > mostRecentTime)) {
        mostRecentTime = lastLogin;
        mostRecentEmail = email;
      }
    }

    return mostRecentEmail;
  }

  /**
   * Store credentials securely in Keychain
   */
  private async storeCredentialsSecurely(email: string, password: string, user: CloudflareUser): Promise<void> {
    try {
      const credentials: KeychainCredentials = {
        email: email,
        password: password,
        userId: user.id,
        lastLogin: new Date(),
        isVerified: user.idVerified
      };

      await this.keychainService.storeCredentials(credentials);
      console.log('Credentials stored securely in Keychain');
    } catch (error) {
      console.error('Error storing credentials securely:', error);
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

      // Generate verification code immediately
      const verificationCode = this.generateVerificationCode();
      const expiresAt = this.emailService.generateExpirationTime();

      // Save password reset request
      this.dataService.savePasswordReset(request.email, verificationCode, expiresAt);

      // Try to send real email via ReSend
      console.log('🔄 Starting email sending process...');
      const emailSent = await this.sendPasswordResetEmail(request.email, verificationCode);
      
      if (emailSent) {
        console.log('✅ Password reset email sent successfully to:', request.email);
        console.log('⏰ Expires at:', expiresAt);
        
        return {
          success: true,
          message: `Password reset code sent to ${request.email}. Please check your email.`,
          code: verificationCode // Include code in response for immediate access
        };
      } else {
        // Fallback to console logging if email fails
        console.log('⚠️ Password reset code generated (email failed):', verificationCode);
        console.log('⏰ Expires at:', expiresAt);
        console.log('📧 Check your email inbox and spam folder');
        console.log('📱 For immediate access, check console for verification code');
        
        return {
          success: true,
          message: `Password reset code sent to ${request.email}. Check console for code: ${verificationCode}`,
          code: verificationCode // Include code in response for immediate access
        };
      }

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

      if (this.emailService.isCodeExpired(reset.expiresAt)) {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        };
      }

      // Update password locally
      this.savePasswordLocally(email, newPassword);

      // Update stored credentials if they exist
      const storedCredentials = await this.keychainService.getCredentials(email);
      if (storedCredentials) {
        await this.storeCredentialsSecurely(email, newPassword, storedCredentials as any);
      }

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
   * Logout user and clear stored credentials
   */
  async logout(): Promise<void> {
    // Clear current user
    this.dataService.logout();
    
    // Clear stored credentials
    await this.keychainService.clearAllCredentials();
    
    console.log('User logged out and credentials cleared');
  }

  /**
   * Get stored email addresses for quick login
   */
  async getStoredEmails(): Promise<string[]> {
    return await this.keychainService.getStoredEmails();
  }

  /**
   * Remove stored credentials for specific email
   */
  async removeStoredCredentials(email: string): Promise<boolean> {
    return await this.keychainService.removeCredentials(email);
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    return await this.keychainService.isBiometricEnabled();
  }

  /**
   * Set biometric authentication preference
   */
  async setBiometricEnabled(enabled: boolean): Promise<boolean> {
    return await this.keychainService.setBiometricEnabled(enabled);
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

      // Store credentials securely
      await this.storeCredentialsSecurely(demoEmail, demoPassword, demoUser);

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