import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DigitalWatch {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: 'smartwatch' | 'digital' | 'hybrid';
  price: number;
  condition: string;
  imageUrl: string;
  description: string;
  features: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare';
  isCollector: boolean;
  authenticationStatus: 'unverified' | 'pending' | 'verified';
}

interface AppleWatch {
  id: string;
  name: string;
  series: string;
  size: string;
  connectivity: 'gps' | 'cellular';
  material: string;
  storage: string;
  color: string;
  price: number;
  condition: string;
  imageUrl: string;
  description: string;
  features: {
    appleCare: boolean;
    findMy: boolean;
    activationLock: boolean;
    originalBox: boolean;
  };
  watchOS: string;
  batteryHealth: number;
  authenticationStatus: 'unverified' | 'pending' | 'verified';
}

@Component({
  selector: 'app-digital',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './digital.component.html',
  styleUrl: './digital.component.scss'
})
export class DigitalComponent implements OnInit {
  activeTab: 'collectors' | 'apple-watch' = 'collectors';
  
  // Search and filters
  searchQuery = '';
  selectedBrand = '';
  selectedPriceRange = '';
  selectedCondition = '';
  selectedConnectivity = '';
  selectedSeries = '';
  
  // Digital watches for collectors
  digitalWatches: DigitalWatch[] = [
    {
      id: 'dw-001',
      name: 'Garmin Fenix 7X Sapphire Solar',
      brand: 'Garmin',
      model: 'Fenix 7X Sapphire Solar',
      year: 2022,
      type: 'smartwatch',
      price: 999,
      condition: 'excellent',
      imageUrl: '/assets/images/garmin-fenix-7x.jpg',
      description: 'Premium multisport GPS smartwatch with solar charging and sapphire crystal',
      features: ['Solar Charging', 'Sapphire Crystal', 'Multi-Sport Tracking', 'Advanced Metrics'],
      rarity: 'rare',
      isCollector: true,
      authenticationStatus: 'verified'
    },
    {
      id: 'dw-002',
      name: 'Suunto 9 Baro Titanium',
      brand: 'Suunto',
      model: '9 Baro Titanium',
      year: 2021,
      type: 'smartwatch',
      price: 799,
      condition: 'excellent',
      imageUrl: '/assets/images/suunto-9-baro.jpg',
      description: 'Professional-grade outdoor smartwatch with titanium construction',
      features: ['Titanium Case', 'Barometric Altimeter', 'GPS Navigation', 'Weather Resistance'],
      rarity: 'uncommon',
      isCollector: true,
      authenticationStatus: 'verified'
    },
    {
      id: 'dw-003',
      name: 'Casio G-Shock GMW-B5000',
      brand: 'Casio',
      model: 'GMW-B5000',
      year: 2023,
      type: 'digital',
      price: 499,
      condition: 'excellent',
      imageUrl: '/assets/images/casio-gmw-b5000.jpg',
      description: 'Premium G-Shock with full metal construction and Bluetooth connectivity',
      features: ['Full Metal Construction', 'Bluetooth Sync', 'Solar Power', '200m Water Resistance'],
      rarity: 'uncommon',
      isCollector: true,
      authenticationStatus: 'verified'
    }
  ];
  
  // Apple Watches
  appleWatches: AppleWatch[] = [
    {
      id: 'aw-001',
      name: 'Apple Watch Ultra',
      series: 'Ultra',
      size: '49mm',
      connectivity: 'cellular',
      material: 'titanium',
      storage: '64gb',
      color: 'Natural Titanium',
      price: 799,
      condition: 'excellent',
      imageUrl: '/assets/images/apple-watch-ultra.jpg',
      description: 'Premium Apple Watch designed for extreme sports and outdoor activities',
      features: {
        appleCare: true,
        findMy: true,
        activationLock: true,
        originalBox: true
      },
      watchOS: '10.0',
      batteryHealth: 95,
      authenticationStatus: 'verified'
    },
    {
      id: 'aw-002',
      name: 'Apple Watch Series 9',
      series: 'Series 9',
      size: '45mm',
      connectivity: 'cellular',
      material: 'stainless-steel',
      storage: '64gb',
      color: 'Gold Stainless Steel',
      price: 749,
      condition: 'excellent',
      imageUrl: '/assets/images/apple-watch-series9.jpg',
      description: 'Latest Apple Watch with advanced health monitoring and performance',
      features: {
        appleCare: true,
        findMy: true,
        activationLock: true,
        originalBox: true
      },
      watchOS: '10.0',
      batteryHealth: 98,
      authenticationStatus: 'verified'
    },
    {
      id: 'aw-003',
      name: 'Apple Watch SE',
      series: 'SE',
      size: '44mm',
      connectivity: 'gps',
      material: 'aluminum',
      storage: '32gb',
      color: 'Midnight',
      price: 249,
      condition: 'excellent',
      imageUrl: '/assets/images/apple-watch-se.jpg',
      description: 'Affordable Apple Watch with essential features and great performance',
      features: {
        appleCare: false,
        findMy: true,
        activationLock: true,
        originalBox: true
      },
      watchOS: '10.0',
      batteryHealth: 92,
      authenticationStatus: 'verified'
    }
  ];
  
