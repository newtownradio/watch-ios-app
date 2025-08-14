import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UpsShippingService } from '../../services/ups-shipping.service';
import { VerificationApiService } from '../../services/verification-api.service';
import { Bid, Listing, User } from '../../models/bid.interface';

// Define missing interfaces
interface ShippingAddress {
  name: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface PackageDetails {
  weight: number;
  length: number;
  width: number;
  height: number;
  declaredValue: number;
  insuranceAmount: number;
}

interface Order {
  id: string;
  bidId: string;
  sellerId: string;
  buyerId: string;
  watchId: string;
  amount: number;
  status: string;
  createdAt: string;
  shippingAddress: ShippingAddress;
  packageDetails: PackageDetails;
  shippingCost: number;
  verificationPartnerId: string;
  rushService: boolean;
  totalCost: number;
  commission: number;
  sellerNotes: string;
}

@Component({
  selector: 'app-bid-acceptance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-acceptance.component.html',
  styleUrl: './bid-acceptance.component.scss'
})
export class BidAcceptanceComponent {
  private router = inject(Router);
  private upsService = inject(UpsShippingService);
  private verificationService = inject(VerificationApiService);

  @Input() bid!: Bid;
  @Output() bidAccepted = new EventEmitter<Order>();
  @Output() bidRejected = new EventEmitter<string>();

  currentStep = 1;
  totalSteps = 4;
  isSubmitting = false;

  // Step 1: Bid Review
  isBidAccepted = false;
  sellerNotes = '';

  // Step 2: Shipping Setup
  shippingAddress: ShippingAddress = {
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: ''
  };

  packageDetails: PackageDetails = {
    weight: 0.5,
    length: 6,
    width: 4,
    height: 2,
    declaredValue: 0,
    insuranceAmount: 0
  };

  shippingRates: any[] = [];
  selectedShippingRate: any = null;
  shippingCost = 0;

  // Step 3: Verification Setup
  verificationPartnerId = '';
  verificationPartners: any[] = [];
  rushService = false;
  additionalServices: string[] = [];

  // Step 4: Review & Confirm
  totalCost = 0;
  breakdown = {
    bidAmount: 0,
    shippingCost: 0,
    verificationFee: 0,
    rushFee: 0,
    additionalServices: 0,
    commission: 0
  };

  ngOnInit() {
    this.initializeData();
    this.loadVerificationPartners();
  }

  private initializeData() {
    if (this.bid) {
      this.packageDetails.declaredValue = this.bid.amount;
      this.packageDetails.insuranceAmount = this.bid.amount;
      this.breakdown.bidAmount = this.bid.amount;
      this.calculateCommission();
    }
  }

  private async loadVerificationPartners() {
    // Load available verification partners
    this.verificationPartners = [
      { id: '1', name: 'Professional Watch Authentication', fee: 150, specialty: 'Luxury Watches' },
      { id: '2', name: 'Certified Timepiece Experts', fee: 200, specialty: 'Vintage & Rare' },
      { id: '3', name: 'Luxury Watch Verification', fee: 250, specialty: 'High-End Collectibles' }
    ];
  }

  private calculateCommission() {
    const amount = this.bid.amount;
    if (amount <= 5000) {
      this.breakdown.commission = amount * 0.15; // 15%
    } else if (amount <= 15000) {
      this.breakdown.commission = amount * 0.10; // 10%
    } else {
      this.breakdown.commission = amount * 0.05; // 5%
    }
  }

  async calculateShippingCosts() {
    if (!this.upsService.isConfigured()) {
      // Fallback calculation
      this.shippingCost = 25;
      this.breakdown.shippingCost = this.shippingCost;
      return;
    }

    try {
      const rates = await this.upsService.getShippingRates(
        this.shippingAddress,
        this.shippingAddress,
        this.packageDetails
      ).toPromise();

      if (rates && rates.length > 0) {
        this.shippingRates = rates;
        this.selectedShippingRate = rates[0];
        this.shippingCost = rates[0].totalCharges;
        this.breakdown.shippingCost = this.shippingCost;
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      this.shippingCost = 25; // Fallback
      this.breakdown.shippingCost = this.shippingCost;
    }
  }

  nextStep() {
    if (this.canProceedToNextStep()) {
      this.currentStep++;
      this.updateTotalCost();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.isBidAccepted;
      case 2:
        return this.isShippingAddressValid() && this.shippingCost > 0;
      case 3:
        return this.verificationPartnerId !== '';
      default:
        return true;
    }
  }

  isShippingAddressValid(): boolean {
    return !!(
      this.shippingAddress.name &&
      this.shippingAddress.address1 &&
      this.shippingAddress.city &&
      this.shippingAddress.state &&
      this.shippingAddress.postalCode
    );
  }

  updateTotalCost() {
    this.totalCost = 
      this.breakdown.bidAmount +
      this.breakdown.shippingCost +
      this.breakdown.verificationFee +
      this.breakdown.rushFee +
      this.breakdown.additionalServices;
  }

  onVerificationPartnerChange() {
    const partner = this.verificationPartners.find(p => p.id === this.verificationPartnerId);
    if (partner) {
      this.breakdown.verificationFee = partner.fee;
      this.updateTotalCost();
    }
  }

  onRushServiceChange() {
    this.breakdown.rushFee = this.rushService ? 50 : 0;
    this.updateTotalCost();
  }

  async submitBidAcceptance() {
    if (!this.canProceedToNextStep()) return;

    this.isSubmitting = true;

    try {
      // Create the order
      const order: Order = {
        id: this.generateOrderId(),
        bidId: this.bid.id,
        sellerId: this.bid.bidderId, // Using bidderId as sellerId for now
        buyerId: this.bid.bidderId,
        watchId: this.bid.itemId,
        amount: this.bid.amount,
        status: 'pending_verification',
        createdAt: new Date().toISOString(),
        shippingAddress: this.shippingAddress,
        packageDetails: this.packageDetails,
        shippingCost: this.shippingCost,
        verificationPartnerId: this.verificationPartnerId,
        rushService: this.rushService,
        totalCost: this.totalCost,
        commission: this.breakdown.commission,
        sellerNotes: this.sellerNotes
      };

      // Emit the accepted bid
      this.bidAccepted.emit(order);

      // Navigate to orders page
      this.router.navigate(['/orders']);

    } catch (error) {
      console.error('Error accepting bid:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  rejectBid() {
    this.bidRejected.emit(this.bid.id);
  }

  private generateOrderId(): string {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  getStepStatus(step: number): string {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'current';
    return 'pending';
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
