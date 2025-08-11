import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { AuthorizationService } from '../../services/authorization.service';
import { ShippingCalculatorComponent } from '../../components/shipping-calculator/shipping-calculator.component';
import { PackageTrackingComponent } from '../../components/package-tracking/package-tracking.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, ShippingCalculatorComponent, PackageTrackingComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private dataService = inject(DataPersistenceService);
  private authService = inject(AuthorizationService);

  orders: Order[] = [];
  userRole: 'buyer' | 'seller' = 'buyer';
  selectedOrder: Order | null = null;
  showShippingCalculator = false;
  showPackageTracking = false;

  ngOnInit() {
    this.loadUserOrders();
  }

  private loadUserOrders() {
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

  getStatusColor(status: Order['status']): string {
    switch (status) {
      case 'pending_payment': return '#ff9800';
      case 'payment_confirmed': return '#2196f3';
      case 'authentication_in_progress': return '#9c27b0';
      case 'authenticated': return '#4caf50';
      case 'shipped': return '#2196f3';
      case 'delivered': return '#4caf50';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
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
      case 'completed': return '🎉';
      case 'cancelled': return '🚫';
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
      'completed'
    ];
    
    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  }
}
