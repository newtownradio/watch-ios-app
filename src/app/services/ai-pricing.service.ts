import { Injectable } from '@angular/core';

export interface MarketData {
  brand: string;
  model: string;
  year?: number;
  condition: 'excellent' | 'very-good' | 'good' | 'fair';
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketTrend: 'rising' | 'stable' | 'declining';
  demandLevel: 'high' | 'medium' | 'low';
  recentSales: number;
  daysOnMarket: number;
}

export interface PricingRecommendation {
  suggestedPrice: number;
  confidence: number;
  reasoning: string[];
  marketInsights: MarketData;
  priceFactors: {
    brandValue: number;
    conditionMultiplier: number;
    marketDemand: number;
    seasonalAdjustment: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiPricingService {

  // Market data for popular watch brands/models
  private marketData: { [key: string]: MarketData } = {
    'rolex-submariner': {
      brand: 'Rolex',
      model: 'Submariner',
      condition: 'excellent',
      averagePrice: 8500,
      priceRange: { min: 7500, max: 9500 },
      marketTrend: 'rising',
      demandLevel: 'high',
      recentSales: 45,
      daysOnMarket: 12
    },
    'omega-speedmaster': {
      brand: 'Omega',
      model: 'Speedmaster',
      condition: 'excellent',
      averagePrice: 4200,
      priceRange: { min: 3800, max: 4800 },
      marketTrend: 'stable',
      demandLevel: 'high',
      recentSales: 32,
      daysOnMarket: 18
    },
    'cartier-santos': {
      brand: 'Cartier',
      model: 'Santos',
      condition: 'excellent',
      averagePrice: 6800,
      priceRange: { min: 6200, max: 7500 },
      marketTrend: 'rising',
      demandLevel: 'medium',
      recentSales: 28,
      daysOnMarket: 22
    },
    'tudor-black-bay': {
      brand: 'Tudor',
      model: 'Black Bay',
      condition: 'excellent',
      averagePrice: 3200,
      priceRange: { min: 2900, max: 3600 },
      marketTrend: 'stable',
      demandLevel: 'medium',
      recentSales: 38,
      daysOnMarket: 15
    },
    'seiko-prospex': {
      brand: 'Seiko',
      model: 'Prospex',
      condition: 'excellent',
      averagePrice: 450,
      priceRange: { min: 400, max: 550 },
      marketTrend: 'stable',
      demandLevel: 'high',
      recentSales: 67,
      daysOnMarket: 8
    },
    'tag-heuer-carrera': {
      brand: 'Tag Heuer',
      model: 'Carrera',
      condition: 'excellent',
      averagePrice: 2800,
      priceRange: { min: 2500, max: 3200 },
      marketTrend: 'stable',
      demandLevel: 'medium',
      recentSales: 25,
      daysOnMarket: 20
    },
    'breitling-navitimer': {
      brand: 'Breitling',
      model: 'Navitimer',
      condition: 'excellent',
      averagePrice: 5200,
      priceRange: { min: 4800, max: 5800 },
      marketTrend: 'stable',
      demandLevel: 'medium',
      recentSales: 22,
      daysOnMarket: 25
    },
    'iwc-portugieser': {
      brand: 'IWC',
      model: 'Portugieser',
      condition: 'excellent',
      averagePrice: 7800,
      priceRange: { min: 7200, max: 8500 },
      marketTrend: 'rising',
      demandLevel: 'medium',
      recentSales: 18,
      daysOnMarket: 30
    },
    'panerai-luminor': {
      brand: 'Panerai',
      model: 'Luminor',
      condition: 'excellent',
      averagePrice: 6500,
      priceRange: { min: 6000, max: 7200 },
      marketTrend: 'stable',
      demandLevel: 'medium',
      recentSales: 20,
      daysOnMarket: 28
    },
    'audemars-piguet-royal-oak': {
      brand: 'Audemars Piguet',
      model: 'Royal Oak',
      condition: 'excellent',
      averagePrice: 45000,
      priceRange: { min: 42000, max: 48000 },
      marketTrend: 'rising',
      demandLevel: 'high',
      recentSales: 12,
      daysOnMarket: 35
    },
    'patek-philippe-calatrava': {
      brand: 'Patek Philippe',
      model: 'Calatrava',
      condition: 'excellent',
      averagePrice: 28000,
      priceRange: { min: 26000, max: 30000 },
      marketTrend: 'rising',
      demandLevel: 'high',
      recentSales: 8,
      daysOnMarket: 45
    },
    'vacheron-constantin-overseas': {
      brand: 'Vacheron Constantin',
      model: 'Overseas',
      condition: 'excellent',
      averagePrice: 22000,
      priceRange: { min: 20000, max: 24000 },
      marketTrend: 'stable',
      demandLevel: 'medium',
      recentSales: 15,
      daysOnMarket: 40
    }
  };

  constructor() { }

  /**
   * Get AI pricing recommendation based on watch details
   */
  getPricingRecommendation(
    brand: string,
    model: string,
    year?: number,
    condition: 'excellent' | 'very-good' | 'good' | 'fair' = 'excellent',
    originalPrice?: number
  ): PricingRecommendation {
    
    const key = this.generateMarketKey(brand, model);
    const marketData = this.marketData[key] || this.getDefaultMarketData(brand, model);
    
    // Calculate condition multiplier
    const conditionMultiplier = this.getConditionMultiplier(condition);
    
    // Calculate brand value factor
    const brandValue = this.getBrandValueFactor(brand);
    
    // Calculate market demand factor
    const demandFactor = this.getDemandFactor(marketData.demandLevel);
    
    // Calculate seasonal adjustment
    const seasonalAdjustment = this.getSeasonalAdjustment();
    
    // Calculate suggested price
    let suggestedPrice = marketData.averagePrice * conditionMultiplier * brandValue * demandFactor * seasonalAdjustment;
    
    // If original price provided, consider it in the calculation
    if (originalPrice) {
      const originalWeight = 0.3;
      const marketWeight = 0.7;
      suggestedPrice = (originalPrice * originalWeight) + (suggestedPrice * marketWeight);
    }
    
    // Ensure price is within reasonable range
    suggestedPrice = Math.max(marketData.priceRange.min * 0.8, suggestedPrice);
    suggestedPrice = Math.min(marketData.priceRange.max * 1.2, suggestedPrice);
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(marketData, condition, brand);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(marketData, condition, brand, suggestedPrice, originalPrice);
    
    return {
      suggestedPrice: Math.round(suggestedPrice),
      confidence,
      reasoning,
      marketInsights: marketData,
      priceFactors: {
        brandValue,
        conditionMultiplier,
        marketDemand: demandFactor,
        seasonalAdjustment
      }
    };
  }

  /**
   * Get available brands for pricing analysis
   */
  getAvailableBrands(): string[] {
    const brands = new Set<string>();
    Object.values(this.marketData).forEach(data => {
      brands.add(data.brand);
    });
    return Array.from(brands).sort();
  }

  /**
   * Get models for a specific brand
   */
  getModelsForBrand(brand: string): string[] {
    const models = new Set<string>();
    
    // Get models from market data
    Object.values(this.marketData).forEach(data => {
      if (data.brand.toLowerCase() === brand.toLowerCase()) {
        models.add(data.model);
      }
    });
    
    // Add additional common models for each brand
    const additionalModels = this.getAdditionalModelsForBrand(brand);
    additionalModels.forEach(model => models.add(model));
    
    return Array.from(models).sort();
  }

  /**
   * Generate market data key
   */
  private generateMarketKey(brand: string, model: string): string {
    return `${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Get default market data for unknown brands/models
   */
  private getDefaultMarketData(brand: string, model: string): MarketData {
    return {
      brand,
      model,
      condition: 'excellent',
      averagePrice: 2500, // Default average
      priceRange: { min: 2000, max: 3000 },
      marketTrend: 'stable',
      demandLevel: 'medium',
      recentSales: 15,
      daysOnMarket: 25
    };
  }

  /**
   * Calculate condition multiplier
   */
  private getConditionMultiplier(condition: string): number {
    const multipliers = {
      'excellent': 1.0,
      'very-good': 0.85,
      'good': 0.7,
      'fair': 0.55
    };
    return multipliers[condition as keyof typeof multipliers] || 1.0;
  }

  /**
   * Calculate brand value factor
   */
  private getBrandValueFactor(brand: string): number {
    const brandFactors: { [key: string]: number } = {
      'rolex': 1.2,
      'patek philippe': 1.3,
      'audemars piguet': 1.25,
      'omega': 1.0,
      'cartier': 1.1,
      'breitling': 1.0,
      'iwc': 1.05,
      'panerai': 1.0,
      'tudor': 0.9,
      'tag heuer': 0.85,
      'seiko': 0.7
    };
    
    const brandLower = brand.toLowerCase();
    return brandFactors[brandLower] || 1.0;
  }

  /**
   * Calculate demand factor
   */
  private getDemandFactor(demandLevel: string): number {
    const factors = {
      'high': 1.1,
      'medium': 1.0,
      'low': 0.9
    };
    return factors[demandLevel as keyof typeof factors] || 1.0;
  }

  /**
   * Calculate seasonal adjustment
   */
  private getSeasonalAdjustment(): number {
    const month = new Date().getMonth();
    // Holiday season (Nov-Dec) slight premium
    if (month === 10 || month === 11) return 1.05;
    // Summer months slight discount
    if (month >= 5 && month <= 8) return 0.98;
    return 1.0;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(marketData: MarketData, condition: string, brand: string): number {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on data quality
    if (marketData.recentSales > 20) confidence += 0.1;
    if (marketData.daysOnMarket < 20) confidence += 0.1;
    if (condition === 'excellent') confidence += 0.05;
    if (this.getBrandValueFactor(brand) > 1.0) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  }

  /**
   * Generate reasoning for pricing recommendation
   */
  private generateReasoning(
    marketData: MarketData, 
    condition: string, 
    brand: string, 
    suggestedPrice: number,
    originalPrice?: number
  ): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Market average for ${marketData.brand} ${marketData.model}: $${marketData.averagePrice.toLocaleString()}`);
    
    if (condition !== 'excellent') {
      reasoning.push(`Condition adjustment (${condition}): ${Math.round((1 - this.getConditionMultiplier(condition)) * 100)}% reduction`);
    }
    
    if (marketData.marketTrend === 'rising') {
      reasoning.push('Market trend: Rising demand, premium pricing recommended');
    } else if (marketData.marketTrend === 'declining') {
      reasoning.push('Market trend: Declining demand, competitive pricing recommended');
    }
    
    if (marketData.demandLevel === 'high') {
      reasoning.push('High market demand: Premium pricing supported');
    } else if (marketData.demandLevel === 'low') {
      reasoning.push('Low market demand: Competitive pricing recommended');
    }
    
    if (originalPrice) {
      const difference = suggestedPrice - originalPrice;
      const percentage = Math.round((difference / originalPrice) * 100);
      if (difference > 0) {
        reasoning.push(`Your original price: $${originalPrice.toLocaleString()} (+${percentage}% adjustment recommended)`);
      } else {
        reasoning.push(`Your original price: $${originalPrice.toLocaleString()} (${percentage}% adjustment recommended)`);
      }
    }
    
    reasoning.push(`Recent sales: ${marketData.recentSales} similar watches sold`);
    reasoning.push(`Average days on market: ${marketData.daysOnMarket} days`);
    
    return reasoning;
  }

  /**
   * Get additional common models for each brand
   */
  private getAdditionalModelsForBrand(brand: string): string[] {
    const brandModels: { [key: string]: string[] } = {
      'Rolex': [
        'Datejust', 'Daytona', 'GMT-Master', 'Explorer', 'Milgauss', 
        'Yacht-Master', 'Sea-Dweller', 'Air-King', 'Cellini', 'Oyster Perpetual'
      ],
      'Omega': [
        'Seamaster', 'Constellation', 'De Ville', 'Speedmaster Professional',
        'Aqua Terra', 'Planet Ocean', 'Railmaster', 'Seamaster Diver 300M'
      ],
      'Cartier': [
        'Tank', 'Ballon Bleu', 'Pasha', 'Roadster', 'Calibre', 
        'Drive', 'Ronde', 'Baignoire', 'Crash', 'Tortue'
      ],
      'Tudor': [
        'Pelagos', 'Ranger', 'GMT', 'Chronograph', 'Royal',
        'Submariner', 'Heritage', 'Black Bay 58', 'Black Bay GMT'
      ],
      'Seiko': [
        'Presage', 'Prospex', 'Astron', 'Premier', '5 Sports',
        'Grand Seiko', 'King Seiko', 'Credor', 'Alpinist', 'Monster'
      ],
      'Tag Heuer': [
        'Monaco', 'Carrera', 'Aquaracer', 'Link', 'Formula 1',
        'Autavia', 'Connected', 'Monza', 'Silverstone', 'Professional'
      ],
      'Breitling': [
        'Chronomat', 'Superocean', 'Avenger', 'Transocean', 'Premier',
        'Chronoliner', 'Aerospace', 'Emergency', 'Montbrillant', 'Datora'
      ],
      'IWC': [
        'Pilot', 'Ingenieur', 'Aquatimer', 'Da Vinci', 'Portofino',
        'Vintage Collection', 'Le Petit Prince', 'Spitfire', 'Top Gun'
      ],
      'Panerai': [
        'Radiomir', 'Luminor', 'Submersible', 'Luminor Due', 'Luminor Marina',
        'Radiomir 1940', 'Luminor 1950', 'Luminor GMT', 'Luminor Chrono'
      ],
      'Audemars Piguet': [
        'Royal Oak', 'Royal Oak Offshore', 'Millenary', 'Jules Audemars',
        'Classique', 'Code 11.59', 'Royal Oak Concept', 'Tradition'
      ],
      'Patek Philippe': [
        'Calatrava', 'Nautilus', 'Aquanaut', 'Grand Complications',
        'Complications', 'Golden Ellipse', 'Gondolo', 'Twenty-4'
      ],
      'Vacheron Constantin': [
        'Overseas', 'Fiftysix', 'Traditionnelle', 'Patrimony',
        'Métiers d\'Art', 'Historiques', 'Malte', 'Harmony'
      ],
      'Longines': [
        'Conquest', 'Heritage', 'Master Collection', 'DolceVita',
        'La Grande Classique', 'HydroConquest', 'Elegant', 'Presence'
      ],
      'Tissot': [
        'T-Touch', 'T-Classic', 'T-Sport', 'T-Lady', 'T-Gold',
        'Le Locle', 'Couturier', 'Tradition', 'Chemin des Tourelles'
      ],
      'Hamilton': [
        'Khaki', 'Jazzmaster', 'Ventura', 'American Classic',
        'Broadway', 'Pilot', 'Railroad', 'Frogman', 'Pan Europ'
      ],
      'Mido': [
        'Baroncelli', 'Commander', 'Multifort', 'Ocean Star',
        'All Dial', 'Rainflower', 'Belluna', 'Helmsman'
      ],
      'Swatch': [
        'Originals', 'Irony', 'Skin', 'Scuba', 'Chrono',
        'Touch', 'Sistem51', 'Flik Flak', 'Swatch Club'
      ],
      'Casio': [
        'G-Shock', 'Pro Trek', 'Edifice', 'Baby-G', 'Sheen',
        'Pathfinder', 'Gulfman', 'Riseman', 'Mudman'
      ],
      'Citizen': [
        'Eco-Drive', 'Promaster', 'Corso', 'Satellite Wave',
        'Chronomaster', 'Exceed', 'Campanola', 'Attesa'
      ],
      'Bulova': [
        'Precisionist', 'Marine Star', 'Curv', 'Accutron',
        'Classic', 'Automatic', 'Quartz', 'Special Edition'
      ],
      'Timex': [
        'Expedition', 'Weekender', 'Ironman', 'Easy Reader',
        'Waterbury', 'Fairfield', 'South Street', 'Marlin'
      ]
    };
    
    return brandModels[brand] || [];
  }
}