import { Injectable } from '@angular/core';
import { CosmosClient, Database, Container } from '@azure/cosmos';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Listing, User, Order } from '../models/bid.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AzureDataService {
  private cosmosClient: CosmosClient | null = null;
  private database: Database | null = null;
  private blobServiceClient: BlobServiceClient | null = null;
  
  // Container references
  private listingsContainer: Container | null = null;
  private usersContainer: Container | null = null;
  private ordersContainer: Container | null = null;
  private bidsContainer: Container | null = null;
  private messagesContainer: Container | null = null;
  private imagesContainer: ContainerClient | null = null;

  private isInitialized = false;

  constructor() {
    // Initialize Azure services in background, don't block constructor
    this.initializeAzureServices().catch(error => {
      console.error('❌ Azure initialization failed:', error);
      this.isInitialized = false;
    });
  }

  private async initializeAzureServices(): Promise<void> {
    try {
      console.log('🚀 Initializing Azure services...');
      
      // Check if Azure config exists
      if (!environment.azure?.cosmosDb?.endpoint || !environment.azure?.cosmosDb?.key) {
        console.log('⚠️ Azure configuration not found, using localStorage fallback');
        this.isInitialized = false;
        return;
      }

      // Initialize Cosmos DB
      const endpoint = environment.azure.cosmosDb.endpoint;
      const key = environment.azure.cosmosDb.key;
      
      this.cosmosClient = new CosmosClient({ endpoint, key });
      this.database = this.cosmosClient.database(environment.azure.cosmosDb.databaseId);
      
      // Initialize containers
      this.listingsContainer = this.database.container('listings');
      this.usersContainer = this.database.container('users');
      this.ordersContainer = this.database.container('orders');
      this.bidsContainer = this.database.container('bids');
      this.messagesContainer = this.database.container('messages');

      // Initialize Blob Storage
      const connectionString = environment.azure.blobStorage.connectionString;
      if (connectionString) {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        this.imagesContainer = this.blobServiceClient.getContainerClient('watch-images');
      }

      this.isInitialized = true;
      console.log('✅ Azure services initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Azure services:', error);
      this.isInitialized = false;
      // Don't throw error, just log it
    }
  }

  private fallbackToLocalStorage(): Listing[] {
    console.log('🔄 Using localStorage fallback for listings');
    return [];
  }

  private fallbackToLocalStorageUsers(): User[] {
    console.log('🔄 Using localStorage fallback for users');
    return [];
  }

  private fallbackToLocalStorageOrders(): Order[] {
    console.log('🔄 Using localStorage fallback for orders');
    return [];
  }

  private fallbackToLocalStorageUser(): User | null {
    console.log('🔄 Using localStorage fallback for user');
    return null;
  }

  // ===== LISTINGS =====
  async saveListing(listing: Listing): Promise<void> {
    try {
      if (this.isInitialized && this.listingsContainer) {
        await this.listingsContainer.items.upsert(listing);
        console.log('✅ Listing saved to Azure:', listing.title);
      } else {
        console.log('🔄 Azure not available, using localStorage fallback');
        // No return needed for void method
      }
    } catch (error) {
      console.error('❌ Error saving listing to Azure:', error);
      // No return needed for void method
    }
  }

  async getActiveListings(): Promise<Listing[]> {
    try {
      if (this.isInitialized && this.listingsContainer) {
        const query = 'SELECT * FROM c WHERE c.status = "active"';
        const { resources } = await this.listingsContainer.items.query(query).fetchAll();
        
        // Convert dates back to Date objects
        const listings = resources.map(listing => ({
          ...listing,
          createdAt: new Date(listing.createdAt),
          endTime: new Date(listing.endTime)
        }));
        
        console.log('✅ Retrieved active listings from Azure:', listings.length);
        return listings;
      } else {
        console.log('🔄 Azure not available, using localStorage fallback');
        return this.fallbackToLocalStorage();
      }
    } catch (error) {
      console.error('❌ Error getting listings from Azure:', error);
      return this.fallbackToLocalStorage();
    }
  }

  async getAllListings(): Promise<Listing[]> {
    try {
      if (this.isInitialized && this.listingsContainer) {
        const query = 'SELECT * FROM c';
        const { resources } = await this.listingsContainer.items.query(query).fetchAll();
        
        // Convert dates back to Date objects
        const listings = resources.map(listing => ({
          ...listing,
          createdAt: new Date(listing.createdAt),
          endTime: new Date(listing.endTime)
        }));
        
        return listings;
      } else {
        return this.fallbackToLocalStorage();
      }
    } catch (error) {
      console.error('❌ Error getting all listings from Azure:', error);
      return this.fallbackToLocalStorage();
    }
  }

  // ===== USERS =====
  async saveUser(user: User): Promise<void> {
    try {
      if (this.isInitialized && this.usersContainer) {
        await this.usersContainer.items.upsert(user);
        console.log('✅ User saved to Azure:', user.email);
      } else {
        this.fallbackToLocalStorageUsers();
      }
    } catch (error) {
      console.error('❌ Error saving user to Azure:', error);
      this.fallbackToLocalStorageUsers();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.isInitialized && this.usersContainer) {
        // This would need to be implemented based on your auth system
        // For now, return null and fallback to localStorage
        return null;
      } else {
        return this.fallbackToLocalStorageUser();
      }
    } catch (error) {
      console.error('❌ Error getting current user from Azure:', error);
      return this.fallbackToLocalStorageUser();
    }
  }

  // ===== ORDERS =====
  async saveOrder(order: Order): Promise<void> {
    try {
      if (this.isInitialized && this.ordersContainer) {
        await this.ordersContainer.items.upsert(order);
        console.log('✅ Order saved to Azure:', order.id);
      } else {
        this.fallbackToLocalStorageOrders();
      }
    } catch (error) {
      console.error('❌ Error saving order to Azure:', error);
      this.fallbackToLocalStorageOrders();
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      if (this.isInitialized && this.ordersContainer) {
        const query = 'SELECT * FROM c';
        const { resources } = await this.ordersContainer.items.query(query).fetchAll();
        
        // Convert dates back to Date objects
        const orders = resources.map(order => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }));
        
        return orders;
      } else {
        return this.fallbackToLocalStorageOrders();
      }
    } catch (error) {
      console.error('❌ Error getting orders from Azure:', error);
      return this.fallbackToLocalStorageOrders();
    }
  }

  // ===== IMAGE UPLOAD =====
  async uploadImage(file: File, listingId: string): Promise<string> {
    try {
      if (this.isInitialized && this.imagesContainer) {
        const blobName = `${listingId}/${Date.now()}-${file.name}`;
        const blockBlobClient = this.imagesContainer.getBlockBlobClient(blobName);
        
        await blockBlobClient.uploadData(await file.arrayBuffer(), {
          blobHTTPHeaders: { blobContentType: file.type }
        });
        
        const imageUrl = blockBlobClient.url;
        console.log('✅ Image uploaded to Azure:', imageUrl);
        return imageUrl;
      } else {
        throw new Error('Blob storage not available');
      }
    } catch (error) {
      console.error('❌ Error uploading image to Azure:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====
  generateId(): string {
    return 'azure-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  isAuthenticated(): boolean {
    // This would need to be implemented based on your auth system
    // For now, return false to trigger fallback
    return false;
  }

  // Check if Azure is available
  isAzureAvailable(): boolean {
    return this.isInitialized;
  }
}
