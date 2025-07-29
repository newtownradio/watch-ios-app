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
  brand?: string; // Brand of the watch
  model?: string; // Model of the watch
  year?: number; // Year of manufacture
  condition?: 'excellent' | 'very-good' | 'good' | 'fair'; // Condition of the watch
  startingPrice: number;
  currentPrice: number;
  imageUrl: string;
  createdAt: Date;
  endTime: Date; // 48 hours from creation
  status: 'active' | 'expired' | 'sold' | 'scheduled';
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

// New interfaces for enhanced transaction flow
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Added for authentication
  idVerified: boolean;
  disclaimerSigned: boolean;
  policySigned: boolean;
  termsSigned?: boolean; // Added for terms agreement
  governmentIdUrl?: string; // Added for government ID upload
  verificationDate?: Date;
  createdAt?: Date; // Added for user creation tracking
}

export interface Watch {
  id: string;
  title: string;
  brand: string;
  model: string;
  year?: number;
  condition: 'excellent' | 'very-good' | 'good' | 'fair';
  description: string;
  sellerId: string;
  askingPrice: number;
  images: string[];
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  watchId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  message?: string;
}

export interface Transaction {
  id: string;
  watchId: string;
  buyerId: string;
  sellerId: string;
  finalPrice: number;
  shippingCost: number;
  verificationCost: number;
  commissionFee: number;
  insuranceCost: number;
  totalAmount: number;
  status: 'pending' | 'shipped-to-verifier' | 'verifying' | 'shipped-to-buyer' | 'completed' | 'disputed' | 'cancelled';
  verificationPartner: string;
  trackingNumber?: string;
  verificationDate?: Date;
  buyerConfirmationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingBreakdown {
  itemPrice: number;
  shippingCost: number;
  verificationCost: number;
  commissionFee: number;
  insuranceCost: number;
  totalAmount: number;
}

export interface VerificationPartner {
  id: string;
  name: string;
  cost: number;
  turnaroundTime: string;
  description: string;
}