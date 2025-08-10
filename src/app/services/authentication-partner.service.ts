import { Injectable } from '@angular/core';
import { AuthenticationPartner, AuthenticationRequest, AuthenticationResult } from '../models/authentication-partner.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationPartnerService {
  private readonly PARTNERS_KEY = 'watch_ios_authentication_partners';
  private readonly REQUESTS_KEY = 'watch_ios_authentication_requests';

  private readonly DEFAULT_PARTNERS: AuthenticationPartner[] = [
    {
      id: 'watchcsa',
      name: 'WatchCSA',
      description: 'Professional watch authentication and certification service with 30+ years of experience',
      baseFee: 150,
      specialty: 'Luxury Swiss watches, Rolex, Omega, Patek Philippe',
      estimatedTime: '3-5 business days',
      coverage: ['Swiss watches', 'Luxury brands', 'Vintage pieces', 'Limited editions'],
      features: [
        'Professional authentication',
        'Detailed condition report',
        'Certificate of authenticity',
        'Market value assessment',
        'Insurance documentation'
      ],
      supportedCountries: ['US', 'CA', 'UK', 'EU', 'AU', 'JP', 'SG'],
      verificationMethods: ['Physical inspection', 'Document verification', 'Movement analysis'],
      isActive: true,
      rating: 4.9,
      totalVerifications: 15000,
      successRate: 99.2
    },
    {
      id: 'swiss-watch-group',
      name: 'Swiss Watch Group',
      description: 'Expert authentication for luxury Swiss timepieces with Geneva-based specialists',
      baseFee: 200,
      specialty: 'Swiss luxury watches, Patek Philippe, Audemars Piguet, Vacheron Constantin',
      estimatedTime: '5-7 business days',
      coverage: ['Swiss luxury', 'Complications', 'Tourbillons', 'Minute repeaters'],
      features: [
        'Swiss expert team',
        'Movement authenticity verification',
        'Complication testing',
        'Heritage documentation',
        'Investment grade certification'
      ],
      supportedCountries: ['US', 'CA', 'UK', 'EU', 'CH'],
      verificationMethods: ['Swiss expert review', 'Movement testing', 'Documentation verification'],
      isActive: true,
      rating: 4.8,
      totalVerifications: 8500,
      successRate: 98.9
    },
    {
      id: 'luxury-watch-specialists',
      name: 'Luxury Watch Specialists',
      description: 'Specialized authentication for high-end luxury watches with rapid turnaround',
      baseFee: 175,
      specialty: 'High-end luxury, Limited editions, Vintage pieces',
      estimatedTime: '4-6 business days',
      coverage: ['Luxury brands', 'Limited editions', 'Vintage', 'Investment pieces'],
      features: [
        'Rapid turnaround',
        'Expert authentication',
        'Condition assessment',
        'Market analysis',
        'Investment advice'
      ],
      supportedCountries: ['US', 'CA', 'UK', 'EU', 'AU'],
      verificationMethods: ['Expert review', 'Condition assessment', 'Market analysis'],
      isActive: true,
      rating: 4.7,
      totalVerifications: 12000,
      successRate: 99.0
    },
    {
      id: 'gia',
      name: 'GIA (Gemological Institute)',
      description: 'Diamond-set watch authentication and certification with gemological expertise',
      baseFee: 250,
      specialty: 'Diamond-set watches, Gemstone verification, Luxury jewelry timepieces',
      estimatedTime: '7-10 business days',
      coverage: ['Diamond-set watches', 'Gemstone verification', 'Luxury jewelry'],
      features: [
        'Gemological expertise',
        'Diamond certification',
        'Gemstone verification',
        'Jewelry authentication',
        'Investment documentation'
      ],
      supportedCountries: ['US', 'CA', 'UK', 'EU', 'AU', 'JP'],
      verificationMethods: ['Gemological analysis', 'Diamond testing', 'Jewelry verification'],
      isActive: true,
      rating: 4.9,
      totalVerifications: 9500,
      successRate: 99.5
    },
    {
      id: 'watch-authenticators',
      name: 'Watch Authenticators',
      description: 'Comprehensive authentication service with digital verification and blockchain certification',
      baseFee: 125,
      specialty: 'Digital verification, Blockchain certification, Modern authentication',
      estimatedTime: '2-4 business days',
      coverage: ['Modern watches', 'Digital verification', 'Blockchain certification'],
      features: [
        'Digital verification',
        'Blockchain certification',
        'Rapid processing',
        'Online tracking',
        'Digital certificates'
      ],
      supportedCountries: ['US', 'CA', 'UK', 'EU', 'AU', 'JP', 'SG'],
      verificationMethods: ['Digital verification', 'Online tracking', 'Blockchain certification'],
      isActive: true,
      rating: 4.6,
      totalVerifications: 8000,
      successRate: 98.7
    }
  ];

  constructor() {
    this.initializePartners();
  }

  /**
   * Get all available authentication partners
   */
  getAuthenticationPartners(): AuthenticationPartner[] {
    const data = localStorage.getItem(this.PARTNERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return this.DEFAULT_PARTNERS;
  }

  /**
   * Get authentication partner by ID
   */
  getPartnerById(partnerId: string): AuthenticationPartner | undefined {
    const partners = this.getAuthenticationPartners();
    return partners.find(p => p.id === partnerId);
  }

  /**
   * Get active authentication partners
   */
  getActivePartners(): AuthenticationPartner[] {
    return this.getAuthenticationPartners().filter(p => p.isActive);
  }

  /**
   * Get partners by specialty
   */
  getPartnersBySpecialty(specialty: string): AuthenticationPartner[] {
    return this.getActivePartners().filter(p => 
      p.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  /**
   * Get partners by price range
   */
  getPartnersByPriceRange(minPrice: number, maxPrice: number): AuthenticationPartner[] {
    return this.getActivePartners().filter(p => 
      p.baseFee >= minPrice && p.baseFee <= maxPrice
    );
  }

  /**
   * Get recommended partner based on watch details
   */
  getRecommendedPartner(
    brand: string,
    model: string,
    estimatedValue: number,
    userCountry: string = 'US'
  ): AuthenticationPartner {
    const partners = this.getActivePartners();
    
    // Filter by country support
    const supportedPartners = partners.filter(p => 
      p.supportedCountries.includes(userCountry) || p.supportedCountries.includes('US')
    );
    
    if (supportedPartners.length === 0) {
      return partners[0]; // Fallback to first partner
    }

    // Score partners based on relevance
    const scoredPartners = supportedPartners.map(partner => {
      let score = 0;
      
      // Brand specialty match
      if (partner.specialty.toLowerCase().includes(brand.toLowerCase())) {
        score += 10;
      }
      
      // Value range appropriateness
      if (estimatedValue > 10000 && partner.baseFee >= 200) {
        score += 5;
      } else if (estimatedValue <= 10000 && partner.baseFee <= 200) {
        score += 5;
      }
      
      // Rating bonus
      score += partner.rating * 2;
      
      // Success rate bonus
      score += partner.successRate / 10;
      
      return { partner, score };
    });

    // Return highest scored partner
    scoredPartners.sort((a, b) => b.score - a.score);
    return scoredPartners[0].partner;
  }

  /**
   * Create authentication request
   */
  createAuthenticationRequest(
    bidId: string,
    buyerId: string,
    sellerId: string,
    listingId: string,
    partnerId: string,
    estimatedValue: number
  ): AuthenticationRequest {
    const partner = this.getPartnerById(partnerId);
    if (!partner) {
      throw new Error('Invalid authentication partner');
    }

    // Calculate costs
    const authenticationFee = partner.baseFee;
    const shippingCosts = this.calculateShippingCosts(estimatedValue);
    const cancellationFee = 45; // Fixed cancellation fee
    const totalSellerCosts = authenticationFee + shippingCosts + cancellationFee;

    const authRequest: AuthenticationRequest = {
      id: this.generateId(),
      bidId,
      buyerId,
      sellerId,
      listingId,
      partnerId,
      status: 'pending',
      authenticationFee,
      shippingCosts,
      cancellationFee,
      totalSellerCosts,
      createdAt: new Date(),
      estimatedCompletion: this.calculateEstimatedCompletion(partner.estimatedTime)
    };

    // Save to local storage
    this.saveAuthenticationRequest(authRequest);

    return authRequest;
  }

  /**
   * Get authentication requests for a user
   */
  getUserAuthenticationRequests(userId: string): AuthenticationRequest[] {
    const requests = this.getAuthenticationRequests();
    return requests.filter(r => r.buyerId === userId || r.sellerId === userId);
  }

  /**
   * Get authentication request by ID
   */
  getAuthenticationRequest(requestId: string): AuthenticationRequest | undefined {
    const requests = this.getAuthenticationRequests();
    return requests.find(r => r.id === requestId);
  }

  /**
   * Update authentication request status
   */
  updateAuthenticationStatus(
    requestId: string, 
    status: AuthenticationRequest['status'],
    result?: AuthenticationResult
  ): void {
    const requests = this.getAuthenticationRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
      request.status = status;
      if (result) {
        request.result = result;
      }
      if (status === 'success' || status === 'failed') {
        request.estimatedCompletion = new Date();
      }
      
      this.saveAuthenticationRequests(requests);
    }
  }

  /**
   * Calculate shipping costs based on estimated value
   */
  private calculateShippingCosts(estimatedValue: number): number {
    // Base shipping cost
    let baseCost = 25;
    
    // Add insurance cost for high-value items
    if (estimatedValue > 10000) {
      baseCost += 15; // Additional insurance
    }
    
    // Add signature required cost for luxury items
    if (estimatedValue > 5000) {
      baseCost += 5; // Signature required
    }
    
    return baseCost;
  }

  /**
   * Calculate estimated completion date
   */
  private calculateEstimatedCompletion(estimatedTime: string): Date {
    const now = new Date();
    const days = parseInt(estimatedTime.split('-')[1]) || 5; // Default to 5 days
    const completionDate = new Date(now);
    completionDate.setDate(now.getDate() + days);
    return completionDate;
  }

  /**
   * Get authentication statistics
   */
  getAuthenticationStats(): {
    totalRequests: number;
    pendingRequests: number;
    inProgressRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageProcessingTime: number;
  } {
    const requests = this.getAuthenticationRequests();
    const completedRequests = requests.filter(r => 
      r.status === 'success' || r.status === 'failed'
    );
    
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const inProgressRequests = requests.filter(r => r.status === 'in-progress').length;
    const successfulRequests = requests.filter(r => r.status === 'success').length;
    const failedRequests = requests.filter(r => r.status === 'failed').length;
    
    const averageProcessingTime = completedRequests.length > 0 
      ? completedRequests.reduce((sum, req) => {
          if (req.estimatedCompletion && req.createdAt) {
            return sum + (req.estimatedCompletion.getTime() - req.createdAt.getTime());
          }
          return sum;
        }, 0) / completedRequests.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;
    
    return {
      totalRequests,
      pendingRequests,
      inProgressRequests,
      successfulRequests,
      failedRequests,
      averageProcessingTime
    };
  }

  // Private helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializePartners(): void {
    const existingPartners = localStorage.getItem(this.PARTNERS_KEY);
    if (!existingPartners) {
      localStorage.setItem(this.PARTNERS_KEY, JSON.stringify(this.DEFAULT_PARTNERS));
    }
  }

  private getAuthenticationRequests(): AuthenticationRequest[] {
    const data = localStorage.getItem(this.REQUESTS_KEY);
    if (!data) return [];
    
    const requests = JSON.parse(data);
    return requests.map((req: any) => ({
      ...req,
      createdAt: new Date(req.createdAt),
      estimatedCompletion: req.estimatedCompletion ? new Date(req.estimatedCompletion) : undefined,
      result: req.result ? {
        ...req.result,
        completedAt: new Date(req.result.completedAt)
      } : undefined
    }));
  }

  private saveAuthenticationRequest(request: AuthenticationRequest): void {
    const requests = this.getAuthenticationRequests();
    requests.push(request);
    this.saveAuthenticationRequests(requests);
  }

  private saveAuthenticationRequests(requests: AuthenticationRequest[]): void {
    try {
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to save authentication requests:', error);
    }
  }
}
