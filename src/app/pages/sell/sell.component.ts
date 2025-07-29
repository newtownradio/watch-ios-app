import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Listing, Bid, Counteroffer } from '../../models/bid.interface';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.scss'
})
export class SellComponent {
  form = {
    title: '',
    startingPrice: 0,
    description: ''
  };

  activeListings: Listing[] = [];
  showCounterofferForm = false;
  selectedBidForCounteroffer: Bid | null = null;
  counterofferForm = {
    amount: 0,
    message: ''
  };

  constructor() {
    // Initialize with sample data
    this.loadActiveListings();
  }

  submitForm() {
    if (this.form.title && this.form.startingPrice > 0) {
      const newListing: Listing = {
        id: Date.now().toString(),
        sellerId: 'seller1',
        sellerName: 'John Seller',
        title: this.form.title,
        description: this.form.description,
        startingPrice: this.form.startingPrice,
        currentPrice: this.form.startingPrice,
        imageUrl: 'placeholder.jpg',
        createdAt: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        status: 'active',
        bids: [],
        counteroffers: [],
        hasMadeCounteroffer: false
      };

      this.activeListings.unshift(newListing);
      this.form = { title: '', startingPrice: 0, description: '' };
      alert('Item listed successfully! Bidding window is 48 hours.');
    } else {
      alert('Please fill in all required fields');
    }
  }

  loadActiveListings() {
    // Sample data
    this.activeListings = [
      {
        id: '1',
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

    // Set highest bid
    this.activeListings.forEach(listing => {
      if (listing.bids.length > 0) {
        listing.highestBid = listing.bids.reduce((highest, current) => 
          current.amount > highest.amount ? current : highest
        );
      }
    });
  }

  getTimeRemaining(endTime: Date): string {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
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