import { Injectable } from '@angular/core';
import { Listing, Bid, Counteroffer, Watch, User } from '../models/bid.interface';

@Injectable({
  providedIn: 'root'
})
export class DataPersistenceService {

  // Storage keys
  private readonly LISTINGS_KEY = 'watch_ios_listings';
  private readonly FAVORITES_KEY = 'watch_ios_favorites';
  private readonly USERS_KEY = 'watch_ios_users';
  private readonly WATCHES_KEY = 'watch_ios_watches';

  constructor() { }

  // ===== LISTINGS MANAGEMENT =====

  /**
   * Save a new listing
   */
  saveListing(listing: Listing): void {
    const listings = this.getAllListings();
    listings.push(listing);
    this.saveListings(listings);
  }

  /**
   * Update an existing listing
   */
  updateListing(updatedListing: Listing): void {
    const listings = this.getAllListings();
    const index = listings.findIndex(l => l.id === updatedListing.id);
    if (index !== -1) {
      listings[index] = updatedListing;
      this.saveListings(listings);
    }
  }

  /**
   * Get all listings
   */
  getAllListings(): Listing[] {
    const data = localStorage.getItem(this.LISTINGS_KEY);
    if (!data) return [];
    
    const listings = JSON.parse(data);
    
    // Convert date strings back to Date objects
    return listings.map((listing: any) => ({
      ...listing,
      createdAt: new Date(listing.createdAt),
      endTime: new Date(listing.endTime)
    }));
  }

  /**
   * Get listings by seller ID
   */
  getListingsBySeller(sellerId: string): Listing[] {
    return this.getAllListings().filter(listing => listing.sellerId === sellerId);
  }

  /**
   * Get active listings
   */
  getActiveListings(): Listing[] {
    const now = new Date();
    return this.getAllListings().filter(listing => 
      listing.status === 'active' && listing.endTime > now
    );
  }

  /**
   * Delete a listing
   */
  deleteListing(listingId: string): void {
    const listings = this.getAllListings();
    const filtered = listings.filter(l => l.id !== listingId);
    this.saveListings(filtered);
  }

  /**
   * Save listings to localStorage
   */
  private saveListings(listings: Listing[]): void {
    try {
      localStorage.setItem(this.LISTINGS_KEY, JSON.stringify(listings));
    } catch (error) {
      console.error('localStorage quota exceeded, clearing old data and retrying...');
      // Clear old data and retry
      this.clearAllData();
      try {
        localStorage.setItem(this.LISTINGS_KEY, JSON.stringify(listings));
      } catch (retryError) {
        console.error('Failed to save listings even after clearing data:', retryError);
      }
    }
  }

  // ===== FAVORITES MANAGEMENT =====

  /**
   * Add a listing to user's favorites
   */
  addToFavorites(userId: string, listingId: string): void {
    const favorites = this.getUserFavorites(userId);
    if (!favorites.includes(listingId)) {
      favorites.push(listingId);
      this.saveUserFavorites(userId, favorites);
    }
  }

  /**
   * Remove a listing from user's favorites
   */
  removeFromFavorites(userId: string, listingId: string): void {
    const favorites = this.getUserFavorites(userId);
    const filtered = favorites.filter(id => id !== listingId);
    this.saveUserFavorites(userId, filtered);
  }

  /**
   * Check if a listing is in user's favorites
   */
  isFavorited(userId: string, listingId: string): boolean {
    const favorites = this.getUserFavorites(userId);
    return favorites.includes(listingId);
  }

  /**
   * Get user's favorite listings
   */
  getUserFavorites(userId: string): string[] {
    const key = `${this.FAVORITES_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get favorite listings with full data
   */
  getFavoriteListings(userId: string): Listing[] {
    const favoriteIds = this.getUserFavorites(userId);
    const allListings = this.getAllListings();
    return allListings.filter(listing => favoriteIds.includes(listing.id));
  }

  /**
   * Save user favorites to localStorage
   */
  private saveUserFavorites(userId: string, favorites: string[]): void {
    const key = `${this.FAVORITES_KEY}_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch (error) {
      console.error('localStorage quota exceeded for favorites:', error);
    }
  }

  // ===== WATCHES MANAGEMENT =====

  /**
   * Save a watch
   */
  saveWatch(watch: Watch): void {
    const watches = this.getAllWatches();
    const index = watches.findIndex(w => w.id === watch.id);
    if (index !== -1) {
      watches[index] = watch;
    } else {
      watches.push(watch);
    }
    this.saveWatches(watches);
  }

  /**
   * Get all watches
   */
  getAllWatches(): Watch[] {
    const data = localStorage.getItem(this.WATCHES_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get watches by seller ID
   */
  getWatchesBySeller(sellerId: string): Watch[] {
    return this.getAllWatches().filter(watch => watch.sellerId === sellerId);
  }

  /**
   * Get a specific watch by ID
   */
  getWatchById(watchId: string): Watch | undefined {
    return this.getAllWatches().find(watch => watch.id === watchId);
  }

  /**
   * Delete a watch
   */
  deleteWatch(watchId: string): void {
    const watches = this.getAllWatches().filter(watch => watch.id !== watchId);
    this.saveWatches(watches);
  }

  /**
   * Save watches to localStorage
   */
  private saveWatches(watches: Watch[]): void {
    try {
      localStorage.setItem(this.WATCHES_KEY, JSON.stringify(watches));
    } catch (error) {
      console.error('localStorage quota exceeded for watches:', error);
    }
  }

  // ===== USERS MANAGEMENT =====

  /**
   * Save a user
   */
  saveUser(user: User): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.saveUsers(users);
  }

  /**
   * Get all users
   */
  getAllUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get a specific user by ID
   */
  getUserById(userId: string): User | undefined {
    return this.getAllUsers().find(user => user.id === userId);
  }

  /**
   * Save users to localStorage
   */
  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('localStorage quota exceeded for users:', error);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Clear all data (for testing/reset)
   */
  clearAllData(): void {
    localStorage.removeItem(this.LISTINGS_KEY);
    localStorage.removeItem(this.WATCHES_KEY);
    localStorage.removeItem(this.USERS_KEY);
    
    // Clear all favorites keys
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.FAVORITES_KEY)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): { listings: number; watches: number; users: number; totalFavorites: number } {
    const listings = this.getAllListings().length;
    const watches = this.getAllWatches().length;
    const users = this.getAllUsers().length;
    
    // Count total favorites across all users
    let totalFavorites = 0;
    const allUsers = this.getAllUsers();
    allUsers.forEach(user => {
      totalFavorites += this.getUserFavorites(user.id).length;
    });

    return { listings, watches, users, totalFavorites };
  }

