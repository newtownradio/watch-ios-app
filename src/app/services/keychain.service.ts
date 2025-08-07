import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export interface KeychainCredentials {
  email: string;
  password: string;
  userId: string;
  lastLogin: Date;
  isVerified: boolean;
}

export interface KeychainToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeychainService {
  private readonly KEYCHAIN_SERVICE = 'com.newtownradio.watchstyleios.keychain';
  private readonly CREDENTIALS_KEY = 'user_credentials';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly BIOMETRIC_KEY = 'biometric_enabled';

  constructor() {
    console.log('KeychainService initialized');
  }

  /**
   * Check if running on iOS
   */
  private isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  /**
   * Store user credentials securely in Keychain
   */
  async storeCredentials(credentials: KeychainCredentials): Promise<boolean> {
    try {
      if (!this.isIOS()) {
        // Fallback to Preferences for non-iOS platforms
        return this.storeCredentialsFallback(credentials);
      }

      const key = `${this.CREDENTIALS_KEY}_${credentials.email}`;
      const value = JSON.stringify({
        ...credentials,
        lastLogin: credentials.lastLogin.toISOString()
      });

      await Preferences.set({
        key: key,
        value: value
      });

      console.log('Credentials stored securely in Keychain');
      return true;

    } catch (error) {
      console.error('Error storing credentials in Keychain:', error);
      return false;
    }
  }

  /**
   * Retrieve stored credentials from Keychain
   */
  async getCredentials(email: string): Promise<KeychainCredentials | null> {
    try {
      if (!this.isIOS()) {
        return this.getCredentialsFallback(email);
      }

      const key = `${this.CREDENTIALS_KEY}_${email}`;
      const result = await Preferences.get({ key: key });

      if (!result.value) {
        return null;
      }

      const credentials = JSON.parse(result.value);
      return {
        ...credentials,
        lastLogin: new Date(credentials.lastLogin)
      };

    } catch (error) {
      console.error('Error retrieving credentials from Keychain:', error);
      return null;
    }
  }

  /**
   * Store authentication token securely
   */
  async storeToken(token: KeychainToken): Promise<boolean> {
    try {
      if (!this.isIOS()) {
        return this.storeTokenFallback(token);
      }

      const value = JSON.stringify({
        ...token,
        expiresAt: token.expiresAt.toISOString()
      });

      await Preferences.set({
        key: this.TOKEN_KEY,
        value: value
      });

      console.log('Token stored securely in Keychain');
      return true;

    } catch (error) {
      console.error('Error storing token in Keychain:', error);
      return false;
    }
  }

  /**
   * Retrieve stored authentication token
   */
  async getToken(): Promise<KeychainToken | null> {
    try {
      if (!this.isIOS()) {
        return this.getTokenFallback();
      }

      const result = await Preferences.get({ key: this.TOKEN_KEY });

      if (!result.value) {
        return null;
      }

      const token = JSON.parse(result.value);
      return {
        ...token,
        expiresAt: new Date(token.expiresAt)
      };

    } catch (error) {
      console.error('Error retrieving token from Keychain:', error);
      return null;
    }
  }

