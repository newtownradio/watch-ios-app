import { Injectable, inject } from '@angular/core';
import { DataPersistenceService } from './data-persistence.service';

export interface AuthenticationPartner {
  id: string;
  name: string;
  description: string;
  specializations: string[];
  baseFee: number;
  estimatedTime: string;
  supportedBrands: string[];
  features: string[];
}

export interface AuthenticationRequest {
  id: string;
  bidId: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  partnerId: string;
  status: 'pending' | 'in-progress' | 'success' | 'failed';
  authenticationFee: number;
  shippingCosts: number;
  cancellationFee: number;
  totalSellerCosts: number;
  createdAt: Date;
  estimatedCompletion?: Date;
  result?: AuthenticationResult;
}

export interface AuthenticationResult {
  id: string;
  authRequestId: string;
  result: 'pass' | 'fail';
  notes: string;
  inspectorId?: string;
  completedAt: Date;
  details: {
    authenticity: boolean;
    condition: string;
    functionality: boolean;
    serialNumber?: string;
    documentation?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private dataService = inject(DataPersistenceService);

  // Authentication Partners
  private readonly AUTHENTICATION_PARTNERS: AuthenticationPartner[] = [
    {
      id: 'watchbox',
      name: 'WatchBox Authentication',
      description: 'Industry-leading authentication service with comprehensive verification',
      specializations: ['All luxury watches', 'Comprehensive condition assessment'],
      baseFee: 150,
      estimatedTime: '3-5 business days',
      supportedBrands: ['All brands'],
      features: [
        'Full authenticity verification',
        'Condition assessment',
        'Functionality testing',
        'Documentation review',
        'Serial number verification'
      ]
    },
    {
      id: 'swiss-watch-group',
      name: 'Swiss Watch Group',
      description: 'Swiss-based authentication with European expertise',
      specializations: ['Swiss luxury watches', 'European market expertise'],
      baseFee: 120,
      estimatedTime: '4-6 business days',
      supportedBrands: ['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Vacheron Constantin'],
      features: [
        'Swiss expertise',
        'European market knowledge',
        'Condition assessment',
        'Functionality testing'
      ]
    },
    {
      id: 'rolex-service',
      name: 'Rolex Service Centers',
      description: 'Official Rolex authentication and service',
      specializations: ['Rolex watches only'],
      baseFee: 200,
      estimatedTime: '5-7 business days',
      supportedBrands: ['Rolex'],
      features: [
        'Official Rolex authentication',
        'Genuine parts verification',
        'Service history check',
        'Warranty validation'
      ]
    },
    {
      id: 'omega-service',
      name: 'Omega Service Centers',
      description: 'Official Omega authentication and service',
      specializations: ['Omega watches only'],
      baseFee: 180,
      estimatedTime: '5-7 business days',
      supportedBrands: ['Omega'],
      features: [
        'Official Omega authentication',
        'Genuine parts verification',
        'Service history check',
        'Warranty validation'
      ]
    },
    {
      id: 'patek-service',
      name: 'Patek Philippe Service Centers',
      description: 'Official Patek Philippe authentication and service',
      specializations: ['Patek Philippe watches only'],
      baseFee: 250,
      estimatedTime: '7-10 business days',
      supportedBrands: ['Patek Philippe'],
      features: [
        'Official Patek Philippe authentication',
        'Genuine parts verification',
        'Service history check',
        'Warranty validation'
      ]
    },
    {
      id: 'gia',
      name: 'GIA (Gemological Institute)',
      description: 'Specialized authentication for diamond-set watches',
      specializations: ['Diamond-set watches', 'Gemstone verification'],
      baseFee: 300,
      estimatedTime: '7-10 business days',
      supportedBrands: ['All brands with diamonds'],
      features: [
        'Diamond authenticity verification',
        'Gemstone quality assessment',
        'Setting verification',
        'Diamond certification',
        'Value assessment'
      ]
    }
  ];

  constructor() {
    console.log('AuthenticationService initialized');
  }

  /**
   * Get all available authentication partners
   */
  getAuthenticationPartners(): AuthenticationPartner[] {
    return this.AUTHENTICATION_PARTNERS;
  }

  /**
   * Get authentication partners for a specific watch brand
   */
  getPartnersForBrand(brand: string): AuthenticationPartner[] {
    return this.AUTHENTICATION_PARTNERS.filter(partner => 
      partner.supportedBrands.includes(brand) || 
      partner.supportedBrands.includes('All brands') ||
      (brand.toLowerCase().includes('diamond') && partner.id === 'gia')
    );
  }

  /**
   * Get authentication partners for diamond-set watches
   */
  getPartnersForDiamondWatches(): AuthenticationPartner[] {
    return this.AUTHENTICATION_PARTNERS.filter(partner => 
      partner.specializations.some(spec => spec.toLowerCase().includes('diamond'))
    );
  }

  /**
   * Get recommended authentication partner for a watch
   */
  getRecommendedPartner(brand: string, hasDiamonds = false): AuthenticationPartner {
    if (hasDiamonds) {
      return this.AUTHENTICATION_PARTNERS.find(p => p.id === 'gia')!;
    }

    // Brand-specific recommendations
    switch (brand.toLowerCase()) {
      case 'rolex':
        return this.AUTHENTICATION_PARTNERS.find(p => p.id === 'rolex-service')!;
      case 'omega':
        return this.AUTHENTICATION_PARTNERS.find(p => p.id === 'omega-service')!;
      case 'patek philippe':
        return this.AUTHENTICATION_PARTNERS.find(p => p.id === 'patek-service')!;
      default:
        return this.AUTHENTICATION_PARTNERS.find(p => p.id === 'watchbox')!;
    }
  }

  /**
   * Create authentication request
   */
  async createAuthenticationRequest(
    bidId: string,
    buyerId: string,
    sellerId: string,
    listingId: string,
    partnerId: string
  ): Promise<AuthenticationRequest> {
    const partner = this.AUTHENTICATION_PARTNERS.find(p => p.id === partnerId);
    if (!partner) {
      throw new Error('Invalid authentication partner');
    }

    const authRequest: AuthenticationRequest = {
      id: this.generateId(),
      bidId,
      buyerId,
      sellerId,
      listingId,
      partnerId,
      status: 'pending',
      authenticationFee: partner.baseFee,
      shippingCosts: 0, // Will be calculated based on shipping
      cancellationFee: 45, // Fixed cancellation fee
      totalSellerCosts: 0, // Will be calculated when needed
      createdAt: new Date()
    };

    // Save to local storage for now (will be replaced with backend)
    this.dataService.saveAuthenticationRequest(authRequest);

    return authRequest;
  }

  /**
   * Get authentication request by ID
   */
  getAuthenticationRequest(id: string): AuthenticationRequest | null {
    const requests = this.dataService.getAuthenticationRequests();
    return requests.find(req => req.id === id) || null;
  }

  /**
   * Update authentication request status
   */
  updateAuthenticationStatus(id: string, status: AuthenticationRequest['status']): void {
    const request = this.dataService.getAuthenticationRequestById(id);
    if (request) {
      request.status = status;
      this.dataService.updateAuthenticationRequest(request);
    }
  }

  /**
   * Simulate authentication result (for development)
   */
  async simulateAuthenticationResult(authRequestId: string, result: 'pass' | 'fail'): Promise<AuthenticationResult> {
    const authRequest = this.getAuthenticationRequest(authRequestId);
    if (!authRequest) {
      throw new Error('Authentication request not found');
    }

    const authResult: AuthenticationResult = {
      id: this.generateId(),
      authRequestId,
      result,
      notes: result === 'pass' 
        ? 'Watch authenticated successfully. All components verified as genuine.'
        : 'Authentication failed. Item does not meet authenticity standards.',
      completedAt: new Date(),
      details: {
        authenticity: result === 'pass',
        condition: result === 'pass' ? 'Excellent' : 'Poor',
        functionality: result === 'pass',
        serialNumber: result === 'pass' ? 'SN123456789' : undefined,
        documentation: result === 'pass' ? ['Certificate', 'Manual'] : []
      }
    };

    // Update the authentication request with total seller costs if failed
    if (result === 'fail') {
      authRequest.totalSellerCosts = this.calculateSellerCostsForFailure(authRequest);
      this.dataService.updateAuthenticationRequest(authRequest);
    }

    // Update the authentication request status
    this.updateAuthenticationStatus(authRequestId, result === 'pass' ? 'success' : 'failed');

    return authResult;
  }

  /**
   * Calculate shipping costs for authentication
   */
  calculateShippingCosts(fromZip: string, toZip: string, weight: number): number {
    // Simplified calculation - in production, this would integrate with UPS API
    const baseCost = 25;
    const weightMultiplier = weight * 2;
    const distanceMultiplier = 1.5; // Simplified distance calculation
    
    return Math.round(baseCost + weightMultiplier + distanceMultiplier);
  }

  /**
   * Calculate total seller costs for failed authentication
   */
  calculateSellerCostsForFailure(authRequest: AuthenticationRequest): number {
    return authRequest.authenticationFee + authRequest.shippingCosts + authRequest.cancellationFee;
  }

  /**
   * Get detailed cost breakdown for authentication failure
   */
  getFailureCostBreakdown(authRequest: AuthenticationRequest): {
    authenticationFee: number;
    shippingCosts: number;
    cancellationFee: number;
    totalCost: number;
  } {
    const totalCost = this.calculateSellerCostsForFailure(authRequest);
    
    return {
      authenticationFee: authRequest.authenticationFee,
      shippingCosts: authRequest.shippingCosts,
      cancellationFee: authRequest.cancellationFee,
      totalCost
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 