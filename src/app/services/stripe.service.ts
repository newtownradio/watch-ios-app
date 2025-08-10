import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateCustomerRequest { email: string; name?: string; }
export interface SetupIntentRequest { customerId: string; }
export interface PaymentIntentRequest {
  amount: number; // cents
  currency?: string;
  customerId: string;
  metadata?: Record<string, string>;
}
export interface CaptureRequest { paymentIntentId: string; amountToCapture?: number; }
export interface CancelRequest { paymentIntentId: string; }
export interface RefundRequest { chargeId?: string; paymentIntentId?: string; amount?: number; }
export interface PenaltyRequest { customerId: string; amount: number; currency?: string; reason?: string; }

@Injectable({ providedIn: 'root' })
export class StripeService {
  private readonly baseUrl = environment.apiUrl?.replace(/\/$/, '') || '';

  constructor(private http: HttpClient) {}

  createCustomer(body: CreateCustomerRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/stripe/create-customer`, body);
  }

  createSetupIntent(body: SetupIntentRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/stripe/setup-intent`, body);
  }

  createPaymentIntent(body: PaymentIntentRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/stripe/payment-intent`, body);
  }

  capturePayment(body: CaptureRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/stripe/capture`, body);
  }

  cancelPayment(body: CancelRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/stripe/cancel`, body);
  }

  refund(body: RefundRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/stripe/refund`, body);
  }

  chargePenalty(body: PenaltyRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/stripe/penalty`, body);
  }
}


