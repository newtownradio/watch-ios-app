export interface AuthenticationPartner {
  id: string;
  name: string;
  description: string;
  baseFee: number;
  specialty: string;
  estimatedTime: string;
  coverage: string[];
  features: string[];
  supportedCountries: string[];
  verificationMethods: string[];
  apiEndpoint?: string;
  isActive: boolean;
  rating: number;
  totalVerifications: number;
  successRate: number;
}

export interface AuthenticationRequest {
  id: string;
  bidId: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  partnerId: string;
  status: 'pending' | 'in-progress' | 'success' | 'failed' | 'cancelled';
  authenticationFee: number;
  shippingCosts: number;
  cancellationFee: number;
  totalSellerCosts: number;
  createdAt: Date;
  estimatedCompletion?: Date;
  result?: AuthenticationResult;
  trackingNumber?: string;
  shippingLabel?: string;
}

export interface AuthenticationResult {
  isAuthentic: boolean;
  confidence: number;
  details: string;
  certificateUrl?: string;
  completedAt: Date;
  inspectorNotes?: string;
  qualityScore?: number;
}

export interface ShippingDetails {
  fromAddress: Address;
  toAddress: Address;
  packageDetails: PackageDetails;
  shippingMethod: ShippingMethod;
  estimatedCost: number;
  estimatedDelivery: string;
  trackingNumber?: string;
  shippingLabel?: string;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface PackageDetails {
  weight: number; // in pounds
  dimensions: {
    length: number; // in inches
    width: number;
    height: number;
  };
  declaredValue: number;
  contents: string;
  fragile: boolean;
  insuranceRequired: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  cost: number;
  insuranceIncluded: boolean;
  trackingIncluded: boolean;
  signatureRequired: boolean;
}
