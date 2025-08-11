import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpsShippingService, TrackingInfo, TrackingEvent } from '../../services/ups-shipping.service';

@Component({
  selector: 'app-package-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-tracking.component.html',
  styleUrl: './package-tracking.component.scss'
})
export class PackageTrackingComponent implements OnInit {
  @Input() trackingNumber = '';
  @Input() showTrackingForm = true;

  trackingInfo: TrackingInfo | null = null;
  isLoading = false;
  errorMessage = '';
  customTrackingNumber = '';

  constructor(private upsShippingService: UpsShippingService) {}

  ngOnInit() {
    if (this.trackingNumber) {
      this.trackPackage(this.trackingNumber);
    }
  }

  trackPackage(trackingNum: string) {
    if (!trackingNum.trim()) {
      this.errorMessage = 'Please enter a tracking number.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.trackingInfo = null;

    this.upsShippingService.trackPackage(trackingNum).subscribe({
      next: (info) => {
        this.trackingInfo = info;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error tracking package. Please check the tracking number and try again.';
        this.isLoading = false;
        console.error('Tracking error:', error);
      }
    });
  }

  trackCustomPackage() {
    this.trackPackage(this.customTrackingNumber);
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'Delivered': '#10b981',
      'In Transit': '#3b82f6',
      'Out for Delivery': '#f59e0b',
      'Picked Up': '#8b5cf6',
      'Exception': '#ef4444',
      'Pending': '#6b7280'
    };
    return statusColors[status] || '#6b7280';
  }

  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'Delivered': '✅',
      'In Transit': '🚚',
      'Out for Delivery': '📦',
      'Picked Up': '📥',
      'Exception': '⚠️',
      'Pending': '⏳'
    };
    return statusIcons[status] || '📦';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstimatedDeliveryStatus(): { text: string; color: string; icon: string } {
    if (!this.trackingInfo) {
      return { text: 'Unknown', color: '#6b7280', icon: '❓' };
    }

    const estimatedDate = new Date(this.trackingInfo.estimatedDelivery);
    const now = new Date();
    const diffTime = estimatedDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', color: '#ef4444', icon: '🚨' };
    } else if (diffDays === 0) {
      return { text: 'Due Today', color: '#f59e0b', icon: '📅' };
    } else if (diffDays === 1) {
      return { text: 'Due Tomorrow', color: '#f59e0b', icon: '📅' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, color: '#3b82f6', icon: '📦' };
    } else {
      return { text: `Due in ${diffDays} days`, color: '#10b981', icon: '📦' };
    }
  }

  clearTracking() {
    this.trackingInfo = null;
    this.customTrackingNumber = '';
    this.errorMessage = '';
  }
}
