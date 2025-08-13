import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataPersistenceService } from './data-persistence.service';
import { AuthenticationService } from './authentication.service';

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  watchTitle: string;
  watchBrand?: string;
  watchModel?: string;
  finalPrice: number;
  authenticationRequestId: string;
  status: 'pending_bid' | 'pending_payment' | 'payment_confirmed' | 'authentication_in_progress' | 'authenticated' | 'shipped' | 'delivered' | 'inspection_period' | 'completed' | 'cancelled' | 'return_requested' | 'returned';
  createdAt: Date;
  updatedAt: Date;
  paymentConfirmedAt?: Date;
  authenticationCompletedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  buyerNotes?: string;
  sellerNotes?: string;
  // Return window tracking
  returnWindowStart?: Date;
  returnWindowEnd?: Date;
  returnRequestedAt?: Date;
  returnReason?: string;
  returnType?: 'item_mismatch' | 'buyer_remorse' | 'damaged_in_transit' | 'not_as_described';
  buyerConfirmationAt?: Date;
  returnWindowExpiredAt?: Date;
  returnShippingCost?: number;
  returnShippingPaidBy?: 'buyer' | 'seller';
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: Order;
  error?: string;
}

export interface OrderSummary {
  totalOrders: number;
  pendingPayment: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private activeOrderSubject = new BehaviorSubject<Order | null>(null);

  constructor(
    private dataService: DataPersistenceService,
    private authService: AuthenticationService
  ) {
    this.loadOrders();
  }

  // Observable getters
  get orders$(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  get activeOrder$(): Observable<Order | null> {
    return this.activeOrderSubject.asObservable();
  }

  /**
   * Create a new order after successful bid acceptance
   */
  async createOrder(
    listingId: string,
    buyerId: string,
    sellerId: string,
    finalPrice: number,
    authenticationRequestId: string
  ): Promise<OrderResponse> {
    try {
      const listing = this.dataService.getListingById(listingId);
      if (!listing) {
        return {
          success: false,
          message: 'Listing not found',
          error: 'LISTING_NOT_FOUND'
        };
      }

      const buyer = this.dataService.getUserById(buyerId);
      const seller = this.dataService.getUserById(sellerId);

      if (!buyer || !seller) {
        return {
          success: false,
          message: 'Buyer or seller not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Create order
      const order: Order = {
        id: this.generateId(),
        listingId,
        buyerId,
        buyerName: buyer.name,
        sellerId,
        sellerName: seller.name,
        watchTitle: listing.title,
        watchBrand: listing.brand,
        watchModel: listing.model,
        finalPrice,
        authenticationRequestId,
        status: 'pending_payment',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save order
      this.dataService.saveOrder(order);
      this.addOrderToList(order);

      // Update listing status
      listing.status = 'sold';
      this.dataService.updateListing(listing);

      return {
        success: true,
        message: 'Order created successfully',
        data: order
      };

    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: 'Failed to create order',
        error: 'CREATE_ORDER_ERROR'
      };
    }
  }

  /**
   * Confirm payment for an order
   */
  async confirmPayment(orderId: string): Promise<OrderResponse> {
    try {
      const order = this.dataService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND'
        };
      }

      if (order.status !== 'pending_payment') {
        return {
          success: false,
          message: 'Order is not in pending payment status',
          error: 'INVALID_ORDER_STATUS'
        };
      }

      // Update order status
      order.status = 'payment_confirmed';
      order.paymentConfirmedAt = new Date();
      order.updatedAt = new Date();
      this.dataService.updateOrder(order);
      this.updateOrderInList(order);

      // Start authentication process
              await this.authService.updateAuthenticationStatus(
          order.authenticationRequestId,
          'in-progress'
        );

      return {
        success: true,
        message: 'Payment confirmed. Authentication process started.',
        data: order
      };

    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        message: 'Failed to confirm payment',
        error: 'CONFIRM_PAYMENT_ERROR'
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<OrderResponse> {
    try {
      const order = this.dataService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND'
        };
      }

      // Update order
      order.status = status;
      order.updatedAt = new Date();

      // Set specific timestamps based on status
      switch (status) {
        case 'authentication_in_progress':
          // Timestamp will be set by authentication service
          break;
        case 'authenticated':
          order.authenticationCompletedAt = new Date();
          break;
        case 'shipped':
          order.shippedAt = new Date();
          break;
        case 'delivered':
          order.deliveredAt = new Date();
          order.actualDeliveryDate = new Date();
          break;
        case 'completed':
          order.deliveredAt = new Date();
          order.actualDeliveryDate = new Date();
          break;
        case 'cancelled':
          order.cancelledAt = new Date();
          order.cancellationReason = notes;
          break;
      }

      this.dataService.updateOrder(order);
      this.updateOrderInList(order);

      return {
        success: true,
        message: `Order status updated to ${status}`,
        data: order
      };

    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        message: 'Failed to update order status',
        error: 'UPDATE_STATUS_ERROR'
      };
    }
  }

