import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Listing } from '../../models/bid.interface';
import { DataPersistenceService } from '../../services/data-persistence.service';

@Component({
  selector: 'app-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discovery.component.html',
  styleUrl: './discovery.component.scss'
})
export class DiscoveryComponent implements OnInit {
  searchTerm = '';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  showFavoritesOnly = false;
  
  // Demo user ID - in production this would come from auth service
  private currentUserId = 'demo-user-123';
  
  listings: Listing[] = [];
  favorites: string[] = [];

  constructor(private dataService: DataPersistenceService) {}

  ngOnInit() {
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
    console.log('Search performed:', this.searchTerm);
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
    const shareText = `⌚ ${listing.title} - $${listing.currentPrice.toLocaleString()}\n\n` +
      `📅 Sale ends: ${this.getListingEndTime(listing.endTime)}\n` +
      `⏰ Time remaining: ${this.getTimeRemaining(listing.endTime)}\n\n` +
      `Check out this watch on Watch iOS!`;

    // Try to use Web Share API first (mobile devices)
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: shareText,
        url: window.location.href
      }).catch((error) => {
        console.log('Error sharing:', error);
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
        alert('Listing details copied to clipboard! 📋');
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
        startingPrice: 8500,
        currentPrice: 8500,
        imageUrl: '',
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
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
        startingPrice: 4200,
        currentPrice: 4200,
        imageUrl: '',
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
        startingPrice: 6800,
        currentPrice: 6800,
        imageUrl: '',
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
        startingPrice: 3200,
        currentPrice: 3200,
        imageUrl: '',
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
        startingPrice: 450,
        currentPrice: 450,
        imageUrl: '',
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
        startingPrice: 2800,
        currentPrice: 2800,
        imageUrl: '',
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
