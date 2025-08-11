import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ShippingAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface PackageDetails {
  weight: number; // in pounds
  length: number; // in inches
  width: number; // in inches
  height: number; // in inches
  declaredValue?: number; // declared value for insurance
}

export interface ShippingRate {
  serviceCode: string;
  serviceName: string;
  totalCharges: number;
  deliveryDate: string;
  guaranteedDelivery?: boolean;
  transitDays: number;
}

export interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  labelData: string; // base64 encoded label
  estimatedDelivery: string;
  serviceType: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  location: string;
  lastUpdate: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpsShippingService {
  private readonly baseUrl = 'https://wwwcie.ups.com/api'; // Use production URL for live
  private readonly apiKey = 'YOUR_UPS_API_KEY'; // Store in environment variables
  private readonly username = 'YOUR_UPS_USERNAME';
  private readonly password = 'YOUR_UPS_PASSWORD';
  private readonly accountNumber = 'YOUR_UPS_ACCOUNT_NUMBER';

  constructor(private http: HttpClient) {}

  /**
   * Get shipping rates for a package
   */
  getShippingRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageDetails: PackageDetails
  ): Observable<ShippingRate[]> {
    // For now, return mock data until UPS API credentials are configured
    return of(this.getMockShippingRates());
  }

  /**
   * Create a shipping label
   */
  createShippingLabel(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageDetails: PackageDetails,
    serviceCode: string
  ): Observable<ShippingLabel> {
    // Mock implementation until UPS API is configured
    return of(this.getMockShippingLabel(serviceCode));
  }

  /**
   * Track a package
   */
  trackPackage(trackingNumber: string): Observable<TrackingInfo> {
    // Mock implementation until UPS API is configured
    return of(this.getMockTrackingInfo(trackingNumber));
  }

  /**
   * Validate an address
   */
  validateAddress(address: ShippingAddress): Observable<ShippingAddress> {
    // Mock implementation until UPS API is configured
    return of(address);
  }

  /**
   * Calculate estimated delivery date
   */
  calculateDeliveryDate(
    fromZipCode: string,
    toZipCode: string,
    serviceCode: string
  ): string {
    // Mock calculation based on service type and distance
    const baseDate = new Date();
    const transitDays = this.getTransitDays(serviceCode);
    baseDate.setDate(baseDate.getDate() + transitDays);
    return baseDate.toISOString().split('T')[0];
  }

  /**
   * Get shipping service options
   */
  getAvailableServices(): ShippingRate[] {
    return [
      {
        serviceCode: '01',
        serviceName: 'UPS Next Day Air',
        totalCharges: 0,
        deliveryDate: '',
        guaranteedDelivery: true,
        transitDays: 1
      },
      {
        serviceCode: '02',
        serviceName: 'UPS 2nd Day Air',
        totalCharges: 0,
        deliveryDate: '',
        guaranteedDelivery: true,
        transitDays: 2
      },
      {
        serviceCode: '03',
        serviceName: 'UPS Ground',
        totalCharges: 0,
        deliveryDate: '',
        guaranteedDelivery: false,
        transitDays: 3
      },
      {
        serviceCode: '12',
        serviceName: 'UPS 3 Day Select',
        totalCharges: 0,
        deliveryDate: '',
        guaranteedDelivery: false,
        transitDays: 3
      },
      {
        serviceCode: '59',
        serviceName: 'UPS 2nd Day Air AM',
        totalCharges: 0,
        deliveryDate: '',
        guaranteedDelivery: true,
        transitDays: 2
      }
    ];
  }

  /**
   * Calculate shipping cost based on weight and distance
   */
  calculateShippingCost(
    weight: number,
    fromZipCode: string,
    toZipCode: string,
    serviceCode: string
  ): number {
    // Mock calculation - replace with actual UPS rate calculation
    const baseRate = this.getBaseRate(serviceCode);
    const weightMultiplier = weight * 0.5;
    const distanceMultiplier = this.calculateDistanceMultiplier(fromZipCode, toZipCode);
    
    return Math.round((baseRate + weightMultiplier) * distanceMultiplier * 100) / 100;
  }

  // Private helper methods

  private getTransitDays(serviceCode: string): number {
    const transitDaysMap: Record<string, number> = {
      '01': 1, // Next Day Air
      '02': 2, // 2nd Day Air
      '03': 3, // Ground
      '12': 3, // 3 Day Select
      '59': 2  // 2nd Day Air AM
    };
    return transitDaysMap[serviceCode] || 3;
  }

  private getBaseRate(serviceCode: string): number {
    const baseRates: Record<string, number> = {
      '01': 25.00, // Next Day Air
      '02': 18.00, // 2nd Day Air
      '03': 8.50,  // Ground
      '12': 15.00, // 3 Day Select
      '59': 22.00  // 2nd Day Air AM
    };
    return baseRates[serviceCode] || 8.50;
  }

  private calculateDistanceMultiplier(fromZip: string, toZip: string): number {
    // Mock distance calculation - replace with actual zip code distance calculation
    const fromNum = parseInt(fromZip.substring(0, 3));
    const toNum = parseInt(toZip.substring(0, 3));
    const distance = Math.abs(fromNum - toNum);
    
    if (distance <= 100) return 1.0;
    if (distance <= 300) return 1.2;
    if (distance <= 600) return 1.4;
    if (distance <= 1000) return 1.6;
    return 2.0;
  }

  // Mock data methods (remove when UPS API is integrated)

  private getMockShippingRates(): ShippingRate[] {
    const services = this.getAvailableServices();
    return services.map(service => ({
      ...service,
      totalCharges: this.calculateShippingCost(2, '10001', '90210', service.serviceCode),
      deliveryDate: this.calculateDeliveryDate('10001', '90210', service.serviceCode)
    }));
  }

  private getMockShippingLabel(serviceCode: string): ShippingLabel {
    const trackingNumber = '1Z' + Math.random().toString(36).substring(2, 15).toUpperCase();
    return {
      trackingNumber,
      labelUrl: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      labelData: 'mock_label_data_base64',
      estimatedDelivery: this.calculateDeliveryDate('10001', '90210', serviceCode),
      serviceType: this.getAvailableServices().find(s => s.serviceCode === serviceCode)?.serviceName || 'Unknown'
    };
  }

  private getMockTrackingInfo(trackingNumber: string): TrackingInfo {
    return {
      trackingNumber,
      status: 'In Transit',
      location: 'Memphis, TN',
      lastUpdate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          timestamp: new Date().toISOString(),
          location: 'Memphis, TN',
          status: 'In Transit',
          description: 'Package has left the UPS facility'
        },
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: 'New York, NY',
          status: 'Picked Up',
          description: 'Package picked up by UPS driver'
        }
      ]
    };
  }
}
