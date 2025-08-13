import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, timeout, retry } from 'rxjs/operators';
import { AuthenticationPartner, AuthenticationRequest, AuthenticationResult } from '../models/authentication-partner.interface';

export interface VerificationApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export interface VerificationRequestPayload {
  partnerId: string;
  watchDetails: {
    brand: string;
    model: string;
    serialNumber?: string;
    year?: number;
    condition: string;
    estimatedValue: number;
    photos: string[];
    description: string;
  };
  sellerInfo: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  shippingDetails: {
    fromAddress: {
      name: string;
      company?: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
      email: string;
    };
    toAddress: {
      name: string;
      company: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
      email: string;
    };
    packageDetails: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
      declaredValue: number;
      insuranceRequired: boolean;
    };
  };
  authenticationOptions: {
    includeConditionReport: boolean;
    includeMarketValuation: boolean;
    includeInvestmentGrade: boolean;
    rushService: boolean;
  };
}

export interface VerificationResponse {
  requestId: string;
  status: 'accepted' | 'rejected' | 'pending_review';
  estimatedCompletion: string;
  totalCost: number;
  breakdown: {
    authenticationFee: number;
    shippingCosts: number;
    insuranceCosts: number;
    rushServiceFee?: number;
    additionalServices?: number;
  };
  instructions: {
    shippingLabel?: string;
    packagingRequirements: string[];
    specialInstructions: string[];
    contactInformation: {
      name: string;
      phone: string;
      email: string;
      address: string;
    };
  };
  nextSteps: string[];
}

export interface VerificationStatusResponse {
  requestId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  currentStage: string;
  progress: number; // 0-100
  estimatedCompletion: string;
  lastUpdated: string;
  currentLocation?: string;
  inspectorNotes?: string;
  photos?: string[];
}

