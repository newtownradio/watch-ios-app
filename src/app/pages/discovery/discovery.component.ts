import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Listing } from '../../models/bid.interface';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { BidService, BidResponse } from '../../services/bid.service';
import { BidFormComponent } from '../../components/bid-form/bid-form.component';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, BidFormComponent],
  templateUrl: './discovery.component.html',
  styleUrl: './discovery.component.scss'
})
export class DiscoveryComponent implements OnInit {
  searchTerm = '';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  showFavoritesOnly = false;
  selectedBrand = '';
  selectedCondition = '';
  sortBy = 'newest';
  
  // Get current user ID from authentication
  get currentUserId(): string {
    const currentUser = this.dataService.getCurrentUser();
    return currentUser?.id || '';
  }
  
  listings: Listing[] = [];
  favorites: string[] = [];
  
  // Bid form state
  showBidForm = false;
  showBuyNowForm = false;
  selectedListing: Listing | null = null;

  private dataService = inject(DataPersistenceService);
  private router = inject(Router);
  private bidService = inject(BidService);

  ngOnInit() {
    // Check if user is authenticated
    console.log('Discovery: Checking authentication...');
    console.log('Is authenticated:', this.dataService.isAuthenticated());
    console.log('Current user:', this.dataService.getCurrentUser());
    
    if (!this.dataService.isAuthenticated()) {
      console.log('Discovery: User not authenticated, redirecting to auth');
      this.router.navigate(['/auth']);
      return;
    }
    
    console.log('Discovery: User authenticated, loading data');
    
    // Clear any existing demo data to force fresh load
    this.clearDemoData();
    
    this.loadListings();
    this.loadFavorites();
  }



  get filteredListings(): Listing[] {
    const now = new Date();
    
    let filtered = this.listings.filter(listing => {
      // Filter out scheduled listings that haven't gone live yet
      if (listing.status === 'scheduled' && listing.createdAt > now) {
        return false;
      }
      
      // Search term matching (enhanced)
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.sellerName.toLowerCase().includes(searchLower) ||
        (listing.brand && listing.brand.toLowerCase().includes(searchLower)) ||
        (listing.model && listing.model.toLowerCase().includes(searchLower)) ||
        (listing.description && listing.description.toLowerCase().includes(searchLower)) ||
        listing.condition?.toLowerCase().includes(searchLower);
      
      // Price range matching
      const matchesPrice = (!this.minPrice || listing.currentPrice >= this.minPrice) &&
                          (!this.maxPrice || listing.currentPrice <= this.maxPrice);
      
      // Brand filter
      const matchesBrand = !this.selectedBrand || 
        (listing.brand && listing.brand.toLowerCase() === this.selectedBrand.toLowerCase());
      
      // Condition filter
      const matchesCondition = !this.selectedCondition || 
        (listing.condition && listing.condition.toLowerCase() === this.selectedCondition.toLowerCase());
      
      // Favorites filter
      const matchesFavorites = !this.showFavoritesOnly || this.isFavorited(listing.id);
      
      return matchesSearch && matchesPrice && matchesBrand && matchesCondition && matchesFavorites;
    });
    
    // Sort results
    filtered = this.sortListings(filtered);
    
    return filtered;
  }

  getFavoriteListings(): Listing[] {
    const now = new Date();
    
    return this.listings.filter(listing => {
      // Filter out scheduled listings that haven't gone live yet
      if (listing.status === 'scheduled' && listing.createdAt > now) {
        return false;
      }
      
      // Only return active listings that are favorited
      return listing.status === 'active' && this.isFavorited(listing.id);
    });
  }


  performSearch() {
    // Trigger search - the filteredListings getter will automatically update
  }

  toggleFavorite(listingId: string) {
    if (this.isFavorited(listingId)) {
      this.dataService.removeFromFavorites(this.currentUserId, listingId);
    } else {
      this.dataService.addToFavorites(this.currentUserId, listingId);
    }
    this.loadFavorites();
  }

  isFavorited(listingId: string): boolean {
    return this.dataService.isFavorited(this.currentUserId, listingId);
  }

  deleteListing(listingId: string) {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.dataService.deleteListing(listingId);
      this.loadListings();
      alert('Listing deleted successfully!');
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.showFavoritesOnly = false;
    this.selectedBrand = '';
    this.selectedCondition = '';
    this.sortBy = 'newest';
  }

