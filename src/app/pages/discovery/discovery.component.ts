import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Listing } from '../../models/bid.interface';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { BidService, BidResponse } from '../../services/bid.service';
import { BidFormComponent } from '../../components/bid-form/bid-form.component';

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
  
  // Get current user ID from authentication
  get currentUserId(): string {
    const currentUser = this.dataService.getCurrentUser();
    return currentUser?.id || '';
  }
  
  listings: Listing[] = [];
  favorites: string[] = [];
  
  // Bid form state
  showBidForm = false;
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
    this.loadListings();
    this.loadFavorites();
  }

  get filteredListings(): Listing[] {
    const now = new Date();
    
    return this.listings.filter(listing => {
      // Filter out scheduled listings that haven't gone live yet
      if (listing.status === 'scheduled' && listing.createdAt > now) {
        return false;
      }
      
      const matchesSearch = !this.searchTerm || 
        listing.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        listing.sellerName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesPrice = (!this.minPrice || listing.currentPrice >= this.minPrice) &&
                          (!this.maxPrice || listing.currentPrice <= this.maxPrice);
      
      const matchesFavorites = !this.showFavoritesOnly || this.isFavorited(listing.id);
      
      return matchesSearch && matchesPrice && matchesFavorites;
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
  }

  // Bid functionality
  openBidForm(listing: Listing) {
    this.selectedListing = listing;
    this.showBidForm = true;
  }

  closeBidForm() {
    this.showBidForm = false;
    this.selectedListing = null;
  }

  onBidPlaced(response: BidResponse) {
    console.log('Bid placed successfully:', response);
    this.closeBidForm();
    // Optionally refresh listings or show success message
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

  shareListing(listing: Listing) {
    const shareText = `${listing.title} - $${listing.currentPrice.toLocaleString()}\n\n` +
      `Sale ends: ${this.getListingEndTime(listing.endTime)}\n` +
      `Time remaining: ${this.getTimeRemaining(listing.endTime)}\n\n` +
      `Check out this watch on Watch Style iOS!`;

    // Try to use Web Share API first (mobile devices)
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: shareText,
        url: window.location.href
      }).catch((error) => {
        console.error('Error sharing:', error);
        this.fallbackShare(shareText);
      });
    } else {
      // Fallback to clipboard copy
      this.fallbackShare(shareText);
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
    
    // If no listings exist, create some demo data
    if (this.listings.length === 0) {
      this.createDemoListings();
    }
  }

  private loadFavorites() {
    this.favorites = this.dataService.getUserFavorites(this.currentUserId);
  }

  private createDemoListings() {
    const demoListings: Listing[] = [
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-1',
        sellerName: 'LuxuryWatches',
        title: 'Rolex Submariner',
        description: 'Classic dive watch with excellent condition',
        price: 8500,
        startingPrice: 8500,
        currentPrice: 8500,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-2',
        sellerName: 'TimepieceCollector',
        title: 'Omega Speedmaster',
        description: 'Moonwatch with original bracelet',
        price: 4200,
        startingPrice: 4200,
        currentPrice: 4200,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-3',
        sellerName: 'VintageLuxury',
        title: 'Cartier Santos',
        description: 'Elegant square case with leather strap',
        price: 6800,
        startingPrice: 6800,
        currentPrice: 6800,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-4',
        sellerName: 'SwissTime',
        title: 'Tudor Black Bay',
        description: 'Heritage diver with in-house movement',
        price: 3200,
        startingPrice: 3200,
        currentPrice: 3200,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-5',
        sellerName: 'JapaneseWatches',
        title: 'Seiko Prospex',
        description: 'Professional diver with excellent lume',
        price: 450,
        startingPrice: 450,
        currentPrice: 450,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-6',
        sellerName: 'SportWatches',
        title: 'Tag Heuer Carrera',
        description: 'Chronograph with racing heritage',
        price: 2800,
        startingPrice: 2800,
        currentPrice: 2800,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-7',
        sellerName: 'LuxuryTimepieces',
        title: 'Breitling Navitimer',
        description: 'Pilot chronograph with slide rule',
        price: 5200,
        startingPrice: 5200,
        currentPrice: 5200,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-8',
        sellerName: 'VintageCollector',
        title: 'Longines Heritage',
        description: 'Classic design with modern movement',
        price: 1800,
        startingPrice: 1800,
        currentPrice: 1800,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-9',
        sellerName: 'SwissLuxury',
        title: 'IWC Portugieser',
        description: 'Elegant dress watch with complications',
        price: 8900,
        startingPrice: 8900,
        currentPrice: 8900,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      },
      {
        id: this.dataService.generateId(),
        sellerId: 'seller-10',
        sellerName: 'ModernWatches',
        title: 'Panerai Luminor',
        description: 'Italian design with Swiss precision',
        price: 6500,
        startingPrice: 6500,
        currentPrice: 6500,
        imageUrl: '',
        images: [],
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
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
