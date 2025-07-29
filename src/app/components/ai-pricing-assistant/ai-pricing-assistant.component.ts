import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiPricingService, PricingRecommendation } from '../../services/ai-pricing.service';

@Component({
  selector: 'app-ai-pricing-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-pricing-assistant">
      <div class="assistant-header">
        <h3>AI Pricing Assistant</h3>
        <p>Get market-based pricing recommendations for your watch</p>
      </div>

      <div class="watch-details">
        <div class="form-group">
          <label for="brand">Brand</label>
          <select id="brand" [(ngModel)]="selectedBrand" (ngModelChange)="onBrandChange()">
            <option value="">Select Brand</option>
            <option *ngFor="let brand of availableBrands" [value]="brand">{{ brand }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="model">Model</label>
          <select id="model" [(ngModel)]="selectedModel" (ngModelChange)="onModelChange()" [disabled]="!selectedBrand">
            <option value="">Select Model</option>
            <option *ngFor="let model of availableModels" [value]="model">{{ model }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="year">Year (Optional)</label>
          <input 
            type="number" 
            id="year"
            [(ngModel)]="year" 
            placeholder="e.g., 2020"
            min="1900"
            max="2025"
          >
        </div>

        <div class="form-group">
          <label for="condition">Condition</label>
          <select id="condition" [(ngModel)]="condition">
            <option value="excellent">Excellent</option>
            <option value="very-good">Very Good</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div class="form-group">
          <label for="original-price">Your Original Price (Optional)</label>
          <input 
            type="number" 
            id="original-price"
            [(ngModel)]="originalPrice" 
            placeholder="e.g., 5000"
            min="0"
            step="0.01"
          >
        </div>

        <button 
          class="analyze-btn" 
          (click)="analyzePricing()"
          [disabled]="!selectedBrand || !selectedModel"
        >
          Analyze Market & Get Recommendation
        </button>
      </div>

      <div class="recommendation" *ngIf="recommendation">
        <div class="recommendation-header">
          <h4>AI Pricing Recommendation</h4>
          <div class="confidence-badge">
            {{ (recommendation.confidence * 100).toFixed(0) }}% Confidence
          </div>
        </div>

        <div class="suggested-price">
          <span class="price-label">Suggested Price:</span>
          <span class="price-value">${{ recommendation.suggestedPrice.toLocaleString() }}</span>
        </div>

        <div class="market-insights">
          <h5>Market Insights</h5>
          <div class="insight-grid">
            <div class="insight-item">
              <span class="label">Market Trend:</span>
              <span class="value" [class]="recommendation.marketInsights.marketTrend">
                {{ recommendation.marketInsights.marketTrend }}
              </span>
            </div>
            <div class="insight-item">
              <span class="label">Demand Level:</span>
              <span class="value" [class]="recommendation.marketInsights.demandLevel">
                {{ recommendation.marketInsights.demandLevel }}
              </span>
            </div>
            <div class="insight-item">
              <span class="label">Recent Sales:</span>
              <span class="value">{{ recommendation.marketInsights.recentSales }}</span>
            </div>
            <div class="insight-item">
              <span class="label">Avg Days on Market:</span>
              <span class="value">{{ recommendation.marketInsights.daysOnMarket }}</span>
            </div>
          </div>
        </div>

        <div class="reasoning">
          <h5>Pricing Factors</h5>
          <ul>
            <li *ngFor="let reason of recommendation.reasoning">{{ reason }}</li>
          </ul>
        </div>

        <div class="price-breakdown">
          <h5>Price Factors</h5>
          <div class="factor-grid">
            <div class="factor-item">
              <span class="label">Brand Value:</span>
              <span class="value">{{ (recommendation.priceFactors.brandValue * 100).toFixed(0) }}%</span>
            </div>
            <div class="factor-item">
              <span class="label">Condition:</span>
              <span class="value">{{ (recommendation.priceFactors.conditionMultiplier * 100).toFixed(0) }}%</span>
            </div>
            <div class="factor-item">
              <span class="label">Market Demand:</span>
              <span class="value">{{ (recommendation.priceFactors.marketDemand * 100).toFixed(0) }}%</span>
            </div>
            <div class="factor-item">
              <span class="label">Seasonal:</span>
              <span class="value">{{ (recommendation.priceFactors.seasonalAdjustment * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="use-price-btn" (click)="useRecommendedPrice()">
            Use This Price
          </button>
          <button class="adjust-price-btn" (click)="adjustPrice()">
            Adjust Price
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-pricing-assistant {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .assistant-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .assistant-header h3 {
      margin: 0 0 8px 0;
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
    }

    .assistant-header p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }

    .watch-details {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
    }

    select, input {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      background: #f9fafb;
    }

    select:focus, input:focus {
      outline: none;
      border-color: #1e3a8a;
      background: white;
    }

    .analyze-btn {
      width: 100%;
      background: #1e3a8a;
      color: white;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .analyze-btn:hover:not(:disabled) {
      background: #1e40af;
    }

    .analyze-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .recommendation {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }

    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .recommendation-header h4 {
      margin: 0;
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
    }

    .confidence-badge {
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .suggested-price {
      background: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-label {
      font-weight: 500;
      color: #374151;
    }

    .price-value {
      font-size: 24px;
      font-weight: 600;
      color: #1e3a8a;
    }

    .market-insights, .reasoning, .price-breakdown {
      margin-bottom: 16px;
    }

    h5 {
      margin: 0 0 12px 0;
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
    }

    .insight-grid, .factor-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .insight-item, .factor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
    }

    .label {
      color: #6b7280;
    }

    .value {
      font-weight: 500;
      color: #1f2937;
    }

    .value.rising {
      color: #10b981;
    }

    .value.declining {
      color: #ef4444;
    }

    .value.stable {
      color: #f59e0b;
    }

    .value.high {
      color: #10b981;
    }

    .value.medium {
      color: #f59e0b;
    }

    .value.low {
      color: #ef4444;
    }

    .reasoning ul {
      margin: 0;
      padding-left: 20px;
    }

    .reasoning li {
      margin-bottom: 8px;
      color: #374151;
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .use-price-btn, .adjust-price-btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .use-price-btn {
      background: #10b981;
      color: white;
    }

    .use-price-btn:hover {
      background: #059669;
    }

    .adjust-price-btn {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .adjust-price-btn:hover {
      background: #e5e7eb;
    }
  `]
})
export class AiPricingAssistantComponent {
  @Output() priceSelected = new EventEmitter<number>();

  selectedBrand = '';
  selectedModel = '';
  year?: number;
  condition: 'excellent' | 'very-good' | 'good' | 'fair' = 'excellent';
  originalPrice?: number;

  availableBrands: string[] = [];
  availableModels: string[] = [];
  recommendation?: PricingRecommendation;

  constructor(private aiPricingService: AiPricingService) {
    this.availableBrands = this.aiPricingService.getAvailableBrands();
  }

  onBrandChange() {
    this.selectedModel = '';
    this.availableModels = this.aiPricingService.getModelsForBrand(this.selectedBrand);
  }

  onModelChange() {
    // Reset recommendation when model changes
    this.recommendation = undefined;
  }

  analyzePricing() {
    if (!this.selectedBrand || !this.selectedModel) return;

    this.recommendation = this.aiPricingService.getPricingRecommendation(
      this.selectedBrand,
      this.selectedModel,
      this.year,
      this.condition,
      this.originalPrice
    );
  }

  useRecommendedPrice() {
    if (this.recommendation) {
      this.priceSelected.emit(this.recommendation.suggestedPrice);
    }
  }

  adjustPrice() {
    // Emit current recommendation price for manual adjustment
    if (this.recommendation) {
      this.priceSelected.emit(this.recommendation.suggestedPrice);
    }
  }
}