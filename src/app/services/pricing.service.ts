import { Injectable } from '@angular/core';
import { PricingBreakdown, VerificationPartner } from '../models/bid.interface';
import { InsuranceService } from './insurance.service';

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  
  constructor(private insuranceService: InsuranceService) {}
  private verificationPartners: VerificationPartner[] = [
    {
      id: 'watchcsa',
      name: 'WatchCSA',
      cost: 150,
      turnaroundTime: '3-5 business days',
      description: 'Professional watch authentication and certification service'
    },
    {
      id: 'swiss-watch-group',
      name: 'Swiss Watch Group',
      cost: 200,
      turnaroundTime: '5-7 business days',
      description: 'Expert authentication for luxury Swiss timepieces'
    },
    {
      id: 'luxury-watch-specialists',
      name: 'Luxury Watch Specialists',
      cost: 175,
      turnaroundTime: '4-6 business days',
      description: 'Specialized authentication for high-end luxury watches'
    },
    {
      id: 'gia',
      name: 'GIA (Gemological Institute)',
      cost: 250,
      turnaroundTime: '7-10 business days',
      description: 'Diamond-set watch authentication and certification'
    }
  ];

  // Commission tiers based on transaction value
  private readonly COMMISSION_TIERS = [
    { min: 0, max: 5000, percentage: 0.15, description: 'Standard (15%)' },
    { min: 5000, max: 15000, percentage: 0.10, description: 'Premium (10%)' },
    { min: 15000, max: Infinity, percentage: 0.05, description: 'Luxury (5%)' }
  ];

  getVerificationPartners(): VerificationPartner[] {
    return this.verificationPartners;
  }

  /**
   * Calculate commission fee based on tiered structure
   * 0-5000: 15%
   * 5000-15000: 10%
   * 15000+: 5%
   */
  calculateCommissionFee(itemPrice: number): { amount: number; percentage: number; tier: string } {
    const tier = this.COMMISSION_TIERS.find(t => itemPrice >= t.min && itemPrice < t.max);
    
    if (!tier) {
      // Fallback to highest tier for edge cases
      const highestTier = this.COMMISSION_TIERS[this.COMMISSION_TIERS.length - 1];
      return {
        amount: itemPrice * highestTier.percentage,
        percentage: highestTier.percentage,
        tier: highestTier.description
      };
    }

    return {
      amount: itemPrice * tier.percentage,
      percentage: tier.percentage,
      tier: tier.description
    };
  }

  /**
   * Get commission tier information for display
   */
  getCommissionTiers(): Array<{ min: number; max: string | number; percentage: number; description: string }> {
    return this.COMMISSION_TIERS.map(tier => ({
      min: tier.min,
      max: tier.max === Infinity ? '∞' : tier.max,
      percentage: tier.percentage,
      description: tier.description
    }));
  }

  calculatePricing(itemPrice: number, selectedPartnerId: string): PricingBreakdown {
    const partner = this.verificationPartners.find(p => p.id === selectedPartnerId);
    const verificationCost = partner ? partner.cost : 150;
    const shippingCost = 25; // Fixed shipping cost
    
    // Use new tiered commission calculation
    const commissionInfo = this.calculateCommissionFee(itemPrice);
    const commissionFee = commissionInfo.amount;
    
    const insuranceCost = this.insuranceService.calculateInsuranceCost(itemPrice);
    const totalAmount = itemPrice + shippingCost + verificationCost + commissionFee + insuranceCost;

    return {
      itemPrice,
      shippingCost,
      verificationCost,
      commissionFee,
      insuranceCost,
      totalAmount
    };
  }

  /**
   * Calculate seller payout after all fees
   */
  calculateSellerPayout(itemPrice: number, selectedPartnerId: string): {
    itemPrice: number;
    commissionFee: number;
    verificationCost: number;
    insuranceCost: number;
    sellerPayout: number;
    commissionTier: string;
  } {
    const pricing = this.calculatePricing(itemPrice, selectedPartnerId);
    const commissionInfo = this.calculateCommissionFee(itemPrice);
    
    // Seller pays verification cost, buyer pays commission and insurance
    const sellerPayout = itemPrice - pricing.verificationCost;

    return {
      itemPrice: pricing.itemPrice,
      commissionFee: pricing.commissionFee,
      verificationCost: pricing.verificationCost,
      insuranceCost: pricing.insuranceCost,
      sellerPayout,
      commissionTier: commissionInfo.tier
    };
  }
} 