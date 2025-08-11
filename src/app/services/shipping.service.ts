import { Injectable } from '@angular/core';
import { 
  ShippingDetails, 
  Address, 
  PackageDetails, 
  ShippingMethod 
} from '../models/authentication-partner.interface';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private readonly SHIPPING_METHODS_KEY = 'watch_ios_shipping_methods';
  private readonly ADDRESSES_KEY = 'watch_ios_user_addresses';
  private readonly SHIPPING_HISTORY_KEY = 'watch_ios_shipping_history';

  private readonly DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
    {
      id: 'ground',
      name: 'Ground Shipping',
      description: 'Standard ground shipping with tracking',
      estimatedDays: '3-5 business days',
      cost: 25,
      insuranceIncluded: true,
      trackingIncluded: true,
      signatureRequired: false
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Fast delivery with priority handling',
      estimatedDays: '1-2 business days',
      cost: 45,
      insuranceIncluded: true,
      trackingIncluded: true,
      signatureRequired: true
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day delivery',
      estimatedDays: '1 business day',
      cost: 75,
      insuranceIncluded: true,
      trackingIncluded: true,
      signatureRequired: true
    },
    {
      id: 'international',
      name: 'International Shipping',
      description: 'Worldwide delivery with customs handling',
      estimatedDays: '5-10 business days',
      cost: 125,
      insuranceIncluded: true,
      trackingIncluded: true,
      signatureRequired: true
    }
  ];

  constructor() {
    this.initializeShippingMethods();
  }

  /**
   * Get all available shipping methods
   */
  getShippingMethods(): ShippingMethod[] {
    const data = localStorage.getItem(this.SHIPPING_METHODS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return this.DEFAULT_SHIPPING_METHODS;
  }

  /**
   * Get shipping method by ID
   */
  getShippingMethodById(methodId: string): ShippingMethod | undefined {
    const methods = this.getShippingMethods();
    return methods.find(m => m.id === methodId);
  }

  /**
   * Calculate shipping cost based on package details and method
   */
  calculateShippingCost(
    packageDetails: PackageDetails,
    shippingMethod: ShippingMethod,
    fromZip: string,
    toZip: string
  ): number {
    let baseCost = shippingMethod.cost;
    
    // Add weight-based cost
    if (packageDetails.weight > 2) {
      baseCost += (packageDetails.weight - 2) * 5; // $5 per pound over 2 lbs
    }
    
    // Add distance-based cost (simplified calculation)
    const distance = this.calculateDistance(fromZip, toZip);
    if (distance > 500) { // Over 500 miles
      baseCost += 15;
    } else if (distance > 100) { // Over 100 miles
      baseCost += 8;
    }
    
    // Add insurance cost for high-value items
    if (packageDetails.insuranceRequired && packageDetails.declaredValue > 10000) {
      baseCost += 20; // Additional insurance
    }
    
    // Add fragile handling fee
    if (packageDetails.fragile) {
      baseCost += 10;
    }
    
    return Math.round(baseCost);
  }

  /**
   * Calculate estimated delivery date
   */
  calculateEstimatedDelivery(
    shippingMethod: ShippingMethod,
    shipDate: Date = new Date()
  ): Date {
    const deliveryDate = new Date(shipDate);
    const days = parseInt(shippingMethod.estimatedDays.split('-')[1]) || 3;
    
    // Add business days (skip weekends)
    let businessDaysAdded = 0;
    while (businessDaysAdded < days) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        businessDaysAdded++;
      }
    }
    
    return deliveryDate;
  }

  /**
   * Get shipping methods by criteria
   */
  getShippingMethodsByCriteria(criteria: {
    maxCost?: number;
    maxDays?: number;
    requireTracking?: boolean;
    requireSignature?: boolean;
    requireInsurance?: boolean;
  }): ShippingMethod[] {
    let methods = this.getShippingMethods();
    
    if (criteria.maxCost !== undefined) {
      methods = methods.filter(m => m.cost <= criteria.maxCost!);
    }
    
    if (criteria.maxDays !== undefined) {
      methods = methods.filter(m => {
        const days = parseInt(m.estimatedDays.split('-')[1]) || 10;
        return days <= criteria.maxDays!;
      });
    }
    
    if (criteria.requireTracking) {
      methods = methods.filter(m => m.trackingIncluded);
    }
    
    if (criteria.requireSignature) {
      methods = methods.filter(m => m.signatureRequired);
    }
    
    if (criteria.requireInsurance) {
      methods = methods.filter(m => m.insuranceIncluded);
    }
    
    return methods;
  }

  /**
   * Get recommended shipping method for package
   */
  getRecommendedShippingMethod(
    packageDetails: PackageDetails,
    fromZip: string,
    toZip: string,
    urgency: 'standard' | 'fast' | 'urgent' = 'standard'
  ): ShippingMethod {
    const methods = this.getShippingMethods();
    
    // Filter by urgency
    let filteredMethods = methods;
    if (urgency === 'urgent') {
      filteredMethods = methods.filter(m => m.id === 'overnight');
    } else if (urgency === 'fast') {
      filteredMethods = methods.filter(m => ['express', 'overnight'].includes(m.id));
    }
    
    // Score methods based on package requirements
    const scoredMethods = filteredMethods.map(method => {
      let score = 0;
      
      // Cost efficiency
      const cost = this.calculateShippingCost(packageDetails, method, fromZip, toZip);
      score += (100 - cost) / 10; // Lower cost = higher score
      
      // Speed preference
      if (urgency === 'urgent' && method.id === 'overnight') {
        score += 20;
      } else if (urgency === 'fast' && method.id === 'express') {
        score += 15;
      }
      
      // Package protection
      if (packageDetails.fragile && method.signatureRequired) {
        score += 10;
      }
      
      if (packageDetails.declaredValue > 10000 && method.insuranceIncluded) {
        score += 15;
      }
      
      return { method, score, cost };
    });
    
    // Return highest scored method
    scoredMethods.sort((a, b) => b.score - a.score);
    return scoredMethods[0].method;
  }

  /**
   * Save user address
   */
  saveUserAddress(userId: string, address: Address, type: 'shipping' | 'billing' = 'shipping'): void {
    const addresses = this.getUserAddresses(userId);
    const addressKey = `${type}_${userId}`;
    
    addresses[addressKey] = address;
    this.saveUserAddresses(userId, addresses);
  }

  /**
   * Get user addresses
   */
  getUserAddresses(userId: string): Record<string, Address> {
    const data = localStorage.getItem(`${this.ADDRESSES_KEY}_${userId}`);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  }

  /**
   * Get user address by type
   */
  getUserAddressByType(userId: string, type: 'shipping' | 'billing'): Address | null {
    const addresses = this.getUserAddresses(userId);
    return addresses[`${type}_${userId}`] || null;
  }

  /**
   * Validate address
   */
  validateAddress(address: Address): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!address.name || address.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!address.street || address.street.trim().length < 5) {
      errors.push('Street address must be at least 5 characters long');
    }
    
    if (!address.city || address.city.trim().length < 2) {
      errors.push('City must be at least 2 characters long');
    }
    
    if (!address.state || address.state.trim().length < 2) {
      errors.push('State must be at least 2 characters long');
    }
    
    if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
      errors.push('ZIP code must be in valid format (e.g., 12345 or 12345-6789)');
    }
    
    if (!address.country || address.country.trim().length < 2) {
      errors.push('Country must be at least 2 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create shipping label (simulated)
   */
  createShippingLabel(
    fromAddress: Address,
    toAddress: Address,
    packageDetails: PackageDetails,
    shippingMethod: ShippingMethod
  ): { trackingNumber: string; labelUrl: string; cost: number } {
    // Generate tracking number
    const trackingNumber = this.generateTrackingNumber();
    
    // Calculate cost
    const cost = this.calculateShippingCost(packageDetails, shippingMethod, fromAddress.zipCode, toAddress.zipCode);
    
    // Simulate label creation
    const labelUrl = `https://shipping.example.com/labels/${trackingNumber}`;
    
    // Save to shipping history
    this.saveShippingHistory({
      trackingNumber,
      fromAddress,
      toAddress,
      packageDetails,
      shippingMethod,
      cost,
      createdAt: new Date(),
      estimatedDelivery: this.calculateEstimatedDelivery(shippingMethod)
    });
    
    return {
      trackingNumber,
      labelUrl,
      cost
    };
  }

  /**
   * Track shipment (simulated)
   */
  trackShipment(trackingNumber: string): {
    status: string;
    location: string;
    lastUpdate: Date;
    estimatedDelivery: Date;
    events: {
      timestamp: Date;
      location: string;
      description: string;
    }[];
  } {
    // Simulate tracking data
    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    
    return {
      status: 'In Transit',
      location: 'Distribution Center',
      lastUpdate: now,
      estimatedDelivery,
      events: [
        {
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          location: 'Origin Facility',
          description: 'Package picked up by carrier'
        },
        {
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          location: 'Sorting Facility',
          description: 'Package sorted and routed'
        },
        {
          timestamp: now,
          location: 'Distribution Center',
          description: 'Package arrived at destination facility'
        }
      ]
    };
  }

  /**
   * Get shipping history for user
   */
  getUserShippingHistory(userId: string): any[] {
    const data = localStorage.getItem(`${this.SHIPPING_HISTORY_KEY}_${userId}`);
    if (data) {
      const history = JSON.parse(data);
      return history.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        estimatedDelivery: new Date(item.estimatedDelivery)
      }));
    }
    return [];
  }

  // Private helper methods
  private calculateDistance(fromZip: string, toZip: string): number {
    // Simplified distance calculation - in production, this would use a real API
    const fromNum = parseInt(fromZip.substring(0, 3));
    const toNum = parseInt(toZip.substring(0, 3));
    return Math.abs(fromNum - toNum) * 10; // Rough estimate
  }

  private generateTrackingNumber(): string {
    const prefix = '1Z';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).substring(0, 6).toUpperCase();
    return `${prefix}${random}${timestamp}`;
  }

  private initializeShippingMethods(): void {
    const existingMethods = localStorage.getItem(this.SHIPPING_METHODS_KEY);
    if (!existingMethods) {
      localStorage.setItem(this.SHIPPING_METHODS_KEY, JSON.stringify(this.DEFAULT_SHIPPING_METHODS));
    }
  }

  private saveUserAddresses(userId: string, addresses: Record<string, Address>): void {
    try {
      localStorage.setItem(`${this.ADDRESSES_KEY}_${userId}`, JSON.stringify(addresses));
    } catch (error) {
      console.error('Failed to save user addresses:', error);
    }
  }

  private saveShippingHistory(historyItem: any): void {
    try {
      const userId = 'default'; // In real app, this would come from auth service
      const history = this.getUserShippingHistory(userId);
      history.push(historyItem);
      localStorage.setItem(`${this.SHIPPING_HISTORY_KEY}_${userId}`, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save shipping history:', error);
    }
  }
}
