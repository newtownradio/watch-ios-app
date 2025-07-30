import { Injectable } from '@angular/core';
import { Listing, Bid, Counteroffer, Watch, User, Message, Notification } from '../models/bid.interface';

@Injectable({
  providedIn: 'root'
})
export class DataPersistenceService {

  // Storage keys
  private readonly LISTINGS_KEY = 'watch_ios_listings';
  private readonly WATCHES_KEY = 'watch_ios_watches';
  private readonly USERS_KEY = 'watch_ios_users';
  private readonly FAVORITES_KEY = 'watch_ios_favorites_';
  private readonly CURRENT_USER_KEY = 'watch_ios_current_user';
  private readonly MESSAGES_KEY = 'watch_ios_messages';
  private readonly NOTIFICATIONS_KEY = 'watch_ios_notifications';

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
    return listings.map((listing: Listing) => ({
      ...listing,
      createdAt: new Date(listing.createdAt),
      endTime: new Date(listing.endTime)
    }));
  }

  /**
   * Get listings by seller
   */
  getListingsBySeller(sellerId: string): Listing[] {
    return this.getAllListings().filter(listing => listing.sellerId === sellerId);
  }

  /**
   * Get a specific listing by ID
   */
  getListingById(listingId: string): Listing | undefined {
    return this.getAllListings().find(listing => listing.id === listingId);
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
    } catch {
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
    try {
      const users = this.getAllUsers();
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
      } else {
        users.push(user);
      }
      this.saveUsers(users);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  /**
   * Get all users
   */
  getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      if (data) {
        const users = JSON.parse(data);
        return users;
      }
      return [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
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
  private getAllFavorites(): {userId: string, listingId: string}[] {
    const allUsers = this.getAllUsers();
    const favorites: {userId: string, listingId: string}[] = [];
    
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
  private favoritesToCSV(favorites: {userId: string, listingId: string}[]): string {
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

  // ===== AUTHENTICATION METHODS =====

  /**
   * Get current logged in user
   */
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.CURRENT_USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        // Convert dates back to Date objects
        if (user.createdAt) user.createdAt = new Date(user.createdAt);
        if (user.verificationDate) user.verificationDate = new Date(user.verificationDate);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Set current logged in user
   */
  setCurrentUser(user: User): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Update user verification status
   */
  updateUserVerification(userId: string, verified: boolean): void {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].idVerified = verified;
      users[userIndex].verificationDate = new Date();
      this.saveUsers(users);
      
      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.idVerified = verified;
        currentUser.verificationDate = new Date();
        this.setCurrentUser(currentUser);
      }
    }
  }

  /**
   * Validate user identity for ID upload
   */
  validateUserIdentity(userId: string): { isValid: boolean; message: string } {
    const user = this.getUserById(userId);
    if (!user) {
      return { isValid: false, message: 'User not found' };
    }

    // Check if user has required information
    if (!user.name || !user.email) {
      return { 
        isValid: false, 
        message: 'Please complete your profile information before uploading ID' 
      };
    }

    // Check if user is already verified
    if (user.idVerified) {
      return { 
        isValid: true, 
        message: 'User is already verified' 
      };
    }

    return { 
      isValid: true, 
      message: 'User ready for ID verification' 
    };
  }

  /**
   * Get current user's verification status
   */
  getUserVerificationStatus(): { isVerified: boolean; verificationDate?: Date } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { isVerified: false };
    }
    
    return { 
      isVerified: currentUser.idVerified || false,
      verificationDate: currentUser.verificationDate
    };
  }

  /**
   * Create test users for development
   */
  createTestUsers(): void {
    // Always create test users for development
    // const existingUsers = this.getAllUsers();
    // if (existingUsers.length > 0) {
    //   return;
    // }

    const testUsers: User[] = [
      {
        id: 'test-seller-001',
        name: 'Alex Chen',
        email: 'alex.chen@test.com',
        password: 'TestPass123!',
        idVerified: false,
        disclaimerSigned: true,
        policySigned: true,
        termsSigned: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'test-buyer-001',
        name: 'Sarah Mitchell',
        email: 'sarah.m@test.com',
        password: 'TestPass456!',
        idVerified: false,
        disclaimerSigned: true,
        policySigned: true,
        termsSigned: true,
        createdAt: new Date('2024-01-20')
      },
      {
        id: 'test-collector-001',
        name: 'Marcus Rodriguez',
        email: 'm.rodriguez@test.com',
        password: 'TestPass789!',
        idVerified: false,
        disclaimerSigned: true,
        policySigned: true,
        termsSigned: true,
        createdAt: new Date('2024-01-25')
      },
      {
        id: 'test-dealer-001',
        name: 'Emma Thompson',
        email: 'e.thompson@test.com',
        password: 'TestPass012!',
        idVerified: false,
        disclaimerSigned: true,
        policySigned: true,
        termsSigned: true,
        createdAt: new Date('2024-01-30')
      }
    ];

    testUsers.forEach(user => {
      this.saveUser(user);
    });
  }

  /**
   * Get test credentials for development
   */
  getTestCredentials(): string {
    return `
Test Credentials for Development:

1. Seller Account:
   Email: alex.chen@test.com
   Password: TestPass123!
   Name: Alex Chen

2. Buyer Account:
   Email: sarah.m@test.com
   Password: TestPass456!
   Name: Sarah Mitchell

3. Collector Account:
   Email: m.rodriguez@test.com
   Password: TestPass789!
   Name: Marcus Rodriguez

4. Dealer Account:
   Email: e.thompson@test.com
   Password: TestPass012!
   Name: Emma Thompson

Note: These are test accounts for development purposes only.
    `;
  }

  // ===== MESSAGING METHODS =====

  /**
   * Save a message
   */
  saveMessage(message: Message): void {
    try {
      const messages = this.getAllMessages();
      messages.push(message);
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  /**
   * Get all messages
   */
  getAllMessages(): Message[] {
    try {
      const messagesData = localStorage.getItem(this.MESSAGES_KEY);
      if (messagesData) {
        const messages = JSON.parse(messagesData);
        const parsedMessages = messages.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        return parsedMessages;
      }
      return [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * Get messages by receiver
   */
  getMessagesByReceiver(receiverId: string): Message[] {
    return this.getAllMessages().filter(msg => msg.receiverId === receiverId);
  }

  /**
   * Get messages by sender
   */
  getMessagesBySender(senderId: string): Message[] {
    return this.getAllMessages().filter(msg => msg.senderId === senderId);
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string): void {
    try {
      const messages = this.getAllMessages();
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        message.isRead = true;
        localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  /**
   * Mark message as unread
   */
  markMessageAsUnread(messageId: string): void {
    try {
      const messages = this.getAllMessages();
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        message.isRead = false;
        localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error marking message as unread:', error);
    }
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): void {
    try {
      const messages = this.getAllMessages();
      const filteredMessages = messages.filter(msg => msg.id !== messageId);
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(filteredMessages));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  /**
   * Clear all messages (for testing)
   */
  clearMessages(): void {
    try {
      localStorage.removeItem(this.MESSAGES_KEY);
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  }

  /**
   * Clear all notifications (for testing)
   */
  clearNotifications(): void {
    try {
      localStorage.removeItem(this.NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // ===== NOTIFICATION METHODS =====

  /**
   * Save a notification
   */
  saveNotification(notification: Notification): void {
    try {
      const notifications = this.getAllNotifications();
      notifications.push(notification);
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): Notification[] {
    try {
      const notificationsData = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (notificationsData) {
        const notifications = JSON.parse(notificationsData);
        return notifications.map((notif: Notification) => ({
          ...notif,
          timestamp: new Date(notif.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Get notifications by user
   */
  getNotificationsByUser(userId: string): Notification[] {
    return this.getAllNotifications().filter(notif => notif.userId === userId);
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    try {
      const notifications = this.getAllNotifications();
      const notification = notifications.find(notif => notif.id === notificationId);
      if (notification) {
        notification.isRead = true;
        localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): void {
    try {
      const notifications = this.getAllNotifications();
      const filteredNotifications = notifications.filter(notif => notif.id !== notificationId);
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  /**
   * Create a notification for a bid
   */
  createBidNotification(listingId: string, bid: Bid, sellerId: string): void {
    const listing = this.getListingById(listingId);
    if (!listing) return;

    const notification: Notification = {
      id: this.generateId(),
      userId: sellerId,
      title: 'New Bid Received',
      message: `${bid.bidderName} placed a bid of $${bid.amount.toLocaleString()} on your ${listing.title}`,
      type: 'bid',
      isRead: false,
      timestamp: new Date(),
      relatedListingId: listingId,
      relatedBidId: bid.id
    };

    this.saveNotification(notification);
  }

  /**
   * Create a notification for a counteroffer
   */
  createCounterofferNotification(listingId: string, counteroffer: Counteroffer, buyerId: string): void {
    const listing = this.getListingById(listingId);
    if (!listing) return;

    const notification: Notification = {
      id: this.generateId(),
      userId: buyerId,
      title: 'Counteroffer Received',
      message: `Seller made a counteroffer of $${counteroffer.amount.toLocaleString()} on ${listing.title}`,
      type: 'counteroffer',
      isRead: false,
      timestamp: new Date(),
      relatedListingId: listingId
    };

    this.saveNotification(notification);
  }
}