  filteredDigitalWatches: DigitalWatch[] = [];
  filteredAppleWatches: AppleWatch[] = [];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    this.applyFilters();
  }
  
  setActiveTab(tab: 'collectors' | 'apple-watch') {
    this.activeTab = tab;
    this.applyFilters();
  }
  
  applyFilters() {
    if (this.activeTab === 'collectors') {
      this.filteredDigitalWatches = this.digitalWatches.filter(watch => {
        const matchesSearch = !this.searchQuery || 
          watch.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          watch.brand.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          watch.model.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        const matchesBrand = !this.selectedBrand || watch.brand === this.selectedBrand;
        const matchesPrice = !this.selectedPriceRange || this.matchesPriceRange(watch.price, this.selectedPriceRange);
        const matchesCondition = !this.selectedCondition || watch.condition === this.selectedCondition;
        
        return matchesSearch && matchesBrand && matchesPrice && matchesCondition;
      });
    } else {
      this.filteredAppleWatches = this.appleWatches.filter(watch => {
        const matchesSearch = !this.searchQuery || 
          watch.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          watch.series.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        const matchesSeries = !this.selectedSeries || watch.series === this.selectedSeries;
        const matchesConnectivity = !this.selectedConnectivity || watch.connectivity === this.selectedConnectivity;
        const matchesPrice = !this.selectedPriceRange || this.matchesPriceRange(watch.price, this.selectedPriceRange);
        const matchesCondition = !this.selectedCondition || watch.condition === this.selectedCondition;
        
        return matchesSearch && matchesSeries && matchesConnectivity && matchesPrice && matchesCondition;
      });
    }
  }
  
  private matchesPriceRange(price: number, range: string): boolean {
    switch (range) {
      case 'under-500': return price < 500;
      case '500-1000': return price >= 500 && price <= 1000;
      case '1000-2000': return price >= 1000 && price <= 2000;
      case 'over-2000': return price > 2000;
      default: return true;
    }
  }
  
  getAvailableBrands(): string[] {
    return [...new Set(this.digitalWatches.map(watch => watch.brand))];
  }
  
  getAvailableSeries(): string[] {
    return [...new Set(this.appleWatches.map(watch => watch.series))];
  }
  
  clearFilters() {
    this.searchQuery = '';
    this.selectedBrand = '';
    this.selectedPriceRange = '';
    this.selectedCondition = '';
    this.selectedConnectivity = '';
    this.selectedSeries = '';
    this.applyFilters();
  }
  
  viewWatchDetails(watch: DigitalWatch | AppleWatch) {
    // Navigate to watch details page
    console.log('Viewing details for:', watch);
  }
  
  contactSeller(watch: DigitalWatch | AppleWatch) {
    // Navigate to contact seller page
    console.log('Contacting seller for:', watch);
  }
  
  makeOffer(watch: DigitalWatch | AppleWatch) {
    // Navigate to make offer page
    console.log('Making offer for:', watch);
  }
  
  placeBid(watch: DigitalWatch | AppleWatch) {
    // Navigate to place bid page
    console.log('Placing bid for:', watch);
  }
  
  purchaseWatch(watch: DigitalWatch | AppleWatch) {
    // Navigate to purchase page
    console.log('Purchasing:', watch);
  }
  
  shareWatch(watch: DigitalWatch | AppleWatch) {
    // Share watch listing
    console.log('Sharing:', watch);
  }
  
  messageSeller(watch: DigitalWatch | AppleWatch) {
    // Navigate to message seller page
    console.log('Messaging seller for:', watch);
  }
  
  navigateToSell() {
    this.router.navigate(['/sell']);
  }
}