  /**
   * Add shipping information
   */
  async addShippingInfo(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: Date
  ): Promise<OrderResponse> {
    try {
      const order = this.dataService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND'
        };
      }

      // Update shipping info
      order.trackingNumber = trackingNumber;
      order.shippingCarrier = carrier;
      order.estimatedDeliveryDate = estimatedDelivery;
      order.updatedAt = new Date();

      this.dataService.updateOrder(order);
      this.updateOrderInList(order);

      return {
        success: true,
        message: 'Shipping information added',
        data: order
      };

    } catch (error) {
      console.error('Error adding shipping info:', error);
      return {
        success: false,
        message: 'Failed to add shipping information',
        error: 'ADD_SHIPPING_ERROR'
      };
    }
  }

  /**
   * Get orders for a user (buyer or seller)
   */
  getUserOrders(userId: string, role: 'buyer' | 'seller'): Order[] {
    const allOrders = this.dataService.getAllOrders();
    return allOrders.filter(order => {
      if (role === 'buyer') {
        return order.buyerId === userId;
      } else {
        return order.sellerId === userId;
      }
    });
  }

  /**
   * Get order summary statistics
   */
  getOrderSummary(userId: string, role: 'buyer' | 'seller'): OrderSummary {
    const userOrders = this.getUserOrders(userId, role);
    
    const summary: OrderSummary = {
      totalOrders: userOrders.length,
      pendingPayment: userOrders.filter(o => o.status === 'pending_payment').length,
      inProgress: userOrders.filter(o => 
        ['payment_confirmed', 'authentication_in_progress', 'authenticated', 'shipped'].includes(o.status)
      ).length,
      completed: userOrders.filter(o => o.status === 'completed').length,
      cancelled: userOrders.filter(o => o.status === 'cancelled').length,
      totalRevenue: role === 'seller' ? 
        userOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.finalPrice, 0) : 0
    };

    return summary;
  }

  /**
   * Set active order
   */
  setActiveOrder(order: Order | null): void {
    this.activeOrderSubject.next(order);
  }

  /**
   * Start the 72-hour return window when item is delivered
   */
  startReturnWindow(orderId: string): OrderResponse {
    try {
      const order = this.dataService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND'
        };
      }

      if (order.status !== 'delivered') {
        return {
          success: false,
          message: 'Order must be delivered to start return window',
          error: 'INVALID_STATUS'
        };
      }

      // Set return window start and end (72 hours from now)
      const now = new Date();
      order.returnWindowStart = now;
      order.returnWindowEnd = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // 72 hours
      order.status = 'inspection_period';
      order.updatedAt = new Date();

      this.dataService.updateOrder(order);
      this.updateOrderInList(order);

      return {
        success: true,
        message: '72-hour return window started',
        data: order
      };

    } catch (error) {
      console.error('Error starting return window:', error);
      return {
        success: false,
        message: 'Failed to start return window',
        error: 'RETURN_WINDOW_ERROR'
      };
    }
  }

  /**
   * Buyer confirms item received as intended
   */
  confirmItemReceived(orderId: string): OrderResponse {
    try {
      const order = this.dataService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND'
        };
      }

      if (order.status !== 'inspection_period') {
        return {
          success: false,
          message: 'Order must be in inspection period',
          error: 'INVALID_STATUS'
        };
      }

      // Buyer confirms item received as intended
      order.buyerConfirmationAt = new Date();
      order.status = 'completed';
      order.updatedAt = new Date();

      this.dataService.updateOrder(order);
      this.updateOrderInList(order);

      return {
        success: true,
        message: 'Item confirmed as received. Order completed and funds released to seller.',
        data: order
      };

    } catch (error) {
      console.error('Error confirming item received:', error);
      return {
        success: false,
        message: 'Failed to confirm item received',
        error: 'CONFIRMATION_ERROR'
      };
    }
  }

  /**
   * Buyer requests a return within the 72-hour window
   */
  requestReturn(orderId: string, reason: string, returnType: 'item_mismatch' | 'buyer_remorse' | 'damaged_in_transit' | 'not_as_described'): OrderResponse {
    try {
      const order = this.dataService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND'
        };
      }

      if (order.status !== 'inspection_period') {
        return {
          success: false,
          message: 'Order must be in inspection period',
          error: 'INVALID_STATUS'
        };
      }

      // Check if return window is still active
      if (order.returnWindowEnd && new Date() > order.returnWindowEnd) {
        return {
          success: false,
          message: 'Return window has expired',
          error: 'RETURN_WINDOW_EXPIRED'
        };
      }

      // Determine who pays return shipping based on return type
      const sellerPaysShipping = returnType === 'item_mismatch' || returnType === 'not_as_described';
      const returnShippingCost = 25; // Fixed return shipping cost

      // Request return
      order.returnRequestedAt = new Date();
      order.returnReason = reason;
      order.returnType = returnType;
      order.returnShippingCost = returnShippingCost;
      order.returnShippingPaidBy = sellerPaysShipping ? 'seller' : 'buyer';
      order.status = 'return_requested';
      order.updatedAt = new Date();

      this.dataService.updateOrder(order);
      this.updateOrderInList(order);

      const shippingMessage = sellerPaysShipping 
        ? 'Seller will pay return shipping due to item mismatch/description issues.'
        : 'Buyer will pay return shipping.';

      return {
        success: true,
        message: `Return requested successfully. ${shippingMessage}`,
        data: order
      };

    } catch (error) {
      console.error('Error requesting return:', error);
      return {
        success: false,
        message: 'Return request failed',
        error: 'RETURN_REQUEST_ERROR'
      };
    }
  }

  /**
   * Process return and refund
   */
  processReturn(orderId: string): OrderResponse {
    try {
      const order = this.dataService.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND'
        };
      }

      if (order.status !== 'return_requested') {
        return {
          success: false,
          message: 'Order must have return requested',
          error: 'INVALID_STATUS'
        };
      }

      // Process return
      order.status = 'returned';
      order.updatedAt = new Date();

      this.dataService.updateOrder(order);
      this.updateOrderInList(order);

      // Determine refund amount based on who pays return shipping
      let refundMessage = 'Return processed successfully. Refund will be processed.';
      
      if (order.returnShippingPaidBy === 'seller') {
        refundMessage += ' Seller will pay return shipping costs.';
      } else {
        refundMessage += ' Return shipping costs will be deducted from refund.';
      }

      return {
        success: true,
        message: refundMessage,
        data: order
      };

    } catch (error) {
      console.error('Error processing return:', error);
      return {
        success: false,
        message: 'Failed to process return',
        error: 'RETURN_PROCESSING_ERROR'
      };
    }
  }

  /**
   * Check if return window has expired and auto-complete order
   */
  checkReturnWindowExpiry(): void {
    const orders = this.dataService.getAllOrders();
    const now = new Date();

    orders.forEach(order => {
      if (order.status === 'inspection_period' && order.returnWindowEnd && now > order.returnWindowEnd) {
        // Return window expired, auto-complete order
        order.status = 'completed';
        order.returnWindowExpiredAt = new Date();
        order.updatedAt = new Date();

        this.dataService.updateOrder(order);
        this.updateOrderInList(order);
      }
    });
  }

  /**
   * Get remaining time in return window
   */
  getReturnWindowRemainingTime(orderId: string): { hours: number; minutes: number; expired: boolean } {
    const order = this.dataService.getOrderById(orderId);
    if (!order || !order.returnWindowEnd) {
      return { hours: 0, minutes: 0, expired: true };
    }

    const now = new Date();
    const timeRemaining = order.returnWindowEnd.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      return { hours: 0, minutes: 0, expired: true };
    }

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, expired: false };
  }

  /**
   * Calculate refund amount for returned items
   */
  calculateRefundAmount(orderId: string): { 
    originalAmount: number; 
    returnShippingCost: number; 
    refundAmount: number; 
    shippingPaidBy: string;
    notes: string;
  } {
    const order = this.dataService.getOrderById(orderId);
    if (!order) {
      return { 
        originalAmount: 0, 
        returnShippingCost: 0, 
        refundAmount: 0, 
        shippingPaidBy: 'unknown',
        notes: 'Order not found'
      };
    }

    const originalAmount = order.finalPrice;
    const returnShippingCost = order.returnShippingCost || 25;
    const shippingPaidBy = order.returnShippingPaidBy || 'buyer';

    let refundAmount: number;
    let notes: string;

    if (shippingPaidBy === 'seller') {
      // Seller pays return shipping, buyer gets full refund
      refundAmount = originalAmount;
      notes = 'Full refund - seller pays return shipping due to item mismatch/description issues';
    } else {
      // Buyer pays return shipping, shipping cost deducted from refund
      refundAmount = originalAmount - returnShippingCost;
      notes = `Partial refund - return shipping cost ($${returnShippingCost}) deducted from refund`;
    }

    return {
      originalAmount,
      returnShippingCost,
      refundAmount,
      shippingPaidBy,
      notes
    };
  }

  /**
   * Add order to list
   */
  private addOrderToList(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    this.ordersSubject.next([order, ...currentOrders]);
  }

  /**
   * Update order in list
   */
  private updateOrderInList(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = currentOrders.map(o => 
      o.id === order.id ? order : o
    );
    this.ordersSubject.next(updatedOrders);
  }

  /**
   * Load orders from storage
   */
  private loadOrders(): void {
    const orders = this.dataService.getAllOrders();
    this.ordersSubject.next(orders);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
