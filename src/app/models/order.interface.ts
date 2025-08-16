export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  watchTitle: string;
  watchBrand: string;
  watchModel: string;
  finalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Payment details
  paymentDate?: Date;
  paymentIntentId?: string;
  
  // Shipping details
  trackingNumber?: string;
  carrier?: string;
  shippedDate?: Date;
  estimatedDelivery?: string;
  deliveredDate?: Date;
  
  // Return details
  returnRequest?: ReturnRequest;
  returnWindowStart?: Date;
  returnType?: ReturnType;
  returnShippingPaidBy?: 'buyer' | 'seller';
  
  // Additional metadata
  notes?: string;
  verificationCost?: number;
  shippingCost?: number;
  totalCost?: number;
}

export type OrderStatus = 
  | 'pending_bid'
  | 'pending_payment'
  | 'payment_confirmed'
  | 'authentication_in_progress'
  | 'authenticated'
  | 'shipped'
  | 'delivered'
  | 'inspection_period'
  | 'completed'
  | 'return_requested'
  | 'returned'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type ShippingStatus = 
  | 'pending'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'returned';

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  returnType: ReturnType;
  requestedDate: Date;
  status: 'pending_approval' | 'approved' | 'rejected';
  notes?: string;
  returnShippingLabel?: string;
  returnTrackingNumber?: string;
}

export type ReturnType = 
  | 'buyer_remorse'
  | 'item_mismatch'
  | 'not_as_described'
  | 'damaged_in_transit';
