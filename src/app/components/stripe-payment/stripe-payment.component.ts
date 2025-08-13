import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService, StripePaymentIntent, StripePaymentResult } from '../../services/stripe.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stripe-payment.component.html',
  styleUrl: './stripe-payment.component.scss'
})
export class StripePaymentComponent implements OnInit, OnDestroy {
  @Input() paymentTitle: string = 'Complete Payment';
  @Input() paymentAmount: number = 0; // Amount in cents
  @Input() paymentButtonText: string = 'Pay Now';
  @Input() paymentType: 'bid_authorization' | 'winning_bid_payment' | 'listing_fee' = 'winning_bid_payment';
  
  @Output() paymentSuccess = new EventEmitter<StripePaymentResult>();
  @Output() paymentError = new EventEmitter<StripePaymentResult>();

  private stripeService = inject(StripeService);
  private subscription = new Subscription();

  email: string = '';
  name: string = '';
  isProcessing: boolean = false;
  paymentResult: StripePaymentResult | null = null;

  ngOnInit() {
    // Subscribe to payment intent changes
    this.subscription.add(
      this.stripeService.paymentIntent$.subscribe(intent => {
        if (intent) {
          this.initializeCardElement();
        }
      })
    );

    // Subscribe to loading state
    this.subscription.add(
      this.stripeService.isLoading$.subscribe(loading => {
        this.isProcessing = loading;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isFormValid(): boolean {
    return this.email.trim() !== '' && 
           this.name.trim() !== '' && 
           this.paymentAmount > 0;
  }

  async handlePayment() {
    if (!this.isFormValid()) {
      return;
    }

    try {
      this.isProcessing = true;
      
      // Get current payment intent
      const paymentIntent = this.stripeService.getCurrentPaymentIntent();
      if (!paymentIntent) {
        throw new Error('No payment intent found');
      }

      // Simulate payment confirmation (replace with actual Stripe confirmation)
      const result = await this.stripeService.confirmPaymentIntent(
        paymentIntent.id,
        'pm_simulated_payment_method'
      );

      this.paymentResult = result;
      
      if (result.success) {
        this.paymentSuccess.emit(result);
      } else {
        this.paymentError.emit(result);
      }

    } catch (error) {
      console.error('Payment error:', error);
      this.paymentResult = {
        success: false,
        error: 'PAYMENT_ERROR',
        message: 'An unexpected error occurred during payment'
      };
      this.paymentError.emit(this.paymentResult);
    } finally {
      this.isProcessing = false;
    }
  }

  private initializeCardElement() {
    // This would initialize the actual Stripe Card Element
    // For now, we'll show a placeholder
    console.log('Card element would be initialized here');
  }

  clearResult() {
    this.paymentResult = null;
    this.stripeService.clearPaymentIntent();
  }
}
