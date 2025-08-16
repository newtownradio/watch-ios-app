import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { AuthorizationService } from '../../services/authorization.service';
import { StripeService } from '../../services/stripe.service';
import { ReturnRequest, ReturnType } from '../../models/order.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  
  // Order management
  selectedOrder: Order | null = null;
  showPaymentForm = false;
  showShippingForm = false;
  showReturnForm = false;
  currentPaymentAmount = 0;
  returnReason = '';
  selectedReturnType: ReturnType = 'buyer_remorse';

  // Notification system
  currentNotification: { title: string; message: string; type: 'success' | 'error' | 'info' } | null = null;

  // Payment form
  paymentForm = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  };

  // Shipping form
  shippingForm = {
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    notes: ''
  };

  ngOnInit() {
    // Create test user for authentication (remove in production)
    this.createTestUser();
    
    this.loadUserOrders();
    this.orderService.checkReturnWindowExpiry();
    this.updateUserAccount();
    this.cleanupExpiredListings();
    
    // Create mock orders for testing (remove in production)
    this.createMockOrders();
  }

  // Test User for Authentication - REMOVE IN PRODUCTION
  private createTestUser() {
    const testUser = {
      id: 'user-001',
      name: 'John Buyer',
      email: 'john@test.com',
      role: 'buyer',
      idVerified: true,
      verificationDate: new Date(),
      createdAt: new Date(),
      phone: '+1-555-0123',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA'
      }
    };
    
    // Save test user to localStorage
    localStorage.setItem('watch_ios_users', JSON.stringify([testUser]));
    localStorage.setItem('watch_ios_current_user', JSON.stringify(testUser));
    
    console.log('👤 Test user created and logged in:', testUser);
  }

  // Mock Orders for Testing - REMOVE IN PRODUCTION
  private createMockOrders() {
    console.log('🔄 Creating mock orders...');
    
    const mockOrders = [
      {
        id: 'mock-order-1',
        listingId: 'listing-001',
        buyerId: 'user-001',
        buyerName: 'John Buyer',
        sellerId: 'seller-001',
        sellerName: 'Luxury Watch Co.',
        watchTitle: 'Rolex Submariner Date',
        watchBrand: 'Rolex',
        watchModel: 'Submariner Date',
        finalPrice: 12500,
        authenticationRequestId: 'auth-001',
        status: 'pending_payment' as const,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
        trackingNumber: undefined,
        shippingCarrier: undefined,
        shippedAt: undefined,
        deliveredAt: undefined,
        estimatedDeliveryDate: undefined,
        actualDeliveryDate: undefined,
        returnWindowStart: undefined,
        returnWindowEnd: undefined,
        returnRequestedAt: undefined,
        returnReason: undefined,
        returnType: undefined,
        buyerConfirmationAt: undefined,
        returnWindowExpiredAt: undefined,
        returnShippingCost: undefined,
        returnShippingPaidBy: undefined
      },
      {
        id: 'mock-order-2',
        listingId: 'listing-002',
        buyerId: 'user-001',
        buyerName: 'John Buyer',
        sellerId: 'seller-002',
        sellerName: 'Vintage Timepieces',
        watchTitle: 'Omega Speedmaster Professional',
        watchBrand: 'Omega',
        watchModel: 'Speedmaster Professional',
        finalPrice: 8500,
        authenticationRequestId: 'auth-002',
        status: 'payment_confirmed' as const,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(),
        paymentConfirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        trackingNumber: undefined,
        shippingCarrier: undefined,
        shippedAt: undefined,
        deliveredAt: undefined,
        estimatedDeliveryDate: undefined,
        actualDeliveryDate: undefined,
        returnWindowStart: undefined,
        returnWindowEnd: undefined,
        returnRequestedAt: undefined,
        returnReason: undefined,
        returnType: undefined,
        buyerConfirmationAt: undefined,
        returnWindowExpiredAt: undefined,
        returnShippingCost: undefined,
        returnShippingPaidBy: undefined
      },
      {
        id: 'mock-order-3',
        listingId: 'listing-003',
        buyerId: 'user-001',
        buyerName: 'John Buyer',
        sellerId: 'seller-003',
        sellerName: 'Swiss Watch Gallery',
        watchTitle: 'Patek Philippe Calatrava',
        watchBrand: 'Patek Philippe',
        watchModel: 'Calatrava',
        finalPrice: 18500,
        authenticationRequestId: 'auth-003',
        status: 'shipped' as const,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(),
        paymentConfirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        trackingNumber: '1Z999AA1234567890',
        shippingCarrier: 'FedEx',
        shippedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        deliveredAt: undefined,
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        actualDeliveryDate: undefined,
        returnWindowStart: undefined,
        returnWindowEnd: undefined,
        returnRequestedAt: undefined,
        returnReason: undefined,
        returnType: undefined,
        buyerConfirmationAt: undefined,
        returnWindowExpiredAt: undefined,
        returnShippingCost: undefined,
        returnShippingPaidBy: undefined
      },
      {
        id: 'mock-order-4',
        listingId: 'listing-004',
        buyerId: 'user-001',
        buyerName: 'John Buyer',
        sellerId: 'seller-004',
        sellerName: 'Modern Watch Boutique',
        watchTitle: 'Apple Watch Series 9',
        watchBrand: 'Apple',
        watchModel: 'Watch Series 9',
        finalPrice: 450,
        authenticationRequestId: 'auth-004',
        status: 'delivered' as const,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: new Date(),
        paymentConfirmedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        trackingNumber: '1Z999AA0987654321',
        shippingCarrier: 'UPS',
        shippedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        estimatedDeliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        actualDeliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        returnWindowStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        returnWindowEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        returnRequestedAt: undefined,
        returnReason: undefined,
        returnType: undefined,
        buyerConfirmationAt: undefined,
        returnWindowExpiredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        returnShippingCost: undefined,
        returnShippingPaidBy: undefined
      },
      {
        id: 'mock-order-5',
        listingId: 'listing-005',
        buyerId: 'user-001',
        buyerName: 'John Buyer',
        sellerId: 'seller-005',
        sellerName: 'Luxury Watch Exchange',
        watchTitle: 'Audemars Piguet Royal Oak',
        watchBrand: 'Audemars Piguet',
        watchModel: 'Royal Oak',
        finalPrice: 22500,
        authenticationRequestId: 'auth-005',
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        updatedAt: new Date(),
        paymentConfirmedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
        trackingNumber: '1Z999AA1122334455',
        shippingCarrier: 'DHL',
        shippedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
        deliveredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        estimatedDeliveryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        actualDeliveryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        returnWindowStart: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        returnWindowEnd: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), // 17 days ago
        returnRequestedAt: undefined,
        returnReason: undefined,
        returnType: undefined,
        buyerConfirmationAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        returnWindowExpiredAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), // 17 days ago
        returnShippingCost: undefined,
        returnShippingPaidBy: undefined
      }
    ];

    console.log('📦 Mock orders created:', mockOrders);
    
    // Save mock orders to localStorage
    localStorage.setItem('watch_ios_orders', JSON.stringify(mockOrders));
    console.log('💾 Mock orders saved to localStorage');
    
    // Reload orders to display them
    this.loadUserOrders();
  }

  loadUserOrders() {
    console.log('🔄 Loading user orders...');
    const currentUser = this.dataService.getCurrentUser();
    console.log('👤 Current user:', currentUser);
    
    if (currentUser) {
      const role = this.authService.getUserRole();
      console.log('🎭 User role:', role);
      this.userRole = (role === 'buyer' || role === 'seller') ? role : 'buyer';
      console.log('🎯 Final user role:', this.userRole);
      
      // Get orders and ensure they have required properties
      const rawOrders = this.orderService.getUserOrders(currentUser.id, this.userRole);
      console.log('📦 Raw orders from service:', rawOrders);
      
      this.orders = rawOrders;
      
      console.log('✅ Final orders array:', this.orders);
      console.log('📊 Orders count:', this.orders.length);
    } else {
      console.log('❌ No current user found');
    }
  }

  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.showPaymentForm = false;
    this.showShippingForm = false;
    this.showReturnForm = false;
  }

  // Payment Management
  async initiatePayment(order: Order) {
    if (order.status === 'pending_payment') {
      this.currentPaymentAmount = order.finalPrice * 100; // Convert to cents
      this.selectedOrder = order;
      this.showPaymentForm = true;
      
      try {
        const result = await this.stripeService.createWinningBidPaymentIntent(
          order.id,
          order.listingId,
          order.buyerId,
          order.sellerId,
          order.finalPrice,
          150 // Default verification cost
        );
        
        if (result.success && result.paymentIntentId) {
          this.processPaymentSuccess(order, result.paymentIntentId);
        } else {
          this.showNotification('Payment Error', result.error || 'Failed to create payment intent', 'error');
        }
      } catch (_error) {
        this.showNotification('Payment Error', 'Failed to process payment', 'error');
      }
    }
  }

  async processPaymentSuccess(order: Order, paymentIntentId: string) {
    try {
      // Update order status
      order.status = 'payment_confirmed';
      order.paymentConfirmedAt = new Date();
      
      // Update in storage - use localStorage for now since updateOrder doesn't exist
      this.updateOrderInStorage(order);
      
      // Send notification to seller
      this.sendNotificationToUser(order.sellerId, 'Payment Received', 
        `Payment received for ${order.watchTitle}. Please ship within 3 business days.`);
      
      // Update user account
      this.updateUserAccount();
      
      // Clean up expired listings
      this.cleanupExpiredListings();
      
      this.showNotification('Payment Successful', 'Payment processed successfully. Seller will ship soon.', 'success');
      this.showPaymentForm = false;
      
    } catch (_error) {
      this.showNotification('Error', 'Failed to update order status', 'error');
    }
  }

  // Shipping Management
  updateShippingInfo(order: Order) {
    if (this.shippingForm.trackingNumber && this.shippingForm.carrier) {
      order.status = 'shipped';
      order.trackingNumber = this.shippingForm.trackingNumber;
      order.shippingCarrier = this.shippingForm.carrier;
      order.estimatedDeliveryDate = new Date(this.shippingForm.estimatedDelivery);
      order.shippedAt = new Date();
      
      // Update order
      this.updateOrderInStorage(order);
      
      // Send notification to buyer
      this.sendNotificationToUser(order.buyerId, 'Item Shipped', 
        `Your ${order.watchTitle} has been shipped. Tracking: ${order.trackingNumber}`);
      
      // Send message to buyer
      this.sendMessageToUser(order.buyerId, order.sellerId, 
        'Shipping Update', `Your item has been shipped via ${order.shippingCarrier}. Tracking number: ${order.trackingNumber}`);
      
      this.showNotification('Shipping Updated', 'Shipping information updated successfully', 'success');
      this.showShippingForm = false;
      this.resetShippingForm();
    }
  }

  // Return Management
  initiateReturn(order: Order) {
    if (this.canStartReturn(order)) {
      this.selectedOrder = order;
      this.showReturnForm = true;
    }
  }

  submitReturnRequest() {
    if (this.selectedOrder && this.returnReason) {
      // Update order with return information
      this.selectedOrder.status = 'return_requested';
      this.selectedOrder.returnRequestedAt = new Date();
      this.selectedOrder.returnReason = this.returnReason;
      this.selectedOrder.returnType = this.selectedReturnType;
      
      // Update order
      this.updateOrderInStorage(this.selectedOrder);
      
      // Send notification to seller
      this.sendNotificationToUser(this.selectedOrder.sellerId, 'Return Requested', 
        `Return requested for ${this.selectedOrder.watchTitle}. Reason: ${this.returnReason}`);
      
      // Send message to seller
      this.sendMessageToUser(this.selectedOrder.sellerId, this.selectedOrder.buyerId,
        'Return Request', `Return requested for ${this.selectedOrder.watchTitle}. Please review and respond.`);
      
      this.showNotification('Return Requested', 'Return request submitted successfully', 'success');
      this.showReturnForm = false;
      this.resetReturnForm();
    }
  }

  // Notifications and Messages
  private sendNotificationToUser(userId: string, title: string, message: string) {
    const notification = {
      id: Date.now().toString(),
      userId: userId,
      title: title,
      message: message,
      timestamp: new Date(),
      read: false,
      type: 'order_update'
    };
    
    // Save notification
    const notifications = JSON.parse(localStorage.getItem('watch_ios_notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('watch_ios_notifications', JSON.stringify(notifications));
  }

  private sendMessageToUser(toUserId: string, fromUserId: string, subject: string, content: string) {
    const message = {
      id: Date.now().toString(),
      fromUserId: fromUserId,
      toUserId: toUserId,
      subject: subject,
      content: content,
      timestamp: new Date(),
      read: false,
      orderId: this.selectedOrder?.id
    };
    
    // Save message
    const messages = JSON.parse(localStorage.getItem('watch_ios_messages') || '[]');
    messages.push(message);
    localStorage.setItem('watch_ios_messages', JSON.stringify(messages));
  }

  private showNotification(title: string, message: string, type: 'success' | 'error' | 'info') {
    // Create in-app notification
    this.currentNotification = {
      title: title,
      message: message,
      type: type
    };
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.currentNotification = null;
    }, 5000);
  }

  // User Account Updates
  private updateUserAccount() {
    const currentUser = this.dataService.getCurrentUser();
    if (currentUser) {
      // Update order count
      const orderCount = this.orders.length;
      
      // Update user stats
      const userStats = {
        totalOrders: orderCount,
        activeOrders: this.orders.filter(o => o.status === 'payment_confirmed' || o.status === 'shipped').length,
        completedOrders: this.orders.filter(o => o.status === 'completed').length,
        totalSpent: this.orders
          .filter(o => o.status === 'completed' && this.userRole === 'buyer')
          .reduce((sum, o) => sum + o.finalPrice, 0),
        totalEarned: this.orders
          .filter(o => o.status === 'completed' && this.userRole === 'seller')
          .reduce((sum, o) => sum + o.finalPrice, 0)
      };
      
      // Save updated user stats
      localStorage.setItem(`watch_ios_user_stats_${currentUser.id}`, JSON.stringify(userStats));
    }
  }

  // Cleanup Expired Listings
  private cleanupExpiredListings() {
    // Get all listings
    const listings = JSON.parse(localStorage.getItem('watch_ios_listings') || '[]');
    const currentTime = new Date();
    
    // Mark expired listings
    listings.forEach((listing: any) => {
      if (listing.endTime && new Date(listing.endTime) < currentTime && listing.status === 'active') {
        listing.status = 'expired';
      }
    });
    
    // Remove sold/expired items from discovery and digital
    const updatedListings = listings.filter((listing: any) => 
      listing.status === 'active' || listing.status === 'scheduled'
    );
    
    // Save updated listings
    localStorage.setItem('watch_ios_listings', JSON.stringify(updatedListings));
    
    // Update discovery and digital page data
    this.updateDiscoveryAndDigitalPages(updatedListings);
  }

  private updateDiscoveryAndDigitalPages(activeListings: any[]) {
    // Update discovery page data
    const discoveryData = activeListings.filter((listing: any) => 
      listing.category === 'luxury' || listing.category === 'vintage'
    );
    localStorage.setItem('watch_ios_discovery_listings', JSON.stringify(discoveryData));
    
    // Update digital page data
    const digitalData = activeListings.filter((listing: any) => 
      listing.category === 'digital' || listing.brand === 'Apple'
    );
    localStorage.setItem('watch_ios_digital_listings', JSON.stringify(digitalData));
  }

  // Storage helper method
  private updateOrderInStorage(order: Order) {
    const orders = JSON.parse(localStorage.getItem('watch_ios_orders') || '[]');
    const index = orders.findIndex((o: any) => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    localStorage.setItem('watch_ios_orders', JSON.stringify(orders));
  }

  // Utility Methods
  getOrderStageNumber(order: Order): number {
    switch (order.status) {
      case 'pending_payment':
        return 2; // Payment stage
      case 'payment_confirmed':
        return 3; // Shipped stage
      case 'shipped':
        return 3; // Shipped stage
      case 'authentication_in_progress':
        return 4; // Verification stage
      case 'authenticated':
        return 4; // Verification stage
      case 'delivered':
        return 5; // Delivered stage
      case 'inspection_period':
        return 5; // Still in delivered stage
      case 'completed':
        return 6; // Complete stage
      case 'return_requested':
        return 5; // Still in delivered stage
      case 'returned':
        return 5; // Still in delivered stage
      default:
        return 1; // Order Created stage
    }
  }

  canShowPaymentForm(order: Order): boolean {
    return order.status === 'pending_payment' && this.userRole === 'buyer';
  }

  canShowShippingForm(order: Order): boolean {
    return order.status === 'payment_confirmed' && this.userRole === 'seller';
  }

  canStartReturn(order: Order): boolean {
    // Check if order is in a state where returns can be requested
    if (order.status !== 'delivered' && order.status !== 'inspection_period') {
      return false;
    }
    
    // Check if user is a buyer
    if (this.userRole !== 'buyer') {
      return false;
    }
    
    // Check if return is already requested
    if (order.returnRequestedAt) {
      return false;
    }
    
    // Check if return window has expired
    if (order.returnWindowExpiredAt && new Date() > order.returnWindowExpiredAt) {
      return false;
    }
    
    // Check if return window is still active (within 72 hours of delivery)
    if (order.deliveredAt) {
      const deliveryTime = new Date(order.deliveredAt).getTime();
      const currentTime = new Date().getTime();
      const returnWindowMs = 72 * 60 * 60 * 1000; // 72 hours
      
      if (currentTime - deliveryTime > returnWindowMs) {
        return false; // Return window expired
      }
    }
    
    return true;
  }

  canShowReturnActions(order: Order): boolean {
    return order.returnRequestedAt ? true : false;
  }

  getOrderProgress(order: Order): number {
    const statusOrder = ['pending_payment', 'payment_confirmed', 'shipped', 'delivered', 'inspection_period', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  }

  getStatusColor(status: Order['status']): string {
    switch (status) {
      case 'pending_payment': return '#f59e0b';
      case 'payment_confirmed': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'inspection_period': return '#f59e0b';
      case 'completed': return '#059669';
      case 'return_requested': return '#ef4444';
      case 'returned': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getReturnWindowStatus(order: Order): { status: string; timeRemaining?: string } {
    if (order.status === 'delivered' && order.deliveredAt) {
      const deliveryTime = new Date(order.deliveredAt).getTime();
      const currentTime = new Date().getTime();
      const timeElapsed = currentTime - deliveryTime;
      const returnWindowMs = 72 * 60 * 60 * 1000; // 72 hours
      
      if (timeElapsed < returnWindowMs) {
        const remainingMs = returnWindowMs - timeElapsed;
        const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
        const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        
        return {
          status: 'Return Window Active',
          timeRemaining: `${remainingHours}h ${remainingMinutes}m remaining`
        };
      } else {
        return { status: 'Return Window Expired' };
      }
    }
    
    return { status: 'Return Window Not Started' };
  }

  getReturnShippingInfo(order: Order): { message: string; sellerPays: boolean; cost: number } {
    if (order.returnType) {
      if (order.returnType === 'item_mismatch' || order.returnType === 'not_as_described') {
        return {
          message: 'Seller pays return shipping - item not as described',
          sellerPays: true,
          cost: 0
        };
      } else if (order.returnType === 'damaged_in_transit') {
        return {
          message: 'Seller pays return shipping - damaged during shipping',
          sellerPays: true,
          cost: 0
        };
      } else {
        return {
          message: 'Buyer pays return shipping - buyer\'s choice',
          sellerPays: false,
          cost: 15.99
        };
      }
    }
    
    return {
      message: 'Return shipping cost depends on return reason',
      sellerPays: false,
      cost: 15.99
    };
  }

  // Form Reset Methods
  resetShippingForm() {
    this.shippingForm = {
      trackingNumber: '',
      carrier: '',
      estimatedDelivery: '',
      notes: ''
    };
  }

  resetReturnForm() {
    this.returnReason = '';
    this.selectedReturnType = 'buyer_remorse';
  }

  // Toggle Methods
  togglePaymentForm() {
    this.showPaymentForm = !this.showPaymentForm;
    this.showShippingForm = false;
    this.showReturnForm = false;
  }

  toggleShippingForm() {
    this.showShippingForm = !this.showShippingForm;
    this.showPaymentForm = false;
    this.showReturnForm = false;
  }

  toggleReturnForm() {
    this.showReturnForm = !this.showReturnForm;
    this.showPaymentForm = false;
    this.showShippingForm = false;
  }

  // Get current order stage for flow diagram
  getCurrentOrderStage(order: Order): string {
    switch (order.status) {
      case 'pending_payment':
        return 'pending_payment';
      case 'payment_confirmed':
        return 'payment_confirmed';
      case 'shipped':
        return 'shipped';
      case 'delivered':
        return 'delivered';
      case 'inspection_period':
        return 'inspection_period';
      case 'completed':
        return 'completed';
      default:
        return 'order_created';
    }
  }

  // Check if a stage is completed for the selected order
  isStageCompleted(stage: string, order: Order): boolean {
    if (!order) return false;
    
    const stageOrder = ['order_created', 'pending_payment', 'payment_confirmed', 'shipped', 'delivered', 'inspection_period', 'completed'];
    const currentStageIndex = stageOrder.indexOf(this.getCurrentOrderStage(order));
    const stageIndex = stageOrder.indexOf(stage);
    
    return stageIndex < currentStageIndex;
  }

  // Check if a stage is current for the selected order
  isStageCurrent(stage: string, order: Order): boolean {
    if (!order) return false;
    return this.getCurrentOrderStage(order) === stage;
  }
}
