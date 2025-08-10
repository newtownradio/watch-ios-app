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
  status: 'pending_payment' | 'payment_confirmed' | 'authentication_in_progress' | 'authenticated' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
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
