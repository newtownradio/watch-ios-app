import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Listing, Bid, Counteroffer } from '../../models/bid.interface';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { AiPricingService, PricingRecommendation } from '../../services/ai-pricing.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.scss'
})
export class SellComponent implements OnInit {
  form = {
    title: '',
    startingPrice: 0,
    description: '',
    brand: '',
    model: '',
    year: undefined as number | undefined,
    condition: 'excellent' as 'excellent' | 'very-good' | 'good' | 'fair',
    originalPrice: undefined as number | undefined
  };

  activeListings: Listing[] = [];
  showCounterofferForm = false;
  selectedBidForCounteroffer: Bid | null = null;
  counterofferForm = {
    amount: 0,
    message: ''
  };

  // AI Pricing
  showPricingAssistant = false;
  pricingRecommendation: PricingRecommendation | null = null;
  availableBrands: string[] = [];
  availableModels: string[] = [];

  constructor(
    private dataService: DataPersistenceService,
    private aiPricingService: AiPricingService
  ) {}

  ngOnInit() {
    this.loadActiveListings();
    this.loadAvailableBrands();
  }

  loadAvailableBrands() {
    this.availableBrands = this.aiPricingService.getAvailableBrands();
  }

  onBrandChange() {
    if (this.form.brand) {
      this.availableModels = this.aiPricingService.getModelsForBrand(this.form.brand);
      this.form.model = '';
    } else {
      this.availableModels = [];
      this.form.model = '';
    }
  }

  getModelCount(): number {
    return this.availableModels.length;
  }

  getPricingRecommendation() {
    console.log('getPricingRecommendation called');
    console.log('Form brand:', this.form.brand);
    console.log('Form model:', this.form.model);
    
    if (!this.form.brand || !this.form.model) {
      alert('Please select a brand and model for pricing analysis');
      return;
    }

    try {
      console.log('Getting pricing recommendation for:', this.form.brand, this.form.model);
      
      this.pricingRecommendation = this.aiPricingService.getPricingRecommendation(
        this.form.brand,
        this.form.model,
        this.form.year,
        this.form.condition,
        this.form.originalPrice
      );

      console.log('Pricing recommendation:', this.pricingRecommendation);

      // Auto-fill the suggested price
      this.form.startingPrice = this.pricingRecommendation.suggestedPrice;
      this.showPricingAssistant = true;
      
      console.log('Modal should be visible:', this.showPricingAssistant);
    } catch (error) {
      console.error('Error getting pricing recommendation:', error);
      alert('Error getting pricing recommendation. Please try again.');
    }
  }

  applyPricingRecommendation() {
    if (this.pricingRecommendation) {
      this.form.startingPrice = this.pricingRecommendation.suggestedPrice;
      this.showPricingAssistant = false;
    }
  }

  closePricingAssistant() {
    this.showPricingAssistant = false;
    this.pricingRecommendation = null;
  }

  submitForm() {
    console.log('Submit form called');
    console.log('Form data:', this.form);
    
    // Check if form has required data
    if (!this.form.title || this.form.title.trim() === '') {
      alert('Please enter a title for your item');
      return;
    }
    
    if (!this.form.startingPrice || this.form.startingPrice <= 0) {
      alert('Please enter a valid starting price greater than 0');
      return;
    }
    
    const startTime = new Date();
    const endTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
    
    const newListing: Listing = {
      id: this.dataService.generateId(),
      sellerId: 'seller1',
      sellerName: 'John Seller',
      title: this.form.title.trim(),
      description: this.form.description || '',
      brand: this.form.brand || undefined,
      model: this.form.model || undefined,
      year: this.form.year,
      condition: this.form.condition,
      startingPrice: this.form.startingPrice,
      currentPrice: this.form.startingPrice,
      imageUrl: 'placeholder.jpg',
      createdAt: startTime,
      endTime: endTime,
      status: 'active',
      bids: [],
      counteroffers: [],
      hasMadeCounteroffer: false
    };

    console.log('Creating new listing:', newListing);

    try {
      // Save to persistent storage
      this.dataService.saveListing(newListing);
      
      // Reload listings
      this.loadActiveListings();
      
      // Reset form
      this.form = { 
        title: '', 
        startingPrice: 0, 
        description: '',
        brand: '',
        model: '',
        year: undefined,
        condition: 'excellent',
        originalPrice: undefined
      };
      
      // Show success message with times
      const startTimeStr = this.getListingStartTime(startTime);
      const endTimeStr = this.getListingEndTime(endTime);
      alert(`Item listed successfully!\n\nStart: ${startTimeStr}\nEnd: ${endTimeStr}\n\nBidding window is 48 hours.`);
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Error saving listing. Please try again.');
    }
  }

