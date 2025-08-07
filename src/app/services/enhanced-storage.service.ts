import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnhancedStorageService {
  private readonly STORAGE_PREFIX = 'watch_ios_';

  /**
   * Set a value in localStorage with error handling
   */
  setItem(key: string, value: any): boolean {
    try {
      const fullKey = this.STORAGE_PREFIX + key;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(fullKey, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  }

  /**
   * Get a value from localStorage with error handling
   */
  getItem<T>(key: string): T | null {
    try {
      const fullKey = this.STORAGE_PREFIX + key;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      const fullKey = this.STORAGE_PREFIX + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  }

  /**
   * Clear all app-related localStorage items
   */
  clearAll(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): { totalKeys: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX));
      let totalSize = 0;
      
      appKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      });

      return {
        totalKeys: appKeys.length,
        totalSize
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalKeys: 0, totalSize: 0 };
    }
  }
} 