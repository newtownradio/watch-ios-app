export interface Bid {
  id: string;
  itemId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined' | 'counteroffered' | 'counteroffer_accepted' | 'counteroffer_rejected';
  isCounteroffer?: boolean;
  originalBidId?: string; // Reference to original bid if this is a counteroffer
}

export interface Counteroffer {
  id: string;
  originalBidId: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string; // Optional message from seller
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  imageUrl: string;
  createdAt: Date;
  endTime: Date; // 48 hours from creation
  status: 'active' | 'expired' | 'sold';
  bids: Bid[];
  highestBid?: Bid;
  counteroffers: Counteroffer[];
  hasMadeCounteroffer: boolean; // Track if seller has already made a counteroffer
}

export interface SaleWindow {
  listingId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
  remainingTime: number; // in milliseconds
}