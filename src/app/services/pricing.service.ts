import { Injectable } from '@angular/core';
import { PricingBreakdown, VerificationPartner } from '../models/bid.interface';

@Injectable({
  providedIn: 'root'
})
export class PricingService {
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

  getVerificationPartners(): VerificationPartner[] {
    return this.verificationPartners;
  }

  calculatePricing(itemPrice: number, selectedPartnerId: string): PricingBreakdown {
    const partner = this.verificationPartners.find(p => p.id === selectedPartnerId);
    const verificationCost = partner ? partner.cost : 150;
    const shippingCost = 25; // Fixed shipping cost
    const commissionFee = itemPrice * 0.06; // 6% commission
    const insuranceCost = itemPrice * 0.02; // 2% insurance
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
} 