  private sortListings(listings: Listing[]): Listing[] {
    switch (this.sortBy) {
      case 'newest':
        return listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return listings.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'price-low':
        return listings.sort((a, b) => a.currentPrice - b.currentPrice);
      case 'price-high':
        return listings.sort((a, b) => b.currentPrice - a.currentPrice);
      case 'ending-soon':
        return listings.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
      case 'most-bids':
        return listings.sort((a, b) => b.bids.length - a.bids.length);
      default:
        return listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  getAvailableBrands(): string[] {
    const brands = new Set<string>();
    this.listings.forEach(listing => {
      if (listing.brand) {
        brands.add(listing.brand);
      }
    });
    return Array.from(brands).sort();
  }

  getAvailableConditions(): string[] {
    const conditions = new Set<string>();
    this.listings.forEach(listing => {
      if (listing.condition) {
        conditions.add(listing.condition);
      }
    });
    return Array.from(conditions).sort();
  }

  // Bid functionality
  openBidForm(listing: Listing) {
    console.log('Opening bid form for listing:', listing);
    this.selectedListing = listing;
    this.showBidForm = true;
    console.log('showBidForm set to:', this.showBidForm);
    
    // Force a DOM update and check visibility
    setTimeout(() => {
      const bidFormSection = document.querySelector('.bid-form-section');
      console.log('Bid form section element:', bidFormSection);
      if (bidFormSection) {
        console.log('Bid form display style:', window.getComputedStyle(bidFormSection).display);
        console.log('Bid form visibility:', window.getComputedStyle(bidFormSection).visibility);
        console.log('Bid form opacity:', window.getComputedStyle(bidFormSection).opacity);
      } else {
        console.log('Bid form section not found in DOM');
      }
    }, 100);
  }

  openBuyNowForm(listing: Listing) {
    console.log('Opening buy now form for listing:', listing);
    this.selectedListing = listing;
    this.showBuyNowForm = true;
    this.showBidForm = false; // Close bid form if open
  }

  closeBuyNowForm() {
    console.log('Closing buy now form');
    this.showBuyNowForm = false;
    this.selectedListing = null;
  }

  async handleBuyNow(listing: Listing) {
    try {
      console.log('Processing buy now for listing:', listing);
      
      // Create an immediate order
      const currentUser = this.dataService.getCurrentUser();
      if (!currentUser) {
        alert('You must be logged in to make a purchase');
        return;
      }

      // Create the order with 'pending_payment' status
      const order = {
        id: this.generateId(),
        listingId: listing.id,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        watchTitle: listing.title,
        finalPrice: listing.buyNowPrice || listing.currentPrice,
        status: 'pending_payment',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the order
      this.dataService.saveOrder(order);
      
      // Update listing status to sold
      listing.status = 'sold';
      listing.currentPrice = listing.buyNowPrice || listing.currentPrice;
      this.dataService.updateListing(listing);

      // Show success message and redirect to orders
      alert(`✅ Purchase successful!\n\n💰 Amount: $${(listing.buyNowPrice || listing.currentPrice).toLocaleString()}\n\nRedirecting to Orders page...`);
      
      // Close the form
      this.closeBuyNowForm();
      
      // Redirect to orders page
      setTimeout(() => {
        this.router.navigate(['/orders']);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing buy now:', error);
      alert('Failed to process purchase. Please try again.');
    }
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  closeBidForm() {
    console.log('Closing bid form');
    this.showBidForm = false;
    this.selectedListing = null;
    console.log('showBidForm set to:', this.showBidForm);
  }

  onBidPlaced(response: BidResponse) {
    console.log('Bid placed successfully:', response);
    this.closeBidForm();
    
    // Show success message and redirect to orders page
    if (response.success) {
      // Show a brief success message with bid details
      const bidAmount = response.bid?.amount || 0;
      const message = `✅ ${response.message}\n\n💰 Bid Amount: $${bidAmount.toLocaleString()}\n\nRedirecting to Orders page to track your bid...`;
      alert(message);
      
      // Redirect to orders page after a short delay
      setTimeout(() => {
        this.router.navigate(['/orders']);
      }, 2000);
    }
  }

  getTimeRemaining(endTime: Date): string {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  getListingStartTime(createdAt: Date): string {
    return createdAt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getListingEndTime(endTime: Date): string {
    return endTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async shareListing(listing: Listing) {
    const shareText = `${listing.title} - $${listing.currentPrice.toLocaleString()}\n\n` +
      `Sale ends: ${this.getListingEndTime(listing.endTime)}\n` +
      `Time remaining: ${this.getTimeRemaining(listing.endTime)}\n\n` +
      `Check out this watch on Watch Style iOS!`;

    try {
      // Use Capacitor Share plugin for native iOS sharing
      await Share.share({
        title: listing.title,
        text: shareText,
        url: window.location.href,
        dialogTitle: 'Share Watch Listing'
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: listing.title,
            text: shareText,
            url: window.location.href
          });
        } catch (webShareError) {
          console.error('Web Share API error:', webShareError);
          this.fallbackShare(shareText);
        }
      } else {
        // Final fallback to clipboard copy
        this.fallbackShare(shareText);
      }
    }
  }

  private fallbackShare(shareText: string) {
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Listing details copied to clipboard!');
      }).catch(() => {
        // Final fallback - show in alert
        alert(`Share this listing:\n\n${shareText}`);
      });
    } else {
      // Final fallback - show in alert
      alert(`Share this listing:\n\n${shareText}`);
    }
  }

  private loadListings() {
    // Get active listings from data service
    this.listings = this.dataService.getActiveListings();
    
    console.log('Discovery: Loaded listings:', this.listings);
    console.log('Discovery: Listings with Instant Purchase:', this.listings.filter(l => l.buyNowPrice));
    
    // If no listings exist, create some demo data
    if (this.listings.length === 0) {
      console.log('Discovery: No listings found, creating demo data...');
      this.createDemoListings();
      // After creating demo listings, reload them
      this.listings = this.dataService.getActiveListings();
      console.log('Discovery: After demo creation, listings:', this.listings);
    }
  }

  private loadFavorites() {
    this.favorites = this.dataService.getUserFavorites(this.currentUserId);
  }

  private clearDemoData() {
    // Clear any existing demo listings to force fresh data
    const existingListings = this.dataService.getAllListings();
    const demoListings = existingListings.filter(l => 
      l.sellerId.startsWith('seller-') || 
      l.sellerName.includes('LuxuryWatches') ||
      l.sellerName.includes('TimepieceCollector')
    );
    
    demoListings.forEach(listing => {
      this.dataService.deleteListing(listing.id);
    });
    
    console.log('Discovery: Cleared', demoListings.length, 'demo listings');
  }

  private createDemoListings() {
    const demoListings: Listing[] = [
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-1',
        sellerName: 'LuxuryWatches',
        title: 'Rolex Submariner',
        description: 'Classic dive watch with excellent condition',
        brand: 'Rolex',
        model: 'Submariner',
        condition: 'Excellent',
        price: 8500,
        startingPrice: 8500,
        currentPrice: 8500,
        buyNowPrice: 11000, // 29% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-2',
        sellerName: 'TimepieceCollector',
        title: 'Omega Speedmaster',
        description: 'Moonwatch with original bracelet',
        brand: 'Omega',
        model: 'Speedmaster',
        condition: 'Very Good',
        price: 4200,
        startingPrice: 4200,
        currentPrice: 4200,
        buyNowPrice: 5400, // 29% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-3',
        sellerName: 'VintageLuxury',
        title: 'Cartier Santos',
        description: 'Elegant square case with leather strap',
        brand: 'Cartier',
        model: 'Santos',
        condition: 'Excellent',
        price: 6800,
        startingPrice: 6800,
        currentPrice: 6800,
        buyNowPrice: 8700, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-4',
        sellerName: 'SwissTime',
        title: 'Tudor Black Bay',
        description: 'Heritage diver with in-house movement',
        brand: 'Tudor',
        model: 'Black Bay',
        condition: 'Good',
        price: 3200,
        startingPrice: 3200,
        currentPrice: 3200,
        buyNowPrice: 4100, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-5',
        sellerName: 'JapaneseWatches',
        title: 'Seiko Prospex',
        description: 'Professional diver with excellent lume',
        brand: 'Seiko',
        model: 'Prospex',
        condition: 'Very Good',
        price: 450,
        startingPrice: 450,
        currentPrice: 450,
        buyNowPrice: 580, // 29% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-6',
        sellerName: 'SportWatches',
        title: 'Tag Heuer Carrera',
        description: 'Chronograph with racing heritage',
        brand: 'Tag Heuer',
        model: 'Carrera',
        condition: 'Good',
        price: 2800,
        startingPrice: 2800,
        currentPrice: 2800,
        buyNowPrice: 3600, // 29% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-7',
        sellerName: 'LuxuryTimepieces',
        title: 'Breitling Navitimer',
        description: 'Pilot chronograph with slide rule',
        brand: 'Breitling',
        model: 'Navitimer',
        condition: 'Excellent',
        price: 5200,
        startingPrice: 5200,
        currentPrice: 5200,
        buyNowPrice: 6700, // 29% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-8',
        sellerName: 'VintageCollector',
        title: 'Longines Heritage',
        description: 'Classic design with modern movement',
        brand: 'Longines',
        model: 'Heritage',
        condition: 'Fair',
        price: 1800,
        startingPrice: 1800,
        currentPrice: 1800,
        buyNowPrice: 2300, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-9',
        sellerName: 'SwissLuxury',
        title: 'IWC Portugieser',
        description: 'Elegant dress watch with complications',
        brand: 'IWC',
        model: 'Portugieser',
        condition: 'Excellent',
        price: 8900,
        startingPrice: 8900,
        currentPrice: 8900,
        buyNowPrice: 11400, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-10',
        sellerName: 'ModernWatches',
        title: 'Panerai Luminor',
        description: 'Italian design with Swiss precision',
        brand: 'Panerai',
        model: 'Luminor',
        condition: 'Very Good',
        price: 6500,
        startingPrice: 6500,
        currentPrice: 6500,
        buyNowPrice: 8300, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-11',
        sellerName: 'LuxuryHorology',
        title: 'Patek Philippe Calatrava',
        description: 'Ultra-thin dress watch with white gold case',
        brand: 'Patek Philippe',
        model: 'Calatrava',
        condition: 'Excellent',
        price: 28500,
        startingPrice: 28500,
        currentPrice: 28500,
        buyNowPrice: 36500, // 28% premium for immediate purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-12',
        sellerName: 'VintageSwiss',
        title: 'Audemars Piguet Royal Oak',
        description: 'Iconic octagonal bezel with integrated bracelet',
        brand: 'Audemars Piguet',
        model: 'Royal Oak',
        condition: 'Excellent',
        price: 18500,
        startingPrice: 18500,
        currentPrice: 18500,
        buyNowPrice: 23700, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-13',
        sellerName: 'GermanPrecision',
        title: 'A. Lange & Söhne Lange 1',
        description: 'German craftsmanship with outsize date',
        brand: 'A. Lange & Söhne',
        model: 'Lange 1',
        condition: 'Very Good',
        price: 22500,
        startingPrice: 22500,
        currentPrice: 22500,
        buyNowPrice: 28800, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 65 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-14',
        sellerName: 'SportLuxury',
        title: 'Hublot Big Bang',
        description: 'Modern chronograph with ceramic case',
        brand: 'Hublot',
        model: 'Big Bang',
        condition: 'Good',
        price: 8500,
        startingPrice: 8500,
        currentPrice: 8500,
        buyNowPrice: 10900, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 55 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-15',
        sellerName: 'JapaneseHeritage',
        title: 'Grand Seiko Snowflake',
        description: 'Spring Drive movement with textured dial',
        brand: 'Grand Seiko',
        model: 'Snowflake',
        condition: 'Excellent',
        price: 5800,
        startingPrice: 5800,
        currentPrice: 5800,
        buyNowPrice: 7400, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 70 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-16',
        sellerName: 'SwissHeritage',
        title: 'Jaeger-LeCoultre Reverso',
        description: 'Art Deco reversible case design',
        brand: 'Jaeger-LeCoultre',
        model: 'Reverso',
        condition: 'Very Good',
        price: 7200,
        startingPrice: 7200,
        currentPrice: 7200,
        buyNowPrice: 9200, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 58 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-17',
        sellerName: 'ModernLuxury',
        title: 'Richard Mille RM 011',
        description: 'Ultra-lightweight racing chronograph',
        brand: 'Richard Mille',
        model: 'RM 011',
        condition: 'Excellent',
        price: 125000,
        startingPrice: 125000,
        currentPrice: 125000,
        buyNowPrice: 160000, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 90 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-18',
        sellerName: 'VintageLuxury',
        title: 'Vacheron Constantin Patrimony',
        description: 'Classic round case with manual wind movement',
        brand: 'Vacheron Constantin',
        model: 'Patrimony',
        condition: 'Excellent',
        price: 18500,
        startingPrice: 18500,
        currentPrice: 18500,
        buyNowPrice: 23700, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 75 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-19',
        sellerName: 'ContemporarySwiss',
        title: 'Breguet Classique',
        description: 'Guilloché dial with Breguet hands',
        brand: 'Breguet',
        model: 'Classique',
        condition: 'Very Good',
        price: 15800,
        startingPrice: 15800,
        currentPrice: 15800,
        buyNowPrice: 20200, // 28% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 68 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-20',
        sellerName: 'HeritageWatches',
        title: 'Zenith El Primero',
        description: 'High-frequency chronograph movement',
        brand: 'Zenith',
        model: 'El Primero',
        condition: 'Good',
        price: 4200,
        startingPrice: 4200,
        currentPrice: 4200,
        buyNowPrice: 5400, // 29% premium for Instant Purchase
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 62 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        counterofferCount: 0
      }
    ];

    // Save demo listings
    demoListings.forEach(listing => {
      this.dataService.saveListing(listing);
    });

    // Reload listings
    this.loadListings();
  }
}
