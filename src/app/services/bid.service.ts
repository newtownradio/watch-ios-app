import { Injectable, inject } from '@angular/core';
import { DataPersistenceService } from './data-persistence.service';
import { AuthenticationService } from './authentication.service';

export interface Bid {
  id: string;
  buyerId: string;
  listingId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  authenticationRequestId?: string;
}

export interface BidResponse {
  success: boolean;
  message: string;
  bid?: Bid;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private dataService = inject(DataPersistenceService);
  private authService = inject(AuthenticationService);

  constructor() {
    console.log('BidService initialized');
  }

  /**
   * Place a bid on a listing
   */
  async placeBid(buyerId: string, listingId: string, amount: number): Promise<BidResponse> {
    try {
      // Validate the listing exists and is active
      const listing = this.dataService.getListingById(listingId);
      if (!listing) {
        return {
          success: false,
          message: 'Listing not found',
          error: 'LISTING_NOT_FOUND'
        };
      }

      if (listing.status !== 'active') {
        return {
          success: false,
          message: 'Listing is not active',
          error: 'LISTING_INACTIVE'
        };
      }

      // Check if listing has expired
      if (new Date() > listing.endTime) {
        return {
          success: false,
          message: 'Listing has expired',
          error: 'LISTING_EXPIRED'
        };
      }

      // Validate bid amount
      if (amount <= 0) {
        return {
          success: false,
          message: 'Bid amount must be greater than zero',
          error: 'INVALID_AMOUNT'
        };
      }

      // Check if user is the seller
      if (listing.sellerId === buyerId) {
        return {
          success: false,
          message: 'You cannot bid on your own listing',
          error: 'SELF_BID'
        };
      }

      // Create the bid
      const bid: Bid = {
        id: this.generateId(),
        buyerId,
        listingId,
        amount,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Save the bid
      this.dataService.saveBid(bid);

      // Create notification for seller
      this.createBidNotification(bid, listing);

      return {
        success: true,
        message: 'Bid placed successfully',
        bid
      };

    } catch (error) {
      console.error('Error placing bid:', error);
      return {
        success: false,
        message: 'Failed to place bid',
        error: 'PLACE_BID_ERROR'
      };
    }
  }

  /**
   * Accept a bid (seller action)
   */
  async acceptBid(bidId: string, sellerId: string): Promise<BidResponse> {
    try {
      const bid = this.dataService.getBidById(bidId);
      if (!bid) {
        return {
          success: false,
          message: 'Bid not found',
          error: 'BID_NOT_FOUND'
        };
      }

      // Verify the seller owns the listing
      const listing = this.dataService.getListingById(bid.listingId);
      if (!listing || listing.sellerId !== sellerId) {
        return {
          success: false,
          message: 'You can only accept bids on your own listings',
          error: 'UNAUTHORIZED'
        };
      }

      // Check if bid is still pending
      if (bid.status !== 'pending') {
        return {
          success: false,
          message: 'Bid is no longer pending',
          error: 'BID_NOT_PENDING'
        };
      }

      // Check if bid has expired
      if (new Date() > bid.expiresAt) {
        return {
          success: false,
          message: 'Bid has expired',
          error: 'BID_EXPIRED'
        };
      }

      // Update bid status
      bid.status = 'accepted';
      bid.acceptedAt = new Date();
      this.dataService.updateBid(bid);

      // Update listing status to sold
      listing.status = 'sold';
      listing.currentPrice = bid.amount;
      this.dataService.updateListing(listing);

      // Create authentication request
      const authRequest = await this.authService.createAuthenticationRequest(
        bid.id,
        bid.buyerId,
        sellerId,
        bid.listingId,
        this.getRecommendedAuthPartner(listing)
      );

      // Link authentication request to bid
      bid.authenticationRequestId = authRequest.id;
      this.dataService.updateBid(bid);

      // Create notification for buyer
      this.createAcceptanceNotification(bid, listing);

      return {
        success: true,
        message: 'Bid accepted. Authentication process initiated.',
        bid
      };

    } catch (error) {
      console.error('Error accepting bid:', error);
      return {
        success: false,
        message: 'Failed to accept bid',
        error: 'ACCEPT_BID_ERROR'
      };
    }
  }

  /**
   * Reject a bid (seller action)
   */
  async rejectBid(bidId: string, sellerId: string): Promise<BidResponse> {
    try {
      const bid = this.dataService.getBidById(bidId);
      if (!bid) {
        return {
          success: false,
          message: 'Bid not found',
          error: 'BID_NOT_FOUND'
        };
      }

      // Verify the seller owns the listing
      const listing = this.dataService.getListingById(bid.listingId);
      if (!listing || listing.sellerId !== sellerId) {
        return {
          success: false,
          message: 'You can only reject bids on your own listings',
          error: 'UNAUTHORIZED'
        };
      }

      // Update bid status
      bid.status = 'rejected';
      bid.rejectedAt = new Date();
      this.dataService.updateBid(bid);

      // Create notification for buyer
      this.createRejectionNotification(bid, listing);

      return {
        success: true,
        message: 'Bid rejected',
        bid
      };

    } catch (error) {
      console.error('Error rejecting bid:', error);
      return {
        success: false,
        message: 'Failed to reject bid',
        error: 'REJECT_BID_ERROR'
      };
    }
  }

  /**
   * Get bids for a listing
   */
  getBidsForListing(listingId: string): Bid[] {
    return this.dataService.getBidsByListing(listingId);
  }

  /**
   * Get bids by user
   */
  getBidsByUser(userId: string): Bid[] {
    return this.dataService.getBidsByUser(userId);
  }

  /**
   * Get bid by ID
   */
  getBidById(bidId: string): Bid | null {
    return this.dataService.getBidById(bidId);
  }

  /**
   * Get recommended authentication partner for a listing
   */
  private getRecommendedAuthPartner(listing: any): string {
    // For now, use WatchBox as default
    // In the future, this could be based on listing details
    return 'watchbox';
  }

  /**
   * Create bid notification for seller
   */
  private createBidNotification(bid: Bid, listing: any): void {
    const buyer = this.dataService.getUserById(bid.buyerId);
    const buyerName = buyer ? buyer.name : 'A buyer';
    
    this.dataService.saveNotification({
      id: this.generateId(),
      userId: listing.sellerId,
      title: 'New Bid Received',
      message: `${buyerName} placed a bid of $${bid.amount.toLocaleString()} on your ${listing.title}`,
      type: 'bid',
      isRead: false,
      timestamp: new Date(),
      relatedListingId: listing.id,
      relatedBidId: bid.id
    });
  }

  /**
   * Create acceptance notification for buyer
   */
  private createAcceptanceNotification(bid: Bid, listing: any): void {
    this.dataService.saveNotification({
      id: this.generateId(),
      userId: bid.buyerId,
      title: 'Bid Accepted!',
      message: `Your bid of $${bid.amount.toLocaleString()} on ${listing.title} has been accepted. Please pay the authentication fee to proceed.`,
      type: 'bid',
      isRead: false,
      timestamp: new Date(),
      relatedListingId: listing.id,
      relatedBidId: bid.id
    });
  }

  /**
   * Create rejection notification for buyer
   */
  private createRejectionNotification(bid: Bid, listing: any): void {
    this.dataService.saveNotification({
      id: this.generateId(),
      userId: bid.buyerId,
      title: 'Bid Rejected',
      message: `Your bid of $${bid.amount.toLocaleString()} on ${listing.title} was not accepted.`,
      type: 'bid',
      isRead: false,
      timestamp: new Date(),
      relatedListingId: listing.id,
      relatedBidId: bid.id
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 