  deleteListing(listingId: string) {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.dataService.deleteListing(listingId);
      this.loadActiveListings();
      alert('Listing deleted successfully!');
    }
  }

  loadActiveListings() {
    // Get listings from persistent storage
    this.activeListings = this.dataService.getListingsBySeller('seller1');
    
    // If no listings exist, create some demo data
    if (this.activeListings.length === 0) {
      this.createDemoListings();
    }

    // Set highest bid for each listing
    this.activeListings.forEach(listing => {
      if (listing.bids.length > 0) {
        listing.highestBid = listing.bids.reduce((highest, current) => 
          current.amount > highest.amount ? current : highest
        );
      }
    });
  }

  private createDemoListings() {
    const demoListings: Listing[] = [
      {
        id: this.dataService.generateId(),
        sellerId: 'seller1',
        sellerName: 'John Seller',
        title: 'Rolex Submariner',
        description: 'Classic dive watch in excellent condition',
        startingPrice: 8500,
        currentPrice: 9000,
        imageUrl: 'placeholder.jpg',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: 'active',
        bids: [
          {
            id: 'bid1',
            itemId: '1',
            bidderId: 'buyer1',
            bidderName: 'Mike Buyer',
            amount: 9000,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'pending'
          }
        ],
        counteroffers: [],
        hasMadeCounteroffer: false
      }
    ];

    // Save demo listings
    demoListings.forEach(listing => {
      this.dataService.saveListing(listing);
    });

    // Reload listings
    this.loadActiveListings();
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getListingEndTime(endTime: Date): string {
    return endTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getPendingBids(listing: Listing): Bid[] {
    return listing.bids.filter(bid => bid.status === 'pending');
  }

  hasPendingBids(listing: Listing): boolean {
    return this.getPendingBids(listing).length > 0;
  }

  acceptBid(listingId: string, bidId: string) {
    const listing = this.activeListings.find(l => l.id === listingId);
    if (listing) {
      const bid = listing.bids.find(b => b.id === bidId);
      if (bid) {
        bid.status = 'accepted';
        listing.status = 'sold';
        alert(`Bid accepted! Smart contract will be created. Shipping costs will be split.`);
      }
    }
  }

  declineBid(listingId: string, bidId: string) {
    const listing = this.activeListings.find(l => l.id === listingId);
    if (listing) {
      const bid = listing.bids.find(b => b.id === bidId);
      if (bid) {
        bid.status = 'declined';
        // Remove from highest bid if it was the highest
        if (listing.highestBid?.id === bidId) {
          const remainingBids = listing.bids.filter(b => b.status === 'pending');
          listing.highestBid = remainingBids.length > 0 ? 
            remainingBids.reduce((highest, current) => 
              current.amount > highest.amount ? current : highest
            ) : undefined;
        }
        alert('Bid declined.');
      }
    }
  }

  makeCounteroffer(listingId: string, bidId: string) {
    const listing = this.activeListings.find(l => l.id === listingId);
    if (listing && !listing.hasMadeCounteroffer) {
      const bid = listing.bids.find(b => b.id === bidId);
      if (bid) {
        this.selectedBidForCounteroffer = bid;
        this.counterofferForm.amount = bid.amount + 500; // Suggest 500 more
        this.showCounterofferForm = true;
      }
    } else if (listing?.hasMadeCounteroffer) {
      alert('You have already made a counteroffer for this listing.');
    }
  }

  submitCounteroffer() {
    if (this.selectedBidForCounteroffer && this.counterofferForm.amount > 0) {
      const listing = this.activeListings.find(l => 
        l.bids.some(b => b.id === this.selectedBidForCounteroffer?.id)
      );
      
      if (listing) {
        const counteroffer: Counteroffer = {
          id: Date.now().toString(),
          originalBidId: this.selectedBidForCounteroffer.id,
          sellerId: listing.sellerId,
          sellerName: listing.sellerName,
          amount: this.counterofferForm.amount,
          timestamp: new Date(),
          status: 'pending',
          message: this.counterofferForm.message
        };

        listing.counteroffers.push(counteroffer);
        listing.hasMadeCounteroffer = true;
        
        // Update the original bid status
        const originalBid = listing.bids.find(b => b.id === this.selectedBidForCounteroffer?.id);
        if (originalBid) {
          originalBid.status = 'counteroffered';
        }

        this.showCounterofferForm = false;
        this.selectedBidForCounteroffer = null;
        this.counterofferForm = { amount: 0, message: '' };
        
        alert(`Counteroffer sent for $${this.counterofferForm.amount.toLocaleString()}. Buyer has 48 hours to respond.`);
      }
    } else {
      alert('Please enter a valid counteroffer amount.');
    }
  }

  cancelCounteroffer() {
    this.showCounterofferForm = false;
    this.selectedBidForCounteroffer = null;
    this.counterofferForm = { amount: 0, message: '' };
  }

  getPendingCounteroffers(listing: Listing): Counteroffer[] {
    return listing.counteroffers.filter(co => co.status === 'pending');
  }
}