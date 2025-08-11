import { Injectable } from '@angular/core';
import { User } from '../models/bid.interface';

export interface VerificationProvider {
  id: string;
  name: string;
  description: string;
  cost: number;
  turnaroundTime: string;
  features: string[];
  apiEndpoint?: string;
  supportedCountries: string[];
  verificationMethods: string[];
}

export interface VerificationRequest {
  userId: string;
  providerId: string;
  governmentIdUrl: string;
  userData: {
    name: string;
    email: string;
    dateOfBirth?: string;
  };
  status: 'pending' | 'processing' | 'verified' | 'failed' | 'expired';
  requestDate: Date;
  completedDate?: Date;
  verificationId?: string;
  failureReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  private readonly VERIFICATION_PROVIDERS_KEY = 'watch_ios_verification_providers';
  private readonly VERIFICATION_REQUESTS_KEY = 'watch_ios_verification_requests';

  constructor() { }

  /**
   * Get all available verification providers
   */
  getVerificationProviders(): VerificationProvider[] {
    const data = localStorage.getItem(this.VERIFICATION_PROVIDERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default providers
    const providers: VerificationProvider[] = [
      {
        id: 'jumio',
        name: 'Jumio',
        description: 'Industry-leading identity verification with AI-powered document analysis',
        cost: 2.50,
        turnaroundTime: '2-5 minutes',
        features: [
          'Real-time verification',
          'AI-powered document analysis',
          'Liveness detection',
          'Global coverage',
          'Compliance with KYC/AML regulations'
        ],
        supportedCountries: ['US', 'CA', 'UK', 'EU', 'AU', 'JP', 'SG'],
        verificationMethods: ['Document verification', 'Face comparison', 'Liveness check']
      },
      {
        id: 'onfido',
        name: 'Onfido',
        description: 'Trusted by major financial institutions and marketplaces',
        cost: 3.00,
        turnaroundTime: '5-10 minutes',
        features: [
          'Document and biometric verification',
          'Fraud detection',
          'Regulatory compliance',
          'Multi-language support',
          'Advanced analytics'
        ],
        supportedCountries: ['US', 'CA', 'UK', 'EU', 'AU', 'BR', 'MX'],
        verificationMethods: ['Document verification', 'Face verification', 'Address verification']
      },
      {
        id: 'veriff',
        name: 'Veriff',
        description: 'Real-time identity verification with instant results',
        cost: 2.75,
        turnaroundTime: '30 seconds - 2 minutes',
        features: [
          'Instant verification',
          'Real-time fraud detection',
          'Multi-document support',
          'Mobile-first approach',
          '99.9% accuracy rate'
        ],
        supportedCountries: ['US', 'CA', 'UK', 'EU', 'AU', 'NZ'],
        verificationMethods: ['Document verification', 'Face verification', 'Liveness detection']
      },
      {
        id: 'idme',
        name: 'ID.me',
        description: 'Government-verified identity with military and veteran verification',
        cost: 1.50,
        turnaroundTime: '24-48 hours',
        features: [
          'Government-verified identity',
          'Military and veteran verification',
          'Secure identity network',
          'Compliance with federal standards',
          'Multi-factor authentication'
        ],
        supportedCountries: ['US'],
        verificationMethods: ['Government ID verification', 'Military verification', 'Address verification']
      },
      {
        id: 'socure',
        name: 'Socure',
        description: 'AI-powered identity verification with fraud prevention',
        cost: 2.25,
        turnaroundTime: '1-3 minutes',
        features: [
          'AI-powered verification',
          'Fraud prevention',
          'Risk scoring',
          'Real-time processing',
          'Machine learning algorithms'
        ],
        supportedCountries: ['US', 'CA', 'UK', 'EU'],
        verificationMethods: ['Document verification', 'Biometric verification', 'Risk assessment']
      }
    ];
    
    this.saveVerificationProviders(providers);
    return providers;
  }

  /**
   * Get verification provider by ID
   */
  getProviderById(providerId: string): VerificationProvider | undefined {
    const providers = this.getVerificationProviders();
    return providers.find(p => p.id === providerId);
  }

  /**
   * Submit verification request
   */
  submitVerificationRequest(request: Omit<VerificationRequest, 'status' | 'requestDate'>): VerificationRequest {
    const requests = this.getVerificationRequests();
    
    const newRequest: VerificationRequest = {
      ...request,
      status: 'pending',
      requestDate: new Date()
    };
    
    requests.push(newRequest);
    this.saveVerificationRequests(requests);
    
    // Simulate verification process
    this.simulateVerificationProcess(newRequest);
    
    return newRequest;
  }

  /**
   * Get verification requests for a user
   */
  getUserVerificationRequests(userId: string): VerificationRequest[] {
    const requests = this.getVerificationRequests();
    return requests.filter(r => r.userId === userId);
  }

  /**
   * Get verification request by ID
   */
  getVerificationRequest(requestId: string): VerificationRequest | undefined {
    const requests = this.getVerificationRequests();
    return requests.find(r => r.verificationId === requestId);
  }

  /**
   * Update verification request status
   */
  updateVerificationStatus(requestId: string, status: VerificationRequest['status'], failureReason?: string): void {
    const requests = this.getVerificationRequests();
    const request = requests.find(r => r.verificationId === requestId);
    
    if (request) {
      request.status = status;
      if (status === 'verified' || status === 'failed') {
        request.completedDate = new Date();
      }
      if (failureReason) {
        request.failureReason = failureReason;
      }
      
      this.saveVerificationRequests(requests);
    }
  }

  /**
   * Simulate verification process (in real app, this would call external APIs)
   */
  private simulateVerificationProcess(request: VerificationRequest): void {
    setTimeout(() => {
      // Simulate processing
      this.updateVerificationStatus(request.verificationId!, 'processing');
      
      setTimeout(() => {
        // Simulate completion (90% success rate)
        const isSuccess = Math.random() > 0.1;
        const status = isSuccess ? 'verified' : 'failed';
        const failureReason = isSuccess ? undefined : 'Document quality insufficient for verification';
        
        this.updateVerificationStatus(request.verificationId!, status, failureReason);
      }, 3000 + Math.random() * 2000); // 3-5 seconds
    }, 1000 + Math.random() * 2000); // 1-3 seconds
  }

  /**
   * Get verification statistics
   */
  getVerificationStats(): {
    totalRequests: number;
    pendingRequests: number;
    verifiedRequests: number;
    failedRequests: number;
    averageProcessingTime: number;
  } {
    const requests = this.getVerificationRequests();
    const completedRequests = requests.filter(r => r.status === 'verified' || r.status === 'failed');
    
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;
    const verifiedRequests = requests.filter(r => r.status === 'verified').length;
    const failedRequests = requests.filter(r => r.status === 'failed').length;
    
    const averageProcessingTime = completedRequests.length > 0 
      ? completedRequests.reduce((sum, req) => {
          if (req.completedDate && req.requestDate) {
            return sum + (req.completedDate.getTime() - req.requestDate.getTime());
          }
          return sum;
        }, 0) / completedRequests.length / 1000 // Convert to seconds
      : 0;
    
    return {
      totalRequests,
      pendingRequests,
      verifiedRequests,
      failedRequests,
      averageProcessingTime
    };
  }

  /**
   * Get recommended provider based on user location and requirements
   */
  getRecommendedProvider(userCountry = 'US'): VerificationProvider {
    const providers = this.getVerificationProviders();
    
    // Filter by country support
    const supportedProviders = providers.filter(p => 
      p.supportedCountries.includes(userCountry) || p.supportedCountries.includes('US')
    );
    
    if (supportedProviders.length === 0) {
      return providers[0]; // Fallback to first provider
    }
    
    // Return the most cost-effective provider for the user's country
    return supportedProviders.reduce((best, current) => 
      current.cost < best.cost ? current : best
    );
  }

  // Private helper methods
  private getVerificationRequests(): VerificationRequest[] {
    const data = localStorage.getItem(this.VERIFICATION_REQUESTS_KEY);
    if (!data) return [];
    
    const requests = JSON.parse(data);
    return requests.map((req: any) => ({
      ...req,
      requestDate: new Date(req.requestDate),
      completedDate: req.completedDate ? new Date(req.completedDate) : undefined
    }));
  }

  private saveVerificationProviders(providers: VerificationProvider[]): void {
    try {
      localStorage.setItem(this.VERIFICATION_PROVIDERS_KEY, JSON.stringify(providers));
    } catch (error) {
      console.error('Failed to save verification providers:', error);
    }
  }

  private saveVerificationRequests(requests: VerificationRequest[]): void {
    try {
      localStorage.setItem(this.VERIFICATION_REQUESTS_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to save verification requests:', error);
    }
  }

  // Legacy method for backward compatibility
  getVerificationInfo(): string {
    return `
      **Third-Party Verification Services**
      
      ID verification is required when your offer is accepted by a seller. We partner with industry-leading verification providers to ensure the highest level of trust and security:
      
      • **Jumio** - AI-powered document analysis and liveness detection
      • **Onfido** - Trusted by major financial institutions
      • **Veriff** - Real-time verification with instant results
      • **ID.me** - Government-verified identity
      • **Socure** - AI-powered fraud prevention
      
      **Verification Process (When Offer Accepted):**
      1. Upload government-issued ID (driver's license, passport, state ID)
      2. Complete liveness detection (photo/video verification)
      3. Real-time processing and fraud detection
      4. Verification results within 2-5 minutes
      
      **Security & Compliance:**
      • All verification data is encrypted and secure
      • Compliance with KYC/AML regulations
      • 99.9% accuracy rate
      • Global coverage for international users
      
      **Cost:** $1.50 - $3.00 per verification (varies by provider)
      **Processing Time:** 30 seconds to 48 hours (depending on provider)
      
      **When Verification Happens:**
      • Only when your offer is accepted by a seller
      • Required before funds are released to seller
      • Ensures trust and safety in our luxury watch marketplace
    `;
  }
}