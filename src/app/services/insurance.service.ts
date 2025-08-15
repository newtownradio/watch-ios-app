import { Injectable } from '@angular/core';

export interface InsuranceProvider {
  id: string;
  name: string;
  type: 'primary' | 'shipping' | 'specialized';
  maxCoverage: number;
  deductible: number;
  rate: number; // Percentage of item value
  coverageTypes: string[];
  apiEndpoint?: string;
  apiKey?: string;
  features: string[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface InsuranceQuote {
  providerId: string;
  providerName: string;
  itemValue: number;
  coverageAmount: number;
  premium: number;
  deductible: number;
  coverageType: string;
  policyNumber?: string;
  effectiveDate: Date;
  expiryDate: Date;
  terms: string[];
  exclusions: string[];
}

export interface InsuranceClaim {
  id: string;
  policyNumber: string;
  itemDescription: string;
  itemValue: number;
  claimAmount: number;
  incidentDate: Date;
  incidentDescription: string;
  status: 'pending' | 'approved' | 'denied' | 'paid';
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  
  private readonly INSURANCE_PROVIDERS: InsuranceProvider[] = [
    {
      id: 'chubb-ace',
      name: 'Chubb (Ace USA)',
      type: 'primary',
      maxCoverage: 1000000,
      deductible: 100,
      rate: 0.02, // 2% of item value
      coverageTypes: ['all_risks', 'theft', 'damage', 'loss', 'mysterious_disappearance'],
      features: [
        'Worldwide coverage',
        '24/7 claims support',
        'Fast claims processing',
        'No appraisal required under $50k',
        'Replacement value coverage'
      ],
      contactInfo: {
        phone: '1-800-352-2762',
        email: 'claims@chubb.com',
        website: 'https://www.chubb.com/us-en/'
      }
    },
    {
      id: 'jewelers-mutual',
      name: 'Jewelers Mutual',
      type: 'specialized',
      maxCoverage: 50000,
      deductible: 0,
      rate: 0.025, // 2.5% of item value
      coverageTypes: ['all_risks', 'theft', 'damage', 'loss'],
      features: [
        'Specialized jewelry coverage',
        'No deductible',
        'Jewelry claims experts',
        'Appraisal services included',
        'Replacement value coverage'
      ],
      contactInfo: {
        phone: '1-800-558-6411',
        email: 'claims@jminsure.com',
        website: 'https://www.jewelersmutual.com/'
      }
    },
    {
      id: 'fedex-insurance',
      name: 'FedEx Insurance',
      type: 'shipping',
      maxCoverage: 100000,
      deductible: 0,
      rate: 0.01, // 1% of declared value
      coverageTypes: ['damage', 'loss', 'theft'],
      features: [
        'Included with shipping',
        'No additional paperwork',
        'Claims through FedEx',
        'Coverage during transit only'
      ],
      contactInfo: {
        phone: '1-800-463-3339',
        email: 'claims@fedex.com',
        website: 'https://www.fedex.com/'
      }
    },
    {
      id: 'ups-insurance',
      name: 'UPS Insurance',
      type: 'shipping',
      maxCoverage: 50000,
      deductible: 0,
      rate: 0.015, // 1.5% of declared value
      coverageTypes: ['damage', 'loss', 'theft'],
      features: [
        'Included with shipping',
        'Claims through UPS',
        'Coverage during transit only',
        'Declared value protection'
      ],
      contactInfo: {
        phone: '1-800-742-5877',
        email: 'claims@ups.com',
        website: 'https://www.ups.com/'
      }
    }
  ];

  constructor() {}

  /**
   * Get all available insurance providers
   */
  getInsuranceProviders(): InsuranceProvider[] {
    return this.INSURANCE_PROVIDERS;
  }

  /**
   * Get insurance providers by type
   */
  getProvidersByType(type: 'primary' | 'shipping' | 'specialized'): InsuranceProvider[] {
    return this.INSURANCE_PROVIDERS.filter(provider => provider.type === type);
  }

  /**
   * Get the best insurance provider for a given item value
   */
  getBestProvider(itemValue: number): InsuranceProvider {
    // For luxury watches, prioritize specialized providers
    if (itemValue > 25000) {
      const specialized = this.INSURANCE_PROVIDERS.find(p => p.type === 'specialized');
      if (specialized && itemValue <= specialized.maxCoverage) {
        return specialized;
      }
      
      const primary = this.INSURANCE_PROVIDERS.find(p => p.type === 'primary');
      if (primary && itemValue <= primary.maxCoverage) {
        return primary;
      }
    }

    // For standard items, use primary provider
    const primary = this.INSURANCE_PROVIDERS.find(p => p.type === 'primary');
    if (primary && itemValue <= primary.maxCoverage) {
      return primary;
    }

    // Fallback to shipping insurance
    return this.INSURANCE_PROVIDERS.find(p => p.type === 'shipping') || this.INSURANCE_PROVIDERS[0];
  }

  /**
   * Get insurance quote for an item
   */
  getInsuranceQuote(itemValue: number, providerId?: string): InsuranceQuote {
    const provider = providerId 
      ? this.INSURANCE_PROVIDERS.find(p => p.id === providerId)
      : this.getBestProvider(itemValue);

    if (!provider) {
      throw new Error('No suitable insurance provider found');
    }

    if (itemValue > provider.maxCoverage) {
      throw new Error(`Item value $${itemValue.toLocaleString()} exceeds maximum coverage of $${provider.maxCoverage.toLocaleString()}`);
    }

    const premium = itemValue * provider.rate;
    const effectiveDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    return {
      providerId: provider.id,
      providerName: provider.name,
      itemValue,
      coverageAmount: itemValue,
      premium,
      deductible: provider.deductible,
      coverageType: provider.coverageTypes[0],
      effectiveDate,
      expiryDate,
      terms: [
        'Coverage worldwide',
        'All risks coverage',
        'Replacement value',
        'No depreciation',
        '24/7 claims support'
      ],
      exclusions: [
        'Wear and tear',
        'Mechanical failure',
        'Intentional damage',
        'War and terrorism',
        'Nuclear incidents'
      ]
    };
  }

  /**
   * Get multiple insurance quotes for comparison
   */
  getMultipleQuotes(itemValue: number): InsuranceQuote[] {
    const quotes: InsuranceQuote[] = [];
    
    this.INSURANCE_PROVIDERS.forEach(provider => {
      if (itemValue <= provider.maxCoverage) {
        try {
          quotes.push(this.getInsuranceQuote(itemValue, provider.id));
        } catch (error) {
          // Skip providers that can't cover this value
        }
      }
    });

    // Sort by premium (lowest first)
    return quotes.sort((a, b) => a.premium - b.premium);
  }

  /**
   * Calculate insurance cost for pricing
   */
  calculateInsuranceCost(itemValue: number): number {
    const provider = this.getBestProvider(itemValue);
    return itemValue * provider.rate;
  }

  /**
   * Create insurance policy
   */
  createInsurancePolicy(quote: InsuranceQuote): { policyNumber: string; status: string } {
    // Generate unique policy number
    const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // In a real implementation, this would call the insurance provider's API
    // For now, we'll simulate the process
    
    // Store policy in localStorage for demo purposes
    const policies = JSON.parse(localStorage.getItem('watch_ios_insurance_policies') || '[]');
    policies.push({
      ...quote,
      policyNumber,
      status: 'active',
      createdAt: new Date()
    });
    localStorage.setItem('watch_ios_insurance_policies', JSON.stringify(policies));

    return {
      policyNumber,
      status: 'active'
    };
  }

  /**
   * File insurance claim
   */
  fileClaim(policyNumber: string, incidentDetails: {
    itemDescription: string;
    incidentDate: Date;
    incidentDescription: string;
    claimAmount: number;
    documents: string[];
  }): InsuranceClaim {
    const policies = JSON.parse(localStorage.getItem('watch_ios_insurance_policies') || '[]');
    const policy = policies.find((p: any) => p.policyNumber === policyNumber);
    
    if (!policy) {
      throw new Error('Insurance policy not found');
    }

    const claim: InsuranceClaim = {
      id: `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      policyNumber,
      itemDescription: incidentDetails.itemDescription,
      itemValue: policy.itemValue,
      claimAmount: incidentDetails.claimAmount,
      incidentDate: incidentDetails.incidentDate,
      incidentDescription: incidentDetails.incidentDescription,
      status: 'pending',
      documents: incidentDetails.documents,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store claim in localStorage
    const claims = JSON.parse(localStorage.getItem('watch_ios_insurance_claims') || '[]');
    claims.push(claim);
    localStorage.setItem('watch_ios_insurance_claims', JSON.stringify(claims));

    return claim;
  }

  /**
   * Get insurance policies for a user
   */
  getUserPolicies(userId: string): any[] {
    const policies = JSON.parse(localStorage.getItem('watch_ios_insurance_policies') || '[]');
    return policies.filter((p: any) => p.userId === userId);
  }

  /**
   * Get insurance claims for a user
   */
  getUserClaims(userId: string): InsuranceClaim[] {
    const claims = JSON.parse(localStorage.getItem('watch_ios_insurance_claims') || '[]');
    return claims.filter((c: any) => c.userId === userId);
  }

  /**
   * Get insurance statistics
   */
  getInsuranceStats(): {
    totalPolicies: number;
    totalClaims: number;
    totalCoverage: number;
    averagePremium: number;
  } {
    const policies = JSON.parse(localStorage.getItem('watch_ios_insurance_policies') || '[]');
    const claims = JSON.parse(localStorage.getItem('watch_ios_insurance_claims') || '[]');
    
    const totalCoverage = policies.reduce((sum: number, p: any) => sum + p.coverageAmount, 0);
    const totalPremiums = policies.reduce((sum: number, p: any) => sum + p.premium, 0);
    const averagePremium = policies.length > 0 ? totalPremiums / policies.length : 0;

    return {
      totalPolicies: policies.length,
      totalClaims: claims.length,
      totalCoverage,
      averagePremium
    };
  }
}
