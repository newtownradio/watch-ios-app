import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface AuthenticationPartner {
  name: string;
  fee: number;
  specialty: string;
  endpoint: string;
  description?: string;
  estimatedTime?: string;
  coverage?: string[];
}

export interface PartnerRecommendation {
  partner: AuthenticationPartner;
  reason: string;
  matchScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationPartnerService {

  constructor() { }

  /**
   * Get all available authentication partners
   */
  getAllPartners(): Observable<AuthenticationPartner[]> {
    const partners = Object.values(environment.api3.partners).map(partner => ({
      name: partner.name,
      fee: partner.fee,
      specialty: partner.specialty,
      endpoint: partner.endpoint,
      description: this.getPartnerDescription(partner.name),
      estimatedTime: this.getEstimatedTime(partner.specialty),
      coverage: this.getCoverage(partner.specialty)
    }));
    
    return of(partners);
  }

  /**
   * Get partners by specialty
   */
  getPartnersBySpecialty(specialty: string): Observable<AuthenticationPartner[]> {
    return this.getAllPartners().pipe(
      map(partners => partners.filter(partner => partner.specialty === specialty))
    );
  }

  /**
   * Get partner recommendations based on watch details
   */
  getRecommendations(watchDetails: any): Observable<PartnerRecommendation[]> {
    const { brand, model, year, hasDiamonds, isVintage, estimatedValue } = watchDetails;
    
    return this.getAllPartners().pipe(
      map(partners => {
        const recommendations: PartnerRecommendation[] = [];
        
        partners.forEach(partner => {
          let score = 0;
          let reason = '';
          
          // Brand-specific recommendations
          if (brand?.toLowerCase().includes('rolex') && partner.specialty === 'Rolex') {
            score += 50;
            reason = 'Official Rolex authentication service';
          }
          
          // Diamond/gemstone recommendations
          if (hasDiamonds && partner.specialty === 'Diamond') {
            score += 40;
            reason = 'Specialized in diamond and gemstone authentication';
          }
          
          // Vintage recommendations
          if (isVintage && partner.specialty === 'Vintage') {
            score += 35;
            reason = 'Expert in vintage watch authentication';
          }
          
          // Value-based recommendations
          if (estimatedValue > 50000 && partner.specialty === 'Vintage') {
            score += 20;
            reason = 'High-value vintage authentication';
          }
          
          // General recommendations
          if (partner.specialty === 'General') {
            score += 10;
            reason = 'General luxury watch authentication';
          }
          
          // Cost considerations
          if (estimatedValue < 10000 && partner.fee > 100) {
            score -= 20;
            reason += ' - Consider cost vs value';
          }
          
          if (score > 0) {
            recommendations.push({
              partner,
              reason,
              matchScore: score
            });
          }
        });
        
        // Sort by score (highest first)
        return recommendations.sort((a, b) => b.matchScore - a.matchScore);
      })
    );
  }

  /**
   * Get estimated authentication time
   */
  getEstimatedTime(specialty: string): string {
    switch (specialty) {
      case 'Rolex':
        return '3-5 business days';
      case 'Diamond':
        return '5-7 business days';
      case 'Vintage':
        return '7-10 business days';
      case 'General':
        return '3-5 business days';
      case 'Independent':
        return '2-4 business days';
      default:
        return '3-5 business days';
    }
  }

  /**
   * Get coverage details for specialty
   */
  getCoverage(specialty: string): string[] {
    switch (specialty) {
      case 'Rolex':
        return ['Rolex authenticity', 'Movement verification', 'Case and bracelet', 'Serial number validation'];
      case 'Diamond':
        return ['Diamond authenticity', 'Carat weight', 'Color grade', 'Clarity grade', 'Cut quality'];
      case 'Vintage':
        return ['Historical authenticity', 'Condition assessment', 'Rarity verification', 'Market value'];
      case 'General':
        return ['General authenticity', 'Movement verification', 'Case verification', 'Basic condition'];
      case 'Independent':
        return ['Independent assessment', 'Condition report', 'Authenticity verification'];
      default:
        return ['General authentication'];
    }
  }

  /**
   * Get partner description
   */
  getPartnerDescription(partnerName: string): string {
    const descriptions: { [key: string]: string } = {
      'WatchBox': 'Leading luxury watch retailer with comprehensive authentication services',
      'GIA (Gemological Institute of America)': 'World\'s foremost authority on diamonds, colored stones, and pearls',
      'Rolex Service Center': 'Official Rolex authentication and service center',
      'Chrono24 Authentication': 'Specialized in luxury watch authentication with global reach',
      'Watchfinder & Co.': 'Expert in pre-owned luxury watch authentication',
      'Tourneau': 'Premier luxury watch retailer with authentication expertise',
      'IGI (International Gemological Institute)': 'Leading gemological laboratory for diamond and gemstone authentication',
      'HRD Antwerp': 'Belgian diamond and gemstone authentication authority',
      'Omega Service Center': 'Official Omega authentication and service center',
      'Patek Philippe Service': 'Official Patek Philippe authentication for vintage and modern pieces',
      'Audemars Piguet Service': 'Official AP authentication and service center',
      'Cartier Service Center': 'Official Cartier authentication and service center',
      'Bucherer (Official Rolex Dealer)': 'Official Rolex dealer with authentication services',
      'Phillips Auction House': 'World-renowned auction house with vintage watch expertise',
      'Christie\'s Watch Department': 'Leading auction house with luxury watch authentication',
      'Sotheby\'s Watch Department': 'Prestigious auction house with vintage watch expertise',
      'Independent Watch Appraiser': 'Independent professional watch authentication service',
      'Luxury Watch Specialist': 'Specialized luxury watch authentication service'
    };
    
    return descriptions[partnerName] || 'Professional watch authentication service';
  }

  /**
   * Calculate total cost including fees
   */
  calculateTotalCost(partnerFee: number, watchPrice: number, shippingCost: number): number {
    const platformFee = (watchPrice * 0.03); // 3% platform fee
    return partnerFee + platformFee + shippingCost;
  }

  /**
   * Get cost breakdown
   */
  getCostBreakdown(partner: AuthenticationPartner, watchPrice: number, shippingCost: number): any {
    const platformFee = (watchPrice * 0.03);
    const totalCost = this.calculateTotalCost(partner.fee, watchPrice, shippingCost);
    
    return {
      authenticationFee: partner.fee,
      platformFee: platformFee,
      shippingCost: shippingCost,
      totalCost: totalCost,
      breakdown: {
        authentication: partner.fee,
        platform: platformFee,
        shipping: shippingCost
      }
    };
  }

  /**
   * Validate partner selection
   */
  validatePartnerSelection(partnerName: string, watchDetails: any): Observable<boolean> {
    // This would integrate with API3 to validate the partner
    return of(true); // Placeholder
  }
}