  /**
   * Export all data as CSV (for backup and analysis)
   */
  exportAllData(): string {
    const listings = this.getAllListings();
    const watches = this.getAllWatches();
    const users = this.getAllUsers();
    
    let csvContent = '';
    
    // Export listings as CSV
    if (listings.length > 0) {
      csvContent += '=== LISTINGS ===\n';
      csvContent += this.listingsToCSV(listings);
      csvContent += '\n\n';
    }
    
    // Export watches as CSV
    if (watches.length > 0) {
      csvContent += '=== WATCHES ===\n';
      csvContent += this.watchesToCSV(watches);
      csvContent += '\n\n';
    }
    
    // Export users as CSV
    if (users.length > 0) {
      csvContent += '=== USERS ===\n';
      csvContent += this.usersToCSV(users);
      csvContent += '\n\n';
    }
    
    // Export favorites as CSV
    const allFavorites = this.getAllFavorites();
    if (allFavorites.length > 0) {
      csvContent += '=== FAVORITES ===\n';
      csvContent += this.favoritesToCSV(allFavorites);
    }
    
    return csvContent;
  }

  /**
   * Convert listings to CSV format
   */
  private listingsToCSV(listings: Listing[]): string {
    if (listings.length === 0) return '';
    
    const headers = [
      'ID', 'Seller ID', 'Seller Name', 'Title', 'Description', 'Brand', 'Model', 
      'Year', 'Condition', 'Starting Price', 'Current Price', 'Image URL', 
      'Created At', 'End Time', 'Status', 'Bids Count', 'Counteroffers Count'
    ];
    
    const rows = listings.map(listing => [
      listing.id,
      listing.sellerId,
      listing.sellerName,
      `"${listing.title.replace(/"/g, '""')}"`,
      `"${listing.description.replace(/"/g, '""')}"`,
      listing.brand || '',
      listing.model || '',
      listing.year || '',
      listing.condition || '',
      listing.startingPrice,
      listing.currentPrice,
      listing.imageUrl,
      listing.createdAt.toISOString(),
      listing.endTime.toISOString(),
      listing.status,
      listing.bids.length,
      listing.counteroffers.length
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Convert watches to CSV format
   */
  private watchesToCSV(watches: Watch[]): string {
    if (watches.length === 0) return '';
    
    const headers = [
      'ID', 'Title', 'Brand', 'Model', 'Year', 'Condition', 'Description', 
      'Seller ID', 'Asking Price', 'Verification Status', 'Created At', 'Updated At'
    ];
    
    const rows = watches.map(watch => [
      watch.id,
      `"${watch.title.replace(/"/g, '""')}"`,
      watch.brand,
      watch.model,
      watch.year || '',
      watch.condition,
      `"${watch.description.replace(/"/g, '""')}"`,
      watch.sellerId,
      watch.askingPrice,
      watch.verificationStatus,
      watch.createdAt.toISOString(),
      watch.updatedAt.toISOString()
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Convert users to CSV format
   */
  private usersToCSV(users: User[]): string {
    if (users.length === 0) return '';
    
    const headers = [
      'ID', 'Name', 'Email', 'ID Verified', 'Disclaimer Signed', 
      'Policy Signed', 'Verification Date'
    ];
    
    const rows = users.map(user => [
      user.id,
      `"${user.name.replace(/"/g, '""')}"`,
      user.email,
      user.idVerified,
      user.disclaimerSigned,
      user.policySigned,
      user.verificationDate ? user.verificationDate.toISOString() : ''
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Get all favorites data
   */
  private getAllFavorites(): Array<{userId: string, listingId: string}> {
    const allUsers = this.getAllUsers();
    const favorites: Array<{userId: string, listingId: string}> = [];
    
    allUsers.forEach(user => {
      const userFavorites = this.getUserFavorites(user.id);
      userFavorites.forEach(listingId => {
        favorites.push({ userId: user.id, listingId });
      });
    });
    
    return favorites;
  }

  /**
   * Convert favorites to CSV format
   */
  private favoritesToCSV(favorites: Array<{userId: string, listingId: string}>): string {
    if (favorites.length === 0) return '';
    
    const headers = ['User ID', 'Listing ID'];
    const rows = favorites.map(fav => [fav.userId, fav.listingId]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Import data (for restore)
   */
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.listings) {
        this.saveListings(data.listings);
      }
      
      if (data.watches) {
        this.saveWatches(data.watches);
      }
      
      if (data.users) {
        this.saveUsers(data.users);
      }
      
      if (data.favorites) {
        Object.keys(data.favorites).forEach(userId => {
          this.saveUserFavorites(userId, data.favorites[userId]);
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }
}