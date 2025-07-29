import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PricingBreakdown, VerificationPartner } from '../../models/bid.interface';
import { PricingService } from '../../services/pricing.service';

@Component({
  selector: 'app-pricing-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pricing-calculator">
      <h3>Pricing Breakdown</h3>
      
      <div class="price-input">
        <label for="item-price">Item Price ($)</label>
        <input 
          type="number" 
          id="item-price"
          [(ngModel)]="itemPrice" 
          (ngModelChange)="calculatePricing()"
          placeholder="Enter item price"
          min="0"
          step="0.01"
        >
      </div>

      <div class="verification-partner">
        <label for="verification-partner">Verification Partner</label>
        <select 
          id="verification-partner"
          [(ngModel)]="selectedPartnerId" 
          (ngModelChange)="calculatePricing()"
        >
          <option *ngFor="let partner of verificationPartners" [value]="partner.id">
            {{ partner.name }} - ${{ partner.cost }} ({{ partner.turnaroundTime }})
          </option>
        </select>
      </div>

      <div class="pricing-breakdown" *ngIf="pricing">
        <div class="breakdown-item">
          <span>Item Price:</span>
          <span>${{ pricing.itemPrice.toLocaleString() }}</span>
        </div>
        
        <div class="breakdown-item">
          <span>Shipping:</span>
          <span>${{ pricing.shippingCost.toLocaleString() }}</span>
        </div>
        
        <div class="breakdown-item">
          <span>Verification ({{ getSelectedPartnerName() }}):</span>
          <span>${{ pricing.verificationCost.toLocaleString() }}</span>
        </div>
        
        <div class="breakdown-item">
          <span>Commission (6%):</span>
          <span>${{ pricing.commissionFee.toLocaleString() }}</span>
        </div>
        
        <div class="breakdown-item">
          <span>Insurance:</span>
          <span>${{ pricing.insuranceCost.toLocaleString() }}</span>
        </div>
        
        <div class="breakdown-item total">
          <span>Total Amount:</span>
          <span>${{ pricing.totalAmount.toLocaleString() }}</span>
        </div>
      </div>

      <div class="verification-info" *ngIf="selectedPartner">
        <p><strong>{{ selectedPartner.name }}</strong></p>
        <p>{{ selectedPartner.description }}</p>
        <p>Turnaround: {{ selectedPartner.turnaroundTime }}</p>
      </div>
    </div>
  `,
  styles: [`
    .pricing-calculator {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      
      @media (max-width: 768px) {
        padding: 16px;
        margin-bottom: 16px;
      }
      
      @media (max-width: 480px) {
        padding: 12px;
        margin-bottom: 12px;
        border-radius: 8px;
      }
    }

    h3 {
      margin: 0 0 16px 0;
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
      
      @media (max-width: 768px) {
        font-size: 16px;
        margin-bottom: 12px;
      }
      
      @media (max-width: 480px) {
        font-size: 15px;
        margin-bottom: 10px;
      }
    }

    .price-input, .verification-partner {
      margin-bottom: 16px;
      
      @media (max-width: 768px) {
        margin-bottom: 12px;
      }
      
      @media (max-width: 480px) {
        margin-bottom: 10px;
      }
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
    }

    input, select {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      background: #f9fafb;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #1e3a8a;
      background: white;
    }

    .pricing-breakdown {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      margin-top: 16px;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
    }

    .breakdown-item.total {
      border-top: 1px solid #e5e7eb;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: 600;
      font-size: 16px;
      color: #1e3a8a;
    }

    .verification-info {
      margin-top: 16px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 14px;
    }

    .verification-info p {
      margin: 4px 0;
      color: #6b7280;
    }

    .verification-info p:first-child {
      color: #1f2937;
      font-weight: 500;
    }
  `]
})
export class PricingCalculatorComponent implements OnInit {
  @Input() initialPrice: number = 0;
  @Output() pricingChange = new EventEmitter<PricingBreakdown>();

  itemPrice: number = 0;
  selectedPartnerId: string = 'watchcsa';
  pricing: PricingBreakdown | null = null;
  verificationPartners: VerificationPartner[] = [];

  constructor(private pricingService: PricingService) {}

  ngOnInit() {
    this.itemPrice = this.initialPrice;
    this.verificationPartners = this.pricingService.getVerificationPartners();
    this.calculatePricing();
  }

  calculatePricing() {
    if (this.itemPrice > 0) {
      this.pricing = this.pricingService.calculatePricing(this.itemPrice, this.selectedPartnerId);
      this.pricingChange.emit(this.pricing);
    } else {
      this.pricing = null;
    }
  }

  getSelectedPartnerName(): string {
    const partner = this.verificationPartners.find(p => p.id === this.selectedPartnerId);
    return partner?.name || 'WatchCSA';
  }

  get selectedPartner(): VerificationPartner | undefined {
    return this.verificationPartners.find(p => p.id === this.selectedPartnerId);
  }
}