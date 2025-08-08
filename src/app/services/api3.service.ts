import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthenticationRequest {
  transactionId: string;
  authenticator: string;
  watchDetails: string;
  sellerAddress: string;
  buyerAddress: string;
  watchPrice: number;
  authenticationFee: number;
  shippingCost: number;
}

export interface AuthenticationResult {
  transactionId: string;
  isAuthentic: boolean;
  result: string;
  authenticator: string;
  timestamp: Date;
}

export interface Api3Config {
  endpoint: string;
  chainId: number; // 137 for Polygon
  apiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class Api3Service {
  private config: Api3Config = {
    endpoint: 'https://api3.io/authentication',
    chainId: 137, // Polygon
    apiKey: '' // Will be set from environment
  };

  constructor(private http: HttpClient) {
    // Load configuration from environment
    this.loadConfig();
  }

  private loadConfig(): void {
    // Load API3 configuration from environment
    // This will be set up in environment files
  }

  /**
   * Request authentication for a watch
   */
  requestAuthentication(request: AuthenticationRequest): Observable<any> {
    return this.http.post(`${this.config.endpoint}/request`, {
      ...request,
      chainId: this.config.chainId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get authentication result
   */
  getAuthenticationResult(transactionId: string): Observable<AuthenticationResult> {
    return this.http.get<AuthenticationResult>(`${this.config.endpoint}/result/${transactionId}`);
  }

  /**
   * Update smart contract with authentication result
   */
  updateSmartContract(result: AuthenticationResult): Observable<any> {
    return this.http.post(`${this.config.endpoint}/update-contract`, {
      ...result,
      chainId: this.config.chainId
    });
  }

  /**
   * Get available authentication partners
   */
  getAuthenticationPartners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.config.endpoint}/partners`);
  }

  /**
   * Get partner details and pricing
   */
  getPartnerDetails(partnerName: string): Observable<any> {
    return this.http.get<any>(`${this.config.endpoint}/partners/${partnerName}`);
  }

  /**
   * Monitor transaction status
   */
  monitorTransaction(transactionId: string): Observable<any> {
    return this.http.get<any>(`${this.config.endpoint}/monitor/${transactionId}`);
  }

  /**
   * Handle failed authentication
   */
  handleFailedAuthentication(transactionId: string, reason: string): Observable<any> {
    return this.http.post(`${this.config.endpoint}/failed`, {
      transactionId,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(address: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.config.endpoint}/history/${address}`);
  }

  /**
   * Validate authentication partner
   */
  validatePartner(partnerName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.config.endpoint}/validate/${partnerName}`);
  }

  /**
   * Get estimated costs for authentication
   */
  getEstimatedCosts(partnerName: string, watchType: string): Observable<any> {
    return this.http.get<any>(`${this.config.endpoint}/costs/${partnerName}/${watchType}`);
  }
}
