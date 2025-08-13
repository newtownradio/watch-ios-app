import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeElement, PaymentIntent, PaymentMethod } from '@stripe/stripe-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataPersistenceService } from './data-persistence.service';
import { PricingService } from './pricing.service';

export interface StripePaymentIntent {
  id: string;
  amount: number;
  status: string;
  client_secret: string;
  created: number;
  currency: string;
  metadata: {
    orderId?: string;
    listingId?: string;
    buyerId?: string;
    sellerId?: string;
    type: 'bid_authorization' | 'winning_bid_payment' | 'listing_fee' | 'commission';
  };
}

export interface StripePaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  message: string;
}

export interface StripeRefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentIntentSubject = new BehaviorSubject<StripePaymentIntent | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Observable getters
  get paymentIntent$(): Observable<StripePaymentIntent | null> {
    return this.paymentIntentSubject.asObservable();
  }

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  constructor(
    private dataService: DataPersistenceService,
    private pricingService: PricingService
  ) {
    this.initializeStripe();
  }

  /**
   * Initialize Stripe with your publishable key
   * Replace 'your_publishable_key' with your actual Stripe publishable key
   */
  private async initializeStripe(): Promise<void> {
    try {
      this.stripe = await loadStripe('your_publishable_key');
      if (this.stripe) {
        console.log('Stripe initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  /**
   * Create a payment intent for bid authorization
   * This holds funds when a buyer places a bid
   */
  async createBidAuthorizationIntent(
    listingId: string,
    buyerId: string,
    bidAmount: number,
    verificationCost: number
  ): Promise<StripePaymentResult> {
    try {
      this.isLoadingSubject.next(true);

      // Calculate total amount including fees
      const totalAmount = bidAmount + verificationCost;
      
      // Create payment intent on your backend
      const paymentIntent = await this.createPaymentIntent({
        amount: totalAmount,
        currency: 'usd',
        metadata: {
          listingId,
          buyerId,
          type: 'bid_authorization'
        },
        description: `Bid authorization for listing ${listingId}`
      });

      if (paymentIntent) {
        this.paymentIntentSubject.next(paymentIntent);
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          message: 'Bid authorization created successfully'
        };
      }

      return {
        success: false,
        error: 'PAYMENT_INTENT_CREATION_FAILED',
        message: 'Failed to create payment intent'
      };

    } catch (error) {
      console.error('Error creating bid authorization:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Payment processing error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Create a payment intent for winning bid payment
   * This processes the actual payment when a bid is accepted
   */
  async createWinningBidPaymentIntent(
    orderId: string,
    listingId: string,
    buyerId: string,
    sellerId: string,
    finalPrice: number,
    verificationCost: number
  ): Promise<StripePaymentResult> {
    try {
      this.isLoadingSubject.next(true);

      // Calculate total amount with all fees
      const pricing = this.pricingService.calculatePricing(finalPrice, 'watchcsa'); // Default partner
      const totalAmount = pricing.totalAmount;

      // Create payment intent on your backend
      const paymentIntent = await this.createPaymentIntent({
        amount: totalAmount,
        currency: 'usd',
        metadata: {
          orderId,
          listingId,
          buyerId,
          sellerId,
          type: 'winning_bid_payment'
        },
        description: `Payment for order ${orderId}`
      });

      if (paymentIntent) {
        this.paymentIntentSubject.next(paymentIntent);
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          message: 'Winning bid payment intent created successfully'
        };
      }

      return {
        success: false,
        error: 'PAYMENT_INTENT_CREATION_FAILED',
        message: 'Failed to create payment intent'
      };

    } catch (error) {
      console.error('Error creating winning bid payment intent:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Payment processing error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Create a payment intent for listing fees
   * This collects fees from sellers when they create listings
   */
  async createListingFeePaymentIntent(
    sellerId: string,
    verificationPartnerId: string
  ): Promise<StripePaymentResult> {
    try {
      this.isLoadingSubject.next(true);

      // Get verification partner cost
      const partners = this.pricingService.getVerificationPartners();
      const partner = partners.find(p => p.id === verificationPartnerId);
      const verificationCost = partner ? partner.cost : 150;

      // Create payment intent on your backend
      const paymentIntent = await this.createPaymentIntent({
        amount: verificationCost,
        currency: 'usd',
        metadata: {
          sellerId,
          type: 'listing_fee'
        },
        description: 'Listing fee payment'
      });

      if (paymentIntent) {
        this.paymentIntentSubject.next(paymentIntent);
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          message: 'Listing fee payment intent created successfully'
        };
      }

      return {
        success: false,
        error: 'PAYMENT_INTENT_CREATION_FAILED',
        message: 'Failed to create payment intent'
      };

    } catch (error) {
      console.error('Error creating listing fee payment intent:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Payment processing error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Confirm a payment intent
   * This completes the payment process
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<StripePaymentResult> {
    try {
      this.isLoadingSubject.next(true);

      if (!this.stripe) {
        return {
          success: false,
          error: 'STRIPE_NOT_INITIALIZED',
          message: 'Stripe not initialized'
        };
      }

      // Confirm the payment intent
      const result = await this.stripe.confirmCardPayment(paymentIntentId, {
        payment_method: paymentMethodId
      });

      if (result.error) {
        return {
          success: false,
          error: 'PAYMENT_CONFIRMATION_FAILED',
          message: result.error.message || 'Payment confirmation failed'
        };
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntentId: result.paymentIntent.id,
          message: 'Payment confirmed successfully'
        };
      }

      return {
        success: false,
        error: 'PAYMENT_STATUS_UNKNOWN',
        message: 'Payment status unknown'
      };

    } catch (error) {
      console.error('Error confirming payment intent:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Payment confirmation error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Process seller payout after successful delivery and 72-hour return window
   * This releases funds from escrow to the seller
   */
  async processSellerPayout(
    orderId: string,
    sellerId: string,
    payoutAmount: number
  ): Promise<StripePaymentResult> {
    try {
      this.isLoadingSubject.next(true);

      // This would typically call your backend to process the payout
      // For now, we'll simulate the process
      const payoutResult = await this.simulatePayout(orderId, sellerId, payoutAmount);

      if (payoutResult.success) {
        return {
          success: true,
          paymentIntentId: payoutResult.payoutId,
          message: 'Seller payout processed successfully. Funds released from escrow after 72-hour return window.'
        };
      }

      return {
        success: false,
        error: 'PAYOUT_FAILED',
        message: 'Failed to process seller payout'
      };

    } catch (error) {
      console.error('Error processing seller payout:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Payout processing error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Release funds from escrow after buyer confirmation or return window expiry
   */
  async releaseEscrowFunds(
    orderId: string,
    type: 'buyer_confirmation' | 'return_window_expiry'
  ): Promise<StripePaymentResult> {
    try {
      this.isLoadingSubject.next(true);

      // This would typically call your backend to release escrow funds
      // For now, we'll simulate the process
      const releaseResult = await this.simulateEscrowRelease(orderId, type);

      if (releaseResult.success) {
        const message = type === 'buyer_confirmation' 
          ? 'Funds released from escrow after buyer confirmation'
          : 'Funds released from escrow after return window expiry';
        
        return {
          success: true,
          paymentIntentId: releaseResult.releaseId,
          message
        };
      }

      return {
        success: false,
        error: 'ESCROW_RELEASE_FAILED',
        message: 'Failed to release escrow funds'
      };

    } catch (error) {
      console.error('Error releasing escrow funds:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Escrow release error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Process refund for returned items with return shipping consideration
   */
  async processRefundForReturn(
    orderId: string,
    buyerId: string,
    refundAmount: number,
    returnShippingCost: number,
    shippingPaidBy: 'buyer' | 'seller'
  ): Promise<StripePaymentResult> {
    try {
      this.isLoadingSubject.next(true);

      // This would typically call your backend to process the refund
      // For now, we'll simulate the process
      const refundResult = await this.simulateRefund(orderId, refundAmount);

      if (refundResult.success) {
        let message = 'Refund processed successfully for returned item.';
        
        if (shippingPaidBy === 'seller') {
          message += ` Seller paid return shipping cost ($${returnShippingCost}).`;
        } else {
          message += ` Return shipping cost ($${returnShippingCost}) deducted from refund.`;
        }

        return {
          success: true,
          paymentIntentId: refundResult.refundId,
          message
        };
      }

      return {
        success: false,
        error: 'REFUND_FAILED',
        message: 'Failed to process refund'
      };

    } catch (error) {
      console.error('Error processing refund for return:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Refund processing error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Refund a payment
   * This handles bid cancellations and returns
   */
  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<StripeRefundResult> {
    try {
      this.isLoadingSubject.next(true);

      // This would typically call your backend to process the refund
      // For now, we'll simulate the process
      const refundResult = await this.simulateRefund(paymentIntentId, amount);

      if (refundResult.success) {
        return {
          success: true,
          refundId: refundResult.refundId,
          message: 'Payment refunded successfully'
        };
      }

      return {
        success: false,
        error: 'REFUND_FAILED',
        message: 'Failed to refund payment'
      };

    } catch (error) {
      console.error('Error refunding payment:', error);
      return {
        success: false,
        error: 'STRIPE_ERROR',
        message: 'Refund processing error occurred'
      };
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Get current payment intent
   */
  getCurrentPaymentIntent(): StripePaymentIntent | null {
    return this.paymentIntentSubject.value;
  }

  /**
   * Clear current payment intent
   */
  clearPaymentIntent(): void {
    this.paymentIntentSubject.next(null);
  }

  /**
   * Check if Stripe is initialized
   */
  isStripeInitialized(): boolean {
    return this.stripe !== null;
  }

  /**
   * Simulate payment intent creation (replace with actual backend call)
   */
  private async createPaymentIntent(params: {
    amount: number;
    currency: string;
    metadata: any;
    description: string;
  }): Promise<StripePaymentIntent | null> {
    // This is a simulation - replace with actual backend API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: params.amount,
          status: 'requires_payment_method',
          client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          created: Date.now(),
          currency: params.currency,
          metadata: params.metadata
        });
      }, 1000);
    });
  }

  /**
   * Simulate payout processing (replace with actual backend call)
   */
  private async simulatePayout(
    orderId: string,
    sellerId: string,
    amount: number
  ): Promise<{ success: boolean; payoutId?: string }> {
    // This is a simulation - replace with actual backend API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          payoutId: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }, 1000);
    });
  }

  /**
   * Simulate refund processing (replace with actual backend call)
   */
  private async simulateRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<{ success: boolean; refundId?: string }> {
    // This is a simulation - replace with actual backend API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          refundId: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }, 1000);
    });
  }

  /**
   * Simulate escrow release (replace with actual backend call)
   */
  private async simulateEscrowRelease(
    orderId: string,
    type: 'buyer_confirmation' | 'return_window_expiry'
  ): Promise<{ success: boolean; releaseId?: string }> {
    // This is a simulation - replace with actual backend API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          releaseId: `er_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }, 1000);
    });
  }
}


