import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationPartner } from '../../models/authentication-partner.interface';
import { AuthenticationPartnerService } from '../../services/authentication-partner.service';

@Component({
  selector: 'app-authentication-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authentication-partners.component.html',
  styleUrl: './authentication-partners.component.scss'
})
export class AuthenticationPartnersComponent implements OnInit {
  @Input() selectedPartnerId: string = '';
  @Input() watchBrand: string = '';
  @Input() watchModel: string = '';
  @Input() estimatedValue: number = 0;
  @Input() userCountry: string = 'US';
  @Input() showRecommended: boolean = true;
  
  @Output() partnerSelected = new EventEmitter<AuthenticationPartner>();
  @Output() partnerChanged = new EventEmitter<string>();

  authenticationPartners: AuthenticationPartner[] = [];
  recommendedPartner: AuthenticationPartner | null = null;
  filteredPartners: AuthenticationPartner[] = [];
  searchTerm: string = '';
  selectedSpecialty: string = '';
  selectedPriceRange: string = '';
  sortBy: 'name' | 'price' | 'rating' | 'time' = 'rating';

  constructor(private authenticationPartnerService: AuthenticationPartnerService) {}

  ngOnInit(): void {
    this.loadAuthenticationPartners();
    this.updateRecommendedPartner();
  }

  loadAuthenticationPartners(): void {
    this.authenticationPartners = this.authenticationPartnerService.getActivePartners();
    this.filteredPartners = [...this.authenticationPartners];
    this.applyFilters();
  }

  updateRecommendedPartner(): void {
    if (this.watchBrand && this.watchModel && this.estimatedValue > 0) {
      this.recommendedPartner = this.authenticationPartnerService.getRecommendedPartner(
        this.watchBrand,
        this.watchModel,
        this.estimatedValue,
        this.userCountry
      );
    }
  }

  onPartnerSelect(partner: AuthenticationPartner): void {
    this.selectedPartnerId = partner.id;
    this.partnerSelected.emit(partner);
    this.partnerChanged.emit(partner.id);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSpecialtyChange(): void {
    this.applyFilters();
  }

  onPriceRangeChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applySorting();
  }

  applyFilters(): void {
    let filtered = [...this.authenticationPartners];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        partner.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        partner.specialty.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply specialty filter
    if (this.selectedSpecialty) {
      filtered = filtered.filter(partner =>
        partner.specialty.toLowerCase().includes(this.selectedSpecialty.toLowerCase())
      );
    }

    // Apply price range filter
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter(partner => {
        if (max) {
          return partner.baseFee >= min && partner.baseFee <= max;
        } else {
          return partner.baseFee >= min;
        }
      });
    }

    this.filteredPartners = filtered;
    this.applySorting();
  }

  applySorting(): void {
    this.filteredPartners.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.baseFee - b.baseFee;
        case 'rating':
          return b.rating - a.rating;
        case 'time':
          const aDays = parseInt(a.estimatedTime.split('-')[1]) || 5;
          const bDays = parseInt(b.estimatedTime.split('-')[1]) || 5;
          return aDays - bDays;
        default:
          return 0;
      }
    });
  }

  getSpecialties(): string[] {
    const specialties = new Set<string>();
    this.authenticationPartners.forEach(partner => {
      partner.coverage.forEach(coverage => {
        specialties.add(coverage);
      });
    });
    return Array.from(specialties).sort();
  }

  getPriceRanges(): Array<{ label: string; value: string; min: number; max?: number }> {
    return [
      { label: 'Under $150', value: '0-150', min: 0, max: 150 },
      { label: '$150 - $200', value: '150-200', min: 150, max: 200 },
      { label: '$200 - $250', value: '200-250', min: 200, max: 250 },
      { label: 'Over $250', value: '250-999', min: 250 }
    ];
  }

  getPartnerRatingStars(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  getPartnerStatusClass(partner: AuthenticationPartner): string {
    if (partner.id === this.selectedPartnerId) {
      return 'selected';
    }
    if (this.recommendedPartner?.id === partner.id) {
      return 'recommended';
    }
    return '';
  }

  getEstimatedTimeDays(estimatedTime: string): number {
    const days = estimatedTime.split('-')[1];
    return parseInt(days) || 5;
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString()}`;
  }

  formatSuccessRate(rate: number): string {
    return `${rate}%`;
  }

  getSelectedPartner(): AuthenticationPartner | null {
    if (!this.selectedPartnerId) return null;
    return this.authenticationPartners.find(partner => partner.id === this.selectedPartnerId) || null;
  }
}
