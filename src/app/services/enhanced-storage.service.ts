import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class EnhancedStorageService {

  /**
   * Set a value in storage (prefers Capacitor Preferences, falls back to localStorage)
   */
  async set(key: string, value: any): Promise<void> {
    try {
      // Try Capacitor Preferences first
      await Preferences.set({
        key: key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      });
    } catch (error) {
      console.warn('Capacitor Preferences failed, falling back to localStorage:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (localError) {
        console.error('Both storage methods failed:', localError);
        throw localError;
      }
    }
  }

  /**
   * Get a value from storage (prefers Capacitor Preferences, falls back to localStorage)
   */
  async get(key: string): Promise<any> {
    try {
      // Try Capacitor Preferences first
      const result = await Preferences.get({ key });
      if (result.value !== null) {
        try {
          return JSON.parse(result.value);
        } catch {
          return result.value;
        }
      }
    } catch (error) {
      console.warn('Capacitor Preferences failed, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
    } catch (localError) {
      console.error('localStorage get failed:', localError);
    }

    return null;
  }

  /**
   * Remove a value from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.warn('Capacitor Preferences remove failed, falling back to localStorage:', error);
    }

    try {
      localStorage.removeItem(key);
    } catch (localError) {
      console.error('localStorage remove failed:', localError);
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.warn('Capacitor Preferences clear failed, falling back to localStorage:', error);
    }

    try {
      localStorage.clear();
    } catch (localError) {
      console.error('localStorage clear failed:', localError);
    }
  }

  /**
   * Get all keys from storage
   */
  async keys(): Promise<string[]> {
    try {
      const result = await Preferences.keys();
      return result.keys;
    } catch (error) {
      console.warn('Capacitor Preferences keys failed, falling back to localStorage:', error);
      return Object.keys(localStorage);
    }
  }
} 