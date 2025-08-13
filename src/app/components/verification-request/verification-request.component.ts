import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VerificationApiService, VerificationRequestPayload } from '../../services/verification-api.service';
import { UpsShippingService, ShippingAddress, PackageDetails } from '../../services/ups-shipping.service';
import { AuthenticationPartner } from '../../models/authentication-partner.interface';

export interface VerificationFormData {
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

@Component({
  selector: 'app-verification-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verification-request.component.html',
  styleUrls: ['./verification-request.component.scss']
})
export class VerificationRequestComponent implements OnInit {
  @Input() watchDetails?: {
    brand: string;
    model: string;
    serialNumber?: string;
    year?: number;
    condition: string;
    estimatedValue: number;
    description: string;
  };

  @Input() sellerInfo?: {
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

  @Output() verificationSubmitted = new EventEmitter<{
    requestId: string;
    totalCost: number;
    estimatedCompletion: string;
  }>();

  @Output() verificationCancelled = new EventEmitter<void>();

  private verificationService = inject(VerificationApiService);
  private upsService = inject(UpsShippingService);

  // Form data
  formData: VerificationFormData = {
    partnerId: '',
    watchDetails: {
      brand: '',
      model: '',
      serialNumber: '',
      year: undefined,
      condition: '',
      estimatedValue: 0,
      photos: [],
      description: ''
    },
    sellerInfo: {
      userId: '',
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    },
    shippingDetails: {
      fromAddress: {
        name: '',
        company: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        phone: '',
        email: ''
      },
      toAddress: {
        name: 'Authentication Partner',
        company: 'Watch Authentication Service',
        street: '123 Authentication St',
        city: 'Authentication City',
        state: 'AS',
        zipCode: '12345',
        country: 'US',
        phone: '1-800-AUTH-123',
        email: 'auth@partner.com'
      },
      packageDetails: {
        weight: 0.5, // Default weight in lbs
        dimensions: {
          length: 6,
          width: 4,
          height: 3
        },
        declaredValue: 0,
        insuranceRequired: false
      }
    },
    authenticationOptions: {
      includeConditionReport: true,
      includeMarketValuation: false,
      includeInvestmentGrade: false,
      rushService: false
    }
  };

  // Available authentication partners
  authenticationPartners: AuthenticationPartner[] = [];

  // Form states
  currentStep = 1;
  totalSteps = 4;
  isSubmitting = false;
  shippingCosts = 0;
  totalCost = 0;

  ngOnInit() {
    // Initialize form with input data if provided
    if (this.watchDetails) {
      this.formData.watchDetails = { ...this.watchDetails, photos: [] };
    }
    if (this.sellerInfo) {
      this.formData.sellerInfo = { ...this.sellerInfo };
      this.formData.shippingDetails.fromAddress = {
        name: this.sellerInfo.name,
        company: '',
        street: this.sellerInfo.address.street,
        city: this.sellerInfo.address.city,
        state: this.sellerInfo.address.state,
        zipCode: this.sellerInfo.address.zipCode,
        country: this.sellerInfo.address.country,
        phone: this.sellerInfo.phone,
        email: this.sellerInfo.email
      };
    }

    // Set declared value for shipping
    this.formData.shippingDetails.packageDetails.declaredValue = this.formData.watchDetails.estimatedValue;

    // Load authentication partners
    this.loadAuthenticationPartners();
  }

  private loadAuthenticationPartners() {
    // This would typically come from a service
    this.authenticationPartners = [
      {
        id: 'watchbox',
        name: 'WatchBox Authentication',
        description: 'Industry-leading authentication service',
        specialty: 'All luxury watches',
        baseFee: 150,
        estimatedTime: '3-5 business days',
        coverage: ['All brands'],
        features: ['Full authenticity verification', 'Condition assessment'],
        supportedCountries: ['US', 'CA', 'UK', 'EU'],
        verificationMethods: ['Physical examination', 'Documentation review'],
        isActive: true,
        rating: 4.8,
        totalVerifications: 15000,
        successRate: 98.5
      },
      {
        id: 'swiss-watch-group',
        name: 'Swiss Watch Group',
        description: 'Swiss-based authentication expertise',
        specialty: 'Swiss luxury watches',
        baseFee: 120,
        estimatedTime: '4-6 business days',
        coverage: ['Rolex', 'Omega', 'Patek Philippe'],
        features: ['Swiss expertise', 'European market knowledge'],
        supportedCountries: ['US', 'CA', 'UK', 'EU', 'CH'],
        verificationMethods: ['Physical examination', 'Documentation review'],
        isActive: true,
        rating: 4.9,
        totalVerifications: 8500,
        successRate: 99.2
      }
    ];
  }

  // Navigation methods
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      if (this.currentStep === 3) {
        this.calculateShippingCosts();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Shipping cost calculation
  async calculateShippingCosts() {
    try {
      const fromAddress: ShippingAddress = {
        name: this.formData.shippingDetails.fromAddress.name,
        company: this.formData.shippingDetails.fromAddress.company,
        address1: this.formData.shippingDetails.fromAddress.street,
        city: this.formData.shippingDetails.fromAddress.city,
        state: this.formData.shippingDetails.fromAddress.state,
        postalCode: this.formData.shippingDetails.fromAddress.zipCode,
        country: this.formData.shippingDetails.fromAddress.country,
        phone: this.formData.shippingDetails.fromAddress.phone,
        email: this.formData.shippingDetails.fromAddress.email
      };

      const toAddress: ShippingAddress = {
        name: this.formData.shippingDetails.toAddress.name,
        company: this.formData.shippingDetails.toAddress.company,
        address1: this.formData.shippingDetails.toAddress.street,
        city: this.formData.shippingDetails.toAddress.city,
        state: this.formData.shippingDetails.toAddress.state,
        postalCode: this.formData.shippingDetails.toAddress.zipCode,
        country: this.formData.shippingDetails.toAddress.country,
        phone: this.formData.shippingDetails.toAddress.phone,
        email: this.formData.shippingDetails.toAddress.email
      };

      const packageDetails: PackageDetails = {
        weight: this.formData.shippingDetails.packageDetails.weight,
        length: this.formData.shippingDetails.packageDetails.dimensions.length,
        width: this.formData.shippingDetails.packageDetails.dimensions.width,
        height: this.formData.shippingDetails.packageDetails.dimensions.height,
        declaredValue: this.formData.shippingDetails.packageDetails.declaredValue
      };

      const rates = await this.upsService.getShippingRates(fromAddress, toAddress, packageDetails).toPromise();
      
      if (rates && rates.length > 0) {
        // Use the cheapest rate
        const cheapestRate = rates.reduce((min, rate) => 
          rate.totalCharges < min.totalCharges ? rate : min, rates[0]);
        this.shippingCosts = cheapestRate.totalCharges;
      } else {
        // Fallback to estimated cost
        this.shippingCosts = this.estimateShippingCost();
      }

      this.calculateTotalCost();
    } catch (error) {
      console.error('Error calculating shipping costs:', error);
      this.shippingCosts = this.estimateShippingCost();
      this.calculateTotalCost();
    }
  }

  private estimateShippingCost(): number {
    const baseCost = 15;
    const weightMultiplier = this.formData.shippingDetails.packageDetails.weight * 1.5;
    const distanceMultiplier = 1.5; // Simplified
    return Math.round((baseCost + weightMultiplier) * distanceMultiplier * 100) / 100;
  }

  private calculateTotalCost() {
    const partner = this.authenticationPartners.find(p => p.id === this.formData.partnerId);
    const authenticationFee = partner?.baseFee || 150;
    
    // Add rush service fee if selected
    const rushFee = this.formData.authenticationOptions.rushService ? 50 : 0;
    
    this.totalCost = authenticationFee + this.shippingCosts + rushFee;
  }

  // Form submission
  async submitVerification() {
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const response = await this.verificationService.getMockVerificationResponse(this.formData).toPromise();
      
      if (response) {
        this.verificationSubmitted.emit({
          requestId: response.requestId,
          totalCost: response.totalCost,
          estimatedCompletion: response.estimatedCompletion
        });
      }
    } catch (error) {
      console.error('Error submitting verification request:', error);
      // Handle error (show user message)
    } finally {
      this.isSubmitting = false;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.partnerId &&
      this.formData.watchDetails.brand &&
      this.formData.watchDetails.model &&
      this.formData.watchDetails.condition &&
      this.formData.watchDetails.estimatedValue > 0 &&
      this.formData.shippingDetails.fromAddress.street &&
      this.formData.shippingDetails.fromAddress.city &&
      this.formData.shippingDetails.fromAddress.state &&
      this.formData.shippingDetails.fromAddress.zipCode
    );
  }

  cancel() {
    this.verificationCancelled.emit();
  }

  // Helper methods for step validation
  canProceedToStep(step: number): boolean {
    switch (step) {
      case 2:
        return !!(this.formData.partnerId && this.formData.watchDetails.brand && this.formData.watchDetails.model);
      case 3:
        return !!(this.formData.shippingDetails.fromAddress.street && this.formData.shippingDetails.fromAddress.city);
      case 4:
        return this.isFormValid();
      default:
        return true;
    }
  }

  getStepStatus(step: number): 'completed' | 'current' | 'pending' {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'current';
    return 'pending';
  }

  // Helper methods for template
  getSelectedPartnerName(): string {
    const partner = this.authenticationPartners.find(p => p.id === this.formData.partnerId);
    return partner?.name || 'Not selected';
  }

  getSelectedPartnerFee(): number {
    const partner = this.authenticationPartners.find(p => p.id === this.formData.partnerId);
    return partner?.baseFee || 150;
  }
}
