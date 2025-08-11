import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpsShippingService, ShippingAddress, PackageDetails, ShippingRate } from '../../services/ups-shipping.service';

@Component({
  selector: 'app-shipping-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipping-calculator.component.html',
  styleUrl: './shipping-calculator.component.scss'
})
export class ShippingCalculatorComponent implements OnInit {
  @Output() shippingRateSelected = new EventEmitter<ShippingRate>();

  // Form data
  fromAddress: ShippingAddress = {
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    email: ''
  };

  toAddress: ShippingAddress = {
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    email: ''
  };

  packageDetails: PackageDetails = {
    weight: 2,
    length: 6,
    width: 4,
    height: 3,
    declaredValue: 0
  };

  // Component state
  showCalculator = false;
  isLoading = false;
  shippingRates: ShippingRate[] = [];
  selectedRate: ShippingRate | null = null;
  errorMessage = '';

  // US States for dropdown
  usStates = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  constructor(private upsShippingService: UpsShippingService) {}

  ngOnInit() {
    // Initialize with default values
    this.loadDefaultAddresses();
  }

  toggleCalculator() {
    this.showCalculator = !this.showCalculator;
    if (this.showCalculator) {
      this.loadDefaultAddresses();
    }
  }

  loadDefaultAddresses() {
    // Load from user profile or use defaults
    // This would typically come from user settings
    this.fromAddress = {
      name: 'Your Name',
      company: 'Your Company',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '(555) 123-4567',
      email: 'your@email.com'
    };
  }

  calculateShipping() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.upsShippingService.getShippingRates(
      this.fromAddress,
      this.toAddress,
      this.packageDetails
    ).subscribe({
      next: (rates) => {
        this.shippingRates = rates;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error calculating shipping rates. Please try again.';
        this.isLoading = false;
        console.error('Shipping calculation error:', error);
      }
    });
  }

  selectShippingRate(rate: ShippingRate) {
    this.selectedRate = rate;
    this.shippingRateSelected.emit(rate);
  }

  validateForm(): boolean {
    if (!this.fromAddress.name || !this.fromAddress.address1 || !this.fromAddress.city || 
        !this.fromAddress.state || !this.fromAddress.postalCode) {
      this.errorMessage = 'Please fill in all required sender address fields.';
      return false;
    }

    if (!this.toAddress.name || !this.toAddress.address1 || !this.toAddress.city || 
        !this.toAddress.state || !this.toAddress.postalCode) {
      this.errorMessage = 'Please fill in all required recipient address fields.';
      return false;
    }

    if (this.packageDetails.weight <= 0 || this.packageDetails.length <= 0 || 
        this.packageDetails.width <= 0 || this.packageDetails.height <= 0) {
      this.errorMessage = 'Please enter valid package dimensions.';
      return false;
    }

    return true;
  }

  clearForm() {
    this.fromAddress = {
      name: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      email: ''
    };

    this.toAddress = {
      name: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      email: ''
    };

    this.packageDetails = {
      weight: 2,
      length: 6,
      width: 4,
      height: 3,
      declaredValue: 0
    };

    this.shippingRates = [];
    this.selectedRate = null;
    this.errorMessage = '';
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  getStatusIcon(guaranteed: boolean): string {
    return guaranteed ? '✅' : '⏰';
  }
}
