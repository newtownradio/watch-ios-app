import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { AuthorizationService } from '../../services/authorization.service';
import { StripeService, StripePaymentResult } from '../../services/stripe.service';
import { ShippingCalculatorComponent } from '../../components/shipping-calculator/shipping-calculator.component';
import { PackageTrackingComponent } from '../../components/package-tracking/package-tracking.component';
import { StripePaymentComponent } from '../../components/stripe-payment/stripe-payment.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ShippingCalculatorComponent, PackageTrackingComponent, StripePaymentComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);
  private dataService = inject(DataPersistenceService);
  private authService = inject(AuthorizationService);
  private stripeService = inject(StripeService);

  orders: Order[] = [];
  userRole: 'buyer' | 'seller' = 'buyer';
  selectedOrder: Order | null = null;
  showShippingCalculator = false;
  showPackageTracking = false;
  showPaymentForm = false;
  showReturnForm = false;
  currentPaymentAmount = 0;
  returnReason = '';
  selectedReturnType: 'item_mismatch' | 'buyer_remorse' | 'damaged_in_transit' | 'not_as_described' = 'buyer_remorse';

  ngOnInit() {
    this.loadUserOrders();
    // Check for expired return windows
    this.orderService.checkReturnWindowExpiry();
  }

  loadUserOrders() {
    const currentUser = this.dataService.getCurrentUser();
    if (currentUser) {
      const role = this.authService.getUserRole();
      this.userRole = (role === 'buyer' || role === 'seller') ? role : 'buyer';
      this.orders = this.orderService.getUserOrders(currentUser.id, this.userRole);
    }
  }

  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.showShippingCalculator = false;
    this.showPackageTracking = false;
  }

  toggleShippingCalculator() {
    this.showShippingCalculator = !this.showShippingCalculator;
    this.showPackageTracking = false;
  }

  togglePackageTracking() {
    this.showPackageTracking = !this.showPackageTracking;
    this.showShippingCalculator = false;
  }

  togglePaymentForm() {
    this.showPaymentForm = !this.showPaymentForm;
    this.showShippingCalculator = false;
    this.showPackageTracking = false;
  }

  async initiatePayment(order: Order) {
    if (order.status === 'pending_payment') {
      this.currentPaymentAmount = order.finalPrice * 100; // Convert to cents
      this.selectedOrder = order;
      this.showPaymentForm = true;
      
      // Create payment intent for winning bid
      const result = await this.stripeService.createWinningBidPaymentIntent(
        order.id,
        order.listingId,
        order.buyerId,
        order.sellerId,
        order.finalPrice,
        150 // Default verification cost
      );

      if (!result.success) {
        console.error('Failed to create payment intent:', result.error);
      }
    }
  }

  onPaymentSuccess(result: StripePaymentResult) {
    console.log('Payment successful:', result);
    // Update order status to payment confirmed
    if (this.selectedOrder) {
      this.orderService.confirmPayment(this.selectedOrder.id);
      this.loadUserOrders(); // Refresh orders
    }
    this.showPaymentForm = false;
  }

  onPaymentError(result: StripePaymentResult) {
    console.error('Payment failed:', result);
    // Handle payment error
    this.showPaymentForm = false;
  }

  toggleReturnForm() {
    this.showReturnForm = !this.showReturnForm;
    this.showShippingCalculator = false;
    this.showPackageTracking = false;
    this.showPaymentForm = false;
  }

  async confirmItemReceived() {
    if (this.selectedOrder) {
      const result = await this.orderService.confirmItemReceived(this.selectedOrder.id);
      if (result.success) {
        // Release escrow funds to seller
        await this.stripeService.releaseEscrowFunds(this.selectedOrder.id, 'buyer_confirmation');
        this.loadUserOrders(); // Refresh orders
        this.showReturnForm = false;
      }
    }
  }

  async requestReturn() {
    if (this.selectedOrder && this.returnReason.trim()) {
      const result = await this.orderService.requestReturn(
        this.selectedOrder.id, 
        this.returnReason.trim(),
        this.selectedReturnType
      );
      if (result.success) {
        this.loadUserOrders(); // Refresh orders
        this.showReturnForm = false;
        this.returnReason = '';
        this.selectedReturnType = 'buyer_remorse';
      }
    }
  }

  getReturnWindowStatus(order: Order): { status: string; timeRemaining?: string; canConfirm: boolean; canReturn: boolean } {
    if (order.status === 'delivered') {
      return { status: 'Ready to start inspection period', canConfirm: false, canReturn: false };
    }
    
    if (order.status === 'inspection_period') {
      const remaining = this.orderService.getReturnWindowRemainingTime(order.id);
      if (remaining.expired) {
        return { status: 'Inspection period expired', canConfirm: false, canReturn: false };
      }
      
      const timeRemaining = `${remaining.hours}h ${remaining.minutes}m remaining`;
      return { 
        status: 'Inspection period active', 
        timeRemaining, 
        canConfirm: true, 
        canReturn: true 
      };
    }
    
    if (order.status === 'return_requested') {
      return { status: 'Return requested', canConfirm: false, canReturn: false };
    }
    
    if (order.status === 'returned') {
      return { status: 'Item returned', canConfirm: false, canReturn: false };
    }
    
    if (order.status === 'completed') {
      return { status: 'Order completed', canConfirm: false, canReturn: false };
    }
    
    return { status: 'Not ready for inspection', canConfirm: false, canReturn: false };
  }

  canStartReturnWindow(order: Order): boolean {
    return this.userRole === 'seller' && 
           order.status === 'delivered' && 
           !order.returnWindowStart;
  }

  canShowReturnActions(order: Order): boolean {
    return this.userRole === 'buyer' && 
           order.status === 'inspection_period';
  }

  getReturnShippingInfo(order: Order): { message: string; sellerPays: boolean; cost: number } {
    if (order.returnType === 'item_mismatch' || order.returnType === 'not_as_described') {
      return {
        message: 'Seller pays return shipping due to item mismatch/description issues',
        sellerPays: true,
        cost: order.returnShippingCost || 25
      };
    } else {
      return {
        message: 'Buyer pays return shipping',
        sellerPays: false,
        cost: order.returnShippingCost || 25
      };
    }
  }

  getStatusColor(status: Order['status']): string {
    switch (status) {
      case 'pending_payment': return '#ff9800';
      case 'payment_confirmed': return '#2196f3';
      case 'authentication_in_progress': return '#9c27b0';
      case 'authenticated': return '#4caf50';
      case 'shipped': return '#2196f3';
      case 'delivered': return '#4caf50';
      case 'inspection_period': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'return_requested': return '#f44336';
      case 'returned': return '#9e9e9e';
      default: return '#757575';
    }
  }

  getStatusIcon(status: Order['status']): string {
    switch (status) {
      case 'pending_payment': return '💳';
      case 'payment_confirmed': return '✅';
      case 'authentication_in_progress': return '🔍';
      case 'authenticated': return '✅';
      case 'shipped': return '📦';
      case 'delivered': return '📦';
      case 'inspection_period': return '⏰';
      case 'completed': return '🎉';
      case 'cancelled': return '🚫';
      case 'return_requested': return '↩️';
      case 'returned': return '📦';
      default: return '❓';
    }
  }

  canShowShippingCalculator(order: Order): boolean {
    return this.userRole === 'seller' && 
           order.status === 'authenticated' && 
           !order.trackingNumber;
  }

    canShowPackageTracking(order: Order): boolean {
    return !!order.trackingNumber &&
           (order.status === 'shipped' || 
            order.status === 'delivered');
  }

  getOrderProgress(order: Order): number {
    const statusOrder = [
      'pending_payment',
      'payment_confirmed', 
      'authentication_in_progress',
      'authenticated',
      'shipped',
      'delivered',
      'inspection_period',
      'completed'
    ];
    
    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  }
}