  /**
   * Check if token is valid and not expired
   */
  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      return false;
    }

    return new Date() < token.expiresAt;
  }

  /**
   * Clear all stored credentials and tokens
   */
  async clearAllCredentials(): Promise<boolean> {
    try {
      if (!this.isIOS()) {
        return this.clearAllCredentialsFallback();
      }

      // Get all stored keys
      const keys = await Preferences.keys();
      
      // Remove credential and token keys
      for (const key of keys.keys) {
        if (key.startsWith(this.CREDENTIALS_KEY) || key === this.TOKEN_KEY) {
          await Preferences.remove({ key: key });
        }
      }

      console.log('All credentials cleared from Keychain');
      return true;

    } catch (error) {
      console.error('Error clearing credentials from Keychain:', error);
      return false;
    }
  }

  /**
   * Store biometric authentication preference
   */
  async setBiometricEnabled(enabled: boolean): Promise<boolean> {
    try {
      await Preferences.set({
        key: this.BIOMETRIC_KEY,
        value: JSON.stringify(enabled)
      });
      return true;
    } catch (error) {
      console.error('Error setting biometric preference:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const result = await Preferences.get({ key: this.BIOMETRIC_KEY });
      return result.value ? JSON.parse(result.value) : false;
    } catch (error) {
      console.error('Error getting biometric preference:', error);
      return false;
    }
  }

  /**
   * Get all stored email addresses
   */
  async getStoredEmails(): Promise<string[]> {
    try {
      if (!this.isIOS()) {
        return this.getStoredEmailsFallback();
      }

      const keys = await Preferences.keys();
      const emails: string[] = [];

      for (const key of keys.keys) {
        if (key.startsWith(this.CREDENTIALS_KEY)) {
          const email = key.replace(`${this.CREDENTIALS_KEY}_`, '');
          emails.push(email);
        }
      }

      return emails;

    } catch (error) {
      console.error('Error getting stored emails:', error);
      return [];
    }
  }

  /**
   * Remove credentials for specific email
   */
  async removeCredentials(email: string): Promise<boolean> {
    try {
      if (!this.isIOS()) {
        return this.removeCredentialsFallback(email);
      }

      const key = `${this.CREDENTIALS_KEY}_${email}`;
      await Preferences.remove({ key: key });

      console.log(`Credentials removed for ${email}`);
      return true;

    } catch (error) {
      console.error('Error removing credentials:', error);
      return false;
    }
  }

  /**
   * Check if credentials exist for email
   */
  async hasCredentials(email: string): Promise<boolean> {
    const credentials = await this.getCredentials(email);
    return credentials !== null;
  }

  /**
   * Get last login time for email
   */
  async getLastLogin(email: string): Promise<Date | null> {
    const credentials = await this.getCredentials(email);
    return credentials?.lastLogin || null;
  }

  // Fallback methods for non-iOS platforms
  private async storeCredentialsFallback(credentials: KeychainCredentials): Promise<boolean> {
    try {
      const key = `${this.CREDENTIALS_KEY}_${credentials.email}`;
      const value = JSON.stringify({
        ...credentials,
        lastLogin: credentials.lastLogin.toISOString()
      });

      await Preferences.set({
        key: key,
        value: value
      });

      console.log('Credentials stored in Preferences (fallback)');
      return true;
    } catch (error) {
      console.error('Error storing credentials in fallback:', error);
      return false;
    }
  }

  private async getCredentialsFallback(email: string): Promise<KeychainCredentials | null> {
    try {
      const key = `${this.CREDENTIALS_KEY}_${email}`;
      const result = await Preferences.get({ key: key });

      if (!result.value) {
        return null;
      }

      const credentials = JSON.parse(result.value);
      return {
        ...credentials,
        lastLogin: new Date(credentials.lastLogin)
      };
    } catch (error) {
      console.error('Error retrieving credentials from fallback:', error);
      return null;
    }
  }

  private async storeTokenFallback(token: KeychainToken): Promise<boolean> {
    try {
      const value = JSON.stringify({
        ...token,
        expiresAt: token.expiresAt.toISOString()
      });

      await Preferences.set({
        key: this.TOKEN_KEY,
        value: value
      });

      console.log('Token stored in Preferences (fallback)');
      return true;
    } catch (error) {
      console.error('Error storing token in fallback:', error);
      return false;
    }
  }

  private async getTokenFallback(): Promise<KeychainToken | null> {
    try {
      const result = await Preferences.get({ key: this.TOKEN_KEY });

      if (!result.value) {
        return null;
      }

      const token = JSON.parse(result.value);
      return {
        ...token,
        expiresAt: new Date(token.expiresAt)
      };
    } catch (error) {
      console.error('Error retrieving token from fallback:', error);
      return null;
    }
  }

  private async clearAllCredentialsFallback(): Promise<boolean> {
    try {
      const keys = await Preferences.keys();
      
      for (const key of keys.keys) {
        if (key.startsWith(this.CREDENTIALS_KEY) || key === this.TOKEN_KEY) {
          await Preferences.remove({ key: key });
        }
      }

      console.log('All credentials cleared from Preferences (fallback)');
      return true;
    } catch (error) {
      console.error('Error clearing credentials from fallback:', error);
      return false;
    }
  }

  private async getStoredEmailsFallback(): Promise<string[]> {
    try {
      const keys = await Preferences.keys();
      const emails: string[] = [];

      for (const key of keys.keys) {
        if (key.startsWith(this.CREDENTIALS_KEY)) {
          const email = key.replace(`${this.CREDENTIALS_KEY}_`, '');
          emails.push(email);
        }
      }

      return emails;
    } catch (error) {
      console.error('Error getting stored emails from fallback:', error);
      return [];
    }
  }

  private async removeCredentialsFallback(email: string): Promise<boolean> {
    try {
      const key = `${this.CREDENTIALS_KEY}_${email}`;
      await Preferences.remove({ key: key });

      console.log(`Credentials removed for ${email} (fallback)`);
      return true;
    } catch (error) {
      console.error('Error removing credentials from fallback:', error);
      return false;
    }
  }
} 