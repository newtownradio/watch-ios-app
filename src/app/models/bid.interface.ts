export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  idVerified?: boolean;
  disclaimerSigned?: boolean;
  policySigned?: boolean;
  termsSigned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  governmentIdUrl?: string;
  verificationDate?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'message' | 'system' | 'alert' | 'bid' | 'counteroffer' | 'listing';
  relatedListingId?: string;
  relatedBidId?: string;
}

export interface Bid {
  id: string;
  itemId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
  status: 'active' | 'won' | 'lost' | 'pending' | 'accepted' | 'declined' | 'counteroffered' | 'rejected';
  expiresAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  authenticationRequestId?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price?: number;
  startingPrice: number;
  currentPrice: number;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  originalPrice?: number;
  images?: string[];
  imageUrl?: string;
  status: 'active' | 'sold' | 'expired' | 'scheduled';
  createdAt: Date;
  endTime: Date;
  hasMadeCounteroffer?: boolean;
  bids: Bid[];
  counteroffers: Counteroffer[];
  highestBid?: Bid;
  governmentIdUrl?: string;
}

export interface Counteroffer {
  id: string;
  listingId: string;
  bidId: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  originalAmount: number;
  counterAmount: number;
  amount: number;
  message?: string;
  originalBidId?: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Watch {
  id: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  price: number;
  askingPrice: number;
  title: string;
  images: string[];
  description: string;
  sellerId: string;
  sellerName: string;
  status: 'available' | 'sold' | 'reserved';
  verificationStatus?: string;
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

export interface VerificationPartner {
  id: string;
  name: string;
  cost: number;
  turnaroundTime: string;
  description: string;
}
