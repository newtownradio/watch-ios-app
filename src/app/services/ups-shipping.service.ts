import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private readonly baseUrl = environment.ups.baseUrl;
  private readonly apiKey = environment.ups.apiKey;
  private readonly username = environment.ups.username;
  private readonly password = environment.ups.password;
  private readonly accountNumber = environment.ups.accountNumber;
  private readonly testMode = environment.ups.testMode;

  constructor(private http: HttpClient) {}

  /**
   * Check if UPS API is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey !== 'YOUR_UPS_API_KEY' && 
           this.username !== 'YOUR_UPS_USERNAME' && 
           this.password !== 'YOUR_UPS_PASSWORD' && 
           this.accountNumber !== 'YOUR_UPS_ACCOUNT_NUMBER';
  }

  /**
   * Get shipping rates for a package
   */
  getShippingRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageDetails: PackageDetails
  ): Observable<ShippingRate[]> {
    if (!this.isConfigured()) {
      console.warn('UPS API not configured, using mock data');
      return of(this.getMockShippingRates());
    }

    const requestBody = {
      RateRequest: {
        Request: {
          RequestOption: 'Shop',
          TransactionReference: {
            CustomerContext: 'Watch Style iOS Shipping Rate Request'
          }
        },
        Shipment: {
          Shipper: {
            Address: {
              AddressLine: [fromAddress.address1, fromAddress.address2].filter(Boolean),
              City: fromAddress.city,
              StateProvinceCode: fromAddress.state,
              PostalCode: fromAddress.postalCode,
              CountryCode: fromAddress.country
            }
          },
          ShipTo: {
            Address: {
              AddressLine: [toAddress.address1, toAddress.address2].filter(Boolean),
              City: toAddress.city,
              StateProvinceCode: toAddress.state,
              PostalCode: toAddress.postalCode,
              CountryCode: toAddress.country
            }
          },
          ShipFrom: {
            Address: {
              AddressLine: [fromAddress.address1, fromAddress.address2].filter(Boolean),
              City: fromAddress.city,
              StateProvinceCode: fromAddress.state,
              PostalCode: fromAddress.postalCode,
              CountryCode: fromAddress.country
            }
          },
          Service: {
            Code: '03', // Ground
            Description: 'Ground'
          },
          Package: {
            PackagingType: {
              Code: '02', // Package
              Description: 'Package'
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'IN',
                Description: 'Inches'
              },
              Length: packageDetails.length.toString(),
              Width: packageDetails.width.toString(),
              Height: packageDetails.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'LBS',
                Description: 'Pounds'
              },
              Weight: packageDetails.weight.toString()
            }
          }
        }
      }
    };

    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.baseUrl}/rating/v1/Shop`, requestBody, { headers })
      .pipe(
        timeout(10000), // 10 second timeout
        retry(1), // Retry once on failure
        map(response => this.parseShippingRatesResponse(response)),
        catchError(error => {
          console.error('UPS API error:', error);
          return of(this.getMockShippingRates()); // Fallback to mock data
        })
      );
  }

  /**
   * Get authentication headers for UPS API
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'Username': this.username,
      'Password': this.password,
      'AccessLicenseNumber': this.apiKey
    });
  }

  /**
   * Parse UPS shipping rates response
   */
  private parseShippingRatesResponse(response: any): ShippingRate[] {
    try {
      if (!response.RateResponse || !response.RateResponse.RatedShipment) {
        return this.getMockShippingRates();
      }

      const rates: ShippingRate[] = [];
      const ratedShipments = Array.isArray(response.RateResponse.RatedShipment) 
        ? response.RateResponse.RatedShipment 
        : [response.RateResponse.RatedShipment];

      ratedShipments.forEach((shipment: any) => {
        if (shipment.Service && shipment.TotalCharges) {
          rates.push({
            serviceCode: shipment.Service.Code,
            serviceName: shipment.Service.Description || this.getServiceDescription(shipment.Service.Code),
            totalCharges: parseFloat(shipment.TotalCharges.MonetaryValue),
            deliveryDate: shipment.GuaranteedDelivery?.BusinessDaysInTransit 
              ? this.calculateDeliveryDateFromTransitDays(shipment.GuaranteedDelivery.BusinessDaysInTransit)
              : '3-5 business days',
            guaranteedDelivery: shipment.GuaranteedDelivery?.GuaranteedIndicator === 'Y',
            transitDays: shipment.GuaranteedDelivery?.BusinessDaysInTransit || 3
          });
        }
      });

      return rates.length > 0 ? rates : this.getMockShippingRates();
    } catch (error) {
      console.error('Error parsing UPS response:', error);
      return this.getMockShippingRates();
    }
  }

  /**
   * Get service description from service code
   */
  private getServiceDescription(serviceCode: string): string {
    const serviceMap: { [key: string]: string } = {
      '01': 'Next Day Air',
      '02': '2nd Day Air',
      '03': 'Ground',
      '12': '3 Day Select',
      '59': '2nd Day Air AM',
      '65': 'Saver'
    };
    return serviceMap[serviceCode] || 'Standard Service';
  }

  /**
   * Calculate delivery date from transit days
   */
  private calculateDeliveryDateFromTransitDays(transitDays: number): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + transitDays);
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    if (!this.isConfigured()) {
      console.warn('UPS API not configured, using mock data');
      return of(this.getMockShippingLabel(serviceCode));
    }

    const requestBody = {
      ShipmentRequest: {
        Request: {
          RequestOption: 'nonvalidate',
          TransactionReference: {
            CustomerContext: 'Watch Style iOS Shipping Label Request'
          }
        },
        Shipment: {
          Description: 'Luxury Watch',
          Shipper: {
            Name: fromAddress.name,
            AttentionName: fromAddress.name,
            Phone: {
              Number: fromAddress.phone || '555-555-5555'
            },
            Address: {
              AddressLine: [fromAddress.address1, fromAddress.address2].filter(Boolean),
              City: fromAddress.city,
              StateProvinceCode: fromAddress.state,
              PostalCode: fromAddress.postalCode,
              CountryCode: fromAddress.country
            }
          },
          ShipTo: {
            Name: toAddress.name,
            AttentionName: toAddress.name,
            Phone: {
              Number: toAddress.phone || '555-555-5555'
            },
            Address: {
              AddressLine: [toAddress.address1, toAddress.address2].filter(Boolean),
              City: toAddress.city,
              StateProvinceCode: toAddress.state,
              PostalCode: toAddress.postalCode,
              CountryCode: toAddress.country
            }
          },
          ShipFrom: {
            Name: fromAddress.name,
            AttentionName: fromAddress.name,
            Phone: {
              Number: fromAddress.phone || '555-555-5555'
            },
            Address: {
              AddressLine: [fromAddress.address1, fromAddress.address2].filter(Boolean),
              City: fromAddress.city,
              StateProvinceCode: fromAddress.state,
              PostalCode: fromAddress.postalCode,
              CountryCode: fromAddress.country
            }
          },
          Service: {
            Code: serviceCode,
            Description: this.getServiceDescription(serviceCode)
          },
          Package: {
            PackagingType: {
              Code: '02',
              Description: 'Package'
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'IN',
                Description: 'Inches'
              },
              Length: packageDetails.length.toString(),
              Width: packageDetails.width.toString(),
              Height: packageDetails.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'LBS',
                Description: 'Pounds'
              },
              Weight: packageDetails.weight.toString()
            }
          },
          PaymentInformation: {
            ShipmentCharge: {
              Type: '01',
              BillShipper: {
                AccountNumber: {
                  Value: this.accountNumber
                }
              }
            }
          }
        }
      }
    };

    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.baseUrl}/ship/v1/transactions`, requestBody, { headers })
      .pipe(
        timeout(15000), // 15 second timeout for label creation
        retry(1),
        map(response => this.parseUpsShipResponse(response)),
        catchError(error => {
          console.error('UPS Ship API error:', error);
          return of(this.getMockShippingLabel(serviceCode)); // Fallback to mock data
        })
      );
  }

  /**
   * Parse UPS ship response
   */
  private parseUpsShipResponse(response: any): ShippingLabel {
    try {
      if (!response.ShipmentResponse || !response.ShipmentResponse.ShipmentResults) {
        return this.getMockShippingLabel('03'); // Default to Ground
      }

      const shipmentResults = response.ShipmentResponse.ShipmentResults;
      const packageResults = shipmentResults.PackageResults;
      
      if (!packageResults || !packageResults.TrackingNumber) {
        return this.getMockShippingLabel('03');
      }

      return {
        trackingNumber: packageResults.TrackingNumber,
        labelUrl: packageResults.LabelImage?.GraphicImage || '',
        labelData: packageResults.LabelImage?.GraphicImage || '',
        estimatedDelivery: this.calculateDeliveryDateFromTransitDays(3), // Default 3 days
        serviceType: this.getServiceDescription(shipmentResults.Service?.Code || '03')
      };
    } catch (error) {
      console.error('Error parsing UPS ship response:', error);
      return this.getMockShippingLabel('03');
    }
  }

  /**
   * Track a package
   */
  trackPackage(trackingNumber: string): Observable<TrackingInfo> {
    if (!this.isConfigured()) {
      console.warn('UPS API not configured, using mock data');
      return of(this.getMockTrackingInfo(trackingNumber));
    }

    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.baseUrl}/track/v1/details/${trackingNumber}`, { headers })
      .pipe(
        timeout(10000),
        retry(1),
        map(response => this.parseTrackingResponse(response, trackingNumber)),
        catchError(error => {
          console.error('UPS Tracking API error:', error);
          return of(this.getMockTrackingInfo(trackingNumber)); // Fallback to mock data
        })
      );
  }

  /**
   * Parse UPS tracking response
   */
  private parseTrackingResponse(response: any, trackingNumber: string): TrackingInfo {
    try {
      if (!response.trackResponse || !response.trackResponse.shipment) {
        return this.getMockTrackingInfo(trackingNumber);
      }

      const shipment = response.trackResponse.shipment[0];
      const packageInfo = shipment.package[0];
      const activity = packageInfo.activity;

      if (!activity || !Array.isArray(activity)) {
        return this.getMockTrackingInfo(trackingNumber);
      }

      const events: TrackingEvent[] = activity.map((event: any) => ({
        timestamp: event.date + ' ' + event.time,
        location: event.location?.address?.city + ', ' + event.location?.address?.stateProvinceCode,
        status: event.status?.type,
        description: event.status?.description || 'Package updated'
      }));

      const latestEvent = events[0]; // Most recent event
      const estimatedDelivery = shipment.deliveryDate || '3-5 business days';

      return {
        trackingNumber,
        status: latestEvent?.status || 'In Transit',
        location: latestEvent?.location || 'Unknown',
        lastUpdate: latestEvent?.timestamp || new Date().toISOString(),
        estimatedDelivery,
        events
      };
    } catch (error) {
      console.error('Error parsing UPS tracking response:', error);
      return this.getMockTrackingInfo(trackingNumber);
    }
  }

  /**
   * Validate an address
   */
  validateAddress(address: ShippingAddress): Observable<ShippingAddress> {
    if (!this.isConfigured()) {
      console.warn('UPS API not configured, using mock validation');
      return of(address);
    }

    const requestBody = {
      XAVRequest: {
        Request: {
          RequestOption: '1',
          TransactionReference: {
            CustomerContext: 'Watch Style iOS Address Validation'
          }
        },
        AddressKeyFormat: {
          ConsigneeName: address.name,
          BuildingName: address.company,
          AddressLine: [address.address1, address.address2].filter(Boolean),
          Region: address.state,
          PoliticalDivision2: address.city,
          PoliticalDivision1: address.state,
          PostcodePrimaryLow: address.postalCode,
          CountryCode: address.country
        }
      }
    };

    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.baseUrl}/validation/v1/addresses`, requestBody, { headers })
      .pipe(
        timeout(8000),
        retry(1),
        map(response => this.parseAddressValidationResponse(response, address)),
        catchError(error => {
          console.error('UPS Address Validation API error:', error);
          return of(address); // Fallback to original address
        })
      );
  }

  /**
   * Parse UPS address validation response
   */
  private parseAddressValidationResponse(response: any, originalAddress: ShippingAddress): ShippingAddress {
    try {
      if (!response.XAVResponse || !response.XAVResponse.Candidate) {
        return originalAddress;
      }

      const candidate = response.XAVResponse.Candidate[0];
      if (!candidate.AddressKeyFormat) {
        return originalAddress;
      }

      const validatedAddress = candidate.AddressKeyFormat;
      
      return {
        name: originalAddress.name,
        company: validatedAddress.BuildingName || originalAddress.company,
        address1: validatedAddress.AddressLine?.[0] || originalAddress.address1,
        address2: validatedAddress.AddressLine?.[1] || originalAddress.address2,
        city: validatedAddress.PoliticalDivision2 || originalAddress.city,
        state: validatedAddress.PoliticalDivision1 || originalAddress.state,
        postalCode: validatedAddress.PostcodePrimaryLow || originalAddress.postalCode,
        country: validatedAddress.CountryCode || originalAddress.country,
        phone: originalAddress.phone,
        email: originalAddress.email
      };
    } catch (error) {
      console.error('Error parsing UPS address validation response:', error);
      return originalAddress;
    }
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
