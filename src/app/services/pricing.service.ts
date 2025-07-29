import { Injectable } from '@angular/core';
import { PricingBreakdown, VerificationPartner } from '../models/bid.interface';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  // Commission rate
  private readonly COMMISSION_RATE = 0.05; // 5%

  // Default costs
  private readonly DEFAULT_SHIPPING_COST = 25; // Two-way shipping
  private readonly DEFAULT_VERIFICATION_COST = 50; // WatchCSA standard
  private readonly DEFAULT_INSURANCE_RATE = 0.02; // 2% of item value

  // Verification partners
  private verificationPartners: VerificationPartner[] = [
    {
      id: 'watchcsa',
      name: 'WatchCSA',
      cost: 50,
      turnaroundTime: '2-3 business days',
      description: 'Industry standard authentication service'
    },
    {
      id: 'watchbox',
      name: 'WatchBox Authentication',
      cost: 45,
      turnaroundTime: '1-2 business days',
      description: 'Fast authentication with detailed report'
    },
    {
      id: 'crown-caliber',
      name: 'Crown & Caliber',
      cost: 55,
      turnaroundTime: '2-3 business days',
      description: 'Premium authentication with certification'
    }
  ];

  constructor() { }

  /**
   * Calculate complete pricing breakdown
   */
  calculatePricing(itemPrice: number, verificationPartnerId: string = 'watchcsa'): PricingBreakdown {
    const verificationPartner = this.verificationPartners.find(vp => vp.id === verificationPartnerId);
    const verificationCost = verificationPartner?.cost || this.DEFAULT_VERIFICATION_COST;
    
    const commissionFee = itemPrice * this.COMMISSION_RATE;
    const insuranceCost = itemPrice * this.DEFAULT_INSURANCE_RATE;
    const shippingCost = this.DEFAULT_SHIPPING_COST;
    
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
   * Get available verification partners
   */
  getVerificationPartners(): VerificationPartner[] {
    return this.verificationPartners;
  }

  /**
   * Calculate commission fee
   */
  calculateCommission(itemPrice: number): number {
    return itemPrice * this.COMMISSION_RATE;
  }

  /**
   * Calculate insurance cost
   */
  calculateInsurance(itemPrice: number): number {
    return itemPrice * this.DEFAULT_INSURANCE_RATE;
  }

  /**
   * Get shipping cost
   */
  getShippingCost(): number {
    return this.DEFAULT_SHIPPING_COST;
  }

  /**
   * Get verification cost for specific partner
   */
  getVerificationCost(partnerId: string): number {
    const partner = this.verificationPartners.find(vp => vp.id === partnerId);
    return partner?.cost || this.DEFAULT_VERIFICATION_COST;
  }
}