export interface VerificationResultResponse {
  requestId: string;
  status: 'completed' | 'failed';
  result: {
    isAuthentic: boolean;
    confidence: number;
    authenticityScore: number;
    conditionScore: number;
    marketValue: number;
    certificateUrl: string;
    detailedReport: string;
    inspectorNotes: string;
    qualityAssessment: {
      movement: string;
      case: string;
      dial: string;
      bracelet: string;
      overall: string;
    };
    recommendations: string[];
    completedAt: string;
  };
  shipping: {
    returnTrackingNumber: string;
    estimatedReturnDate: string;
    returnLabel?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VerificationApiService {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_RETRY_ATTEMPTS = 3;

  // Configuration for different authentication partners
  private readonly PARTNER_CONFIGS: Record<string, VerificationApiConfig> = {
    'watchcsa': {
      baseUrl: 'https://api.watchcsa.com/v1',
      apiKey: 'YOUR_WATCHCSA_API_KEY', // Store in environment variables
      timeout: 30000,
      retryAttempts: 3
    },
    'swiss-watch-group': {
      baseUrl: 'https://api.swisswatchgroup.com/v2',
      apiKey: 'YOUR_SWISS_WATCH_GROUP_API_KEY',
      timeout: 45000,
      retryAttempts: 2
    },
    'luxury-watch-specialists': {
      baseUrl: 'https://api.luxurywatchspecialists.com/v1',
      apiKey: 'YOUR_LUXURY_WATCH_SPECIALISTS_API_KEY',
      timeout: 35000,
      retryAttempts: 3
    },
    'gia': {
      baseUrl: 'https://api.gia.edu/v1',
      apiKey: 'YOUR_GIA_API_KEY',
      timeout: 60000,
      retryAttempts: 2
    },
    'bobs-watches': {
      baseUrl: 'https://api.bobswatches.com/v1',
      apiKey: 'YOUR_BOBS_WATCHES_API_KEY',
      timeout: 40000,
      retryAttempts: 3
    }
  };

  constructor(private http: HttpClient) {}

  /**
   * Submit a verification request to an authentication partner
   */
  submitVerificationRequest(
    partnerId: string,
    payload: VerificationRequestPayload
  ): Observable<VerificationResponse> {
    const config = this.PARTNER_CONFIGS[partnerId];
    if (!config) {
      return throwError(() => new Error(`Unknown authentication partner: ${partnerId}`));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId()
    });

    return this.http.post<VerificationResponse>(
      `${config.baseUrl}/verification/request`,
      payload,
      { headers }
    ).pipe(
      timeout(config.timeout),
      retry(config.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Check the status of a verification request
   */
  getVerificationStatus(
    partnerId: string,
    requestId: string
  ): Observable<VerificationStatusResponse> {
    const config = this.PARTNER_CONFIGS[partnerId];
    if (!config) {
      return throwError(() => new Error(`Unknown authentication partner: ${partnerId}`));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${config.apiKey}`,
      'X-Request-ID': this.generateRequestId()
    });

    return this.http.get<VerificationStatusResponse>(
      `${config.baseUrl}/verification/status/${requestId}`,
      { headers }
    ).pipe(
      timeout(config.timeout),
      retry(config.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Get the final verification result
   */
  getVerificationResult(
    partnerId: string,
    requestId: string
  ): Observable<VerificationResultResponse> {
    const config = this.PARTNER_CONFIGS[partnerId];
    if (!config) {
      return throwError(() => new Error(`Unknown authentication partner: ${partnerId}`));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${config.apiKey}`,
      'X-Request-ID': this.generateRequestId()
    });

    return this.http.get<VerificationResultResponse>(
      `${config.baseUrl}/verification/result/${requestId}`,
      { headers }
    ).pipe(
      timeout(config.timeout),
      retry(config.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Cancel a verification request (if allowed by partner)
   */
  cancelVerificationRequest(
    partnerId: string,
    requestId: string,
    reason: string
  ): Observable<{ success: boolean; message: string; cancellationFee?: number }> {
    const config = this.PARTNER_CONFIGS[partnerId];
    if (!config) {
      return throwError(() => new Error(`Unknown authentication partner: ${partnerId}`));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId()
    });

    return this.http.post<{ success: boolean; message: string; cancellationFee?: number }>(
      `${config.baseUrl}/verification/cancel/${requestId}`,
      { reason },
      { headers }
    ).pipe(
      timeout(config.timeout),
      retry(config.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Get available services and pricing for a partner
   */
  getPartnerServices(partnerId: string): Observable<{
    services: Array<{
      id: string;
      name: string;
      description: string;
      basePrice: number;
      turnaroundTime: string;
      includedFeatures: string[];
      optionalAddons: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
      }>;
    }>;
    pricing: {
      baseFee: number;
      rushServiceFee: number;
      insuranceFee: number;
      returnShippingFee: number;
      additionalPhotoFee: number;
    };
  }> {
    const config = this.PARTNER_CONFIGS[partnerId];
    if (!config) {
      return throwError(() => new Error(`Unknown authentication partner: ${partnerId}`));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${config.apiKey}`,
      'X-Request-ID': this.generateRequestId()
    });

    return this.http.get<{
      services: Array<{
        id: string;
        name: string;
        description: string;
        basePrice: number;
        turnaroundTime: string;
        includedFeatures: string[];
        optionalAddons: Array<{
          id: string;
          name: string;
          description: string;
          price: number;
        }>;
      }>;
      pricing: {
        baseFee: number;
        rushServiceFee: number;
        insuranceFee: number;
        returnShippingFee: number;
        additionalPhotoFee: number;
      };
    }>(
      `${config.baseUrl}/services`,
      { headers }
    ).pipe(
      timeout(config.timeout),
      retry(config.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Validate if a partner can handle a specific watch type
   */
  validateWatchCompatibility(
    partnerId: string,
    watchDetails: {
      brand: string;
      model: string;
      year?: number;
      estimatedValue: number;
    }
  ): Observable<{
    compatible: boolean;
    confidence: number;
    estimatedFee: number;
    turnaroundTime: string;
    specialRequirements?: string[];
    recommendations?: string[];
  }> {
    const config = this.PARTNER_CONFIGS[partnerId];
    if (!config) {
      return throwError(() => new Error(`Unknown authentication partner: ${partnerId}`));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId()
    });

    return this.http.post<{
      compatible: boolean;
      confidence: number;
      estimatedFee: number;
      turnaroundTime: string;
      specialRequirements?: string[];
      recommendations?: string[];
    }>(
      `${config.baseUrl}/verification/validate`,
      watchDetails,
      { headers }
    ).pipe(
      timeout(config.timeout),
      retry(config.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Get real-time availability and scheduling for a partner
   */
  getPartnerAvailability(
    partnerId: string,
    dateRange: {
      startDate: string;
      endDate: string;
    }
  ): Observable<{
    availableSlots: Array<{
      date: string;
      timeSlots: string[];
      currentCapacity: number;
      maxCapacity: number;
    }>;
    nextAvailableDate: string;
    estimatedWaitTime: string;
  }> {
    const config = this.PARTNER_CONFIGS[partnerId];
    if (!config) {
      return throwError(() => new Error(`Unknown authentication partner: ${partnerId}`));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${config.apiKey}`,
      'X-Request-ID': this.generateRequestId()
    });

    return this.http.get<{
      availableSlots: Array<{
        date: string;
        timeSlots: string[];
        currentCapacity: number;
        maxCapacity: number;
      }>;
      nextAvailableDate: string;
      estimatedWaitTime: string;
    }>(
      `${config.baseUrl}/availability?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      { headers }
    ).pipe(
      timeout(config.timeout),
      retry(config.retryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * Mock implementation for development/testing
   */
  getMockVerificationResponse(payload: VerificationRequestPayload): Observable<VerificationResponse> {
    // Simulate API delay
    return of({
      requestId: `mock-${Date.now()}`,
      status: 'accepted' as const,
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
      totalCost: 175,
      breakdown: {
        authenticationFee: 150,
        shippingCosts: 0, // Will be calculated dynamically based on UPS rates
        insuranceCosts: 0,
        rushServiceFee: 0,
        additionalServices: 0
      },
      instructions: {
        packagingRequirements: [
          'Use original box if available',
          'Wrap watch in soft cloth',
          'Include all papers and accessories',
          'Use bubble wrap for protection'
        ],
        specialInstructions: [
          'Do not include watch winder',
          'Remove any personal items',
          'Include detailed description of issues'
        ],
        contactInformation: {
          name: 'Authentication Team',
          phone: '1-800-AUTH-123',
          email: 'auth@partner.com',
          address: '123 Authentication St, City, State 12345'
        }
      },
      nextSteps: [
        'Print shipping label',
        'Package watch securely',
        'Drop off at UPS location',
        'Track package status'
      ]
    }).pipe(
      timeout(2000) // Simulate 2 second delay
    );
  }

  /**
   * Mock status response for development/testing
   */
  getMockStatusResponse(requestId: string): Observable<VerificationStatusResponse> {
    return of({
      requestId,
      status: 'in_progress' as const,
      currentStage: 'Physical Examination',
      progress: 65,
      estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
      currentLocation: 'Authentication Lab',
      inspectorNotes: 'Watch received in excellent condition. Currently examining movement authenticity.',
      photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
    }).pipe(
      timeout(1500)
    );
  }

  /**
   * Mock result response for development/testing
   */
  getMockResultResponse(requestId: string): Observable<VerificationResultResponse> {
    return of({
      requestId,
      status: 'completed' as const,
      result: {
        isAuthentic: true,
        confidence: 98,
        authenticityScore: 98,
        conditionScore: 92,
        marketValue: 8500,
        certificateUrl: 'https://example.com/certificate.pdf',
        detailedReport: 'This is a genuine Rolex Submariner with authentic movement and case. Minor wear consistent with age.',
        inspectorNotes: 'Excellent condition for age. All components authentic. Minor surface wear on bracelet.',
        qualityAssessment: {
          movement: 'Excellent',
          case: 'Very Good',
          dial: 'Excellent',
          bracelet: 'Good',
          overall: 'Very Good'
        },
        recommendations: [
          'Consider professional cleaning',
          'Bracelet could benefit from refinishing',
          'Excellent investment piece'
        ],
        completedAt: new Date().toISOString()
      },
      shipping: {
        returnTrackingNumber: '1Z999AA1234567890',
        estimatedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        returnLabel: 'https://example.com/return-label.pdf'
      }
    }).pipe(
      timeout(1500)
    );
  }

  /**
   * Check if a partner is available for real API calls
   */
  isPartnerApiEnabled(partnerId: string): boolean {
    const config = this.PARTNER_CONFIGS[partnerId];
    return config && config.apiKey !== `YOUR_${partnerId.toUpperCase()}_API_KEY`;
  }

  /**
   * Get list of enabled partners
   */
  getEnabledPartners(): string[] {
    return Object.keys(this.PARTNER_CONFIGS).filter(partnerId => 
      this.isPartnerApiEnabled(partnerId)
    );
  }

  /**
   * Update partner configuration (for admin use)
   */
  updatePartnerConfig(
    partnerId: string,
    config: Partial<VerificationApiConfig>
  ): void {
    if (this.PARTNER_CONFIGS[partnerId]) {
      this.PARTNER_CONFIGS[partnerId] = { ...this.PARTNER_CONFIGS[partnerId], ...config };
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred during verification';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Authentication failed - check API key';
          break;
        case 403:
          errorMessage = 'Access denied - insufficient permissions';
          break;
        case 404:
          errorMessage = 'Verification request not found';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded - try again later';
          break;
        case 500:
          errorMessage = 'Server error - try again later';
          break;
        default:
          errorMessage = `Server error: ${error.status} - ${error.message}`;
      }
    }

    console.error('Verification API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
