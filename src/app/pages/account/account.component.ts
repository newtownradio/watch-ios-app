import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { DataManagerComponent } from '../../components/data-manager/data-manager.component';
import { ContactEmailService, ContactFormData } from '../../services/contact-email.service';
import { Listing, Bid, User, Message, Notification } from '../../models/bid.interface';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, DataManagerComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  currentUser: User | null = null;
  userStats = {
    listings: 0,
    bids: 0,
    sales: 0,
    messages: 0
  };
  recentOrders: any[] = [];
  recentActivity: any[] = [];
  
  // Contact form properties
  contactForm = {
    reason: '',
    subject: '',
    message: '',
    email: ''
  };
  isSubmitting = false;
  contactFormStatus: { type: 'success' | 'error'; message: string } | null = null;

  constructor(
    private dataService: DataPersistenceService,
    private contactEmailService: ContactEmailService
  ) {}

  ngOnInit() {
    this.currentUser = this.dataService.getCurrentUser();
    this.loadUserStats();
    this.loadRecentOrders();
    this.loadRecentActivity();
    this.initializeContactForm();
  }

  loadUserStats() {
    if (!this.currentUser) return;

    const listings = this.dataService.getListingsBySeller(this.currentUser.id);
    const messages = this.dataService.getMessagesByReceiver(this.currentUser.id);
    const notifications = this.dataService.getNotificationsByUser(this.currentUser.id);

    this.userStats = {
      listings: listings.filter(l => l.status === 'active').length,
      bids: listings.reduce((total, listing) => total + listing.bids.length, 0),
      sales: listings.filter(l => l.status === 'sold').length,
      messages: messages.filter(m => !m.isRead).length
    };
  }

  loadRecentOrders() {
    // Create demo orders
    this.recentOrders = [
      {
        id: 'ORD-001',
        title: 'Rolex Submariner',
        price: 9500,
        status: 'completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'ORD-002',
        title: 'Omega Speedmaster',
        price: 4200,
        status: 'pending',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  loadRecentActivity() {
    if (!this.currentUser) return;

    const messages = this.dataService.getMessagesByReceiver(this.currentUser.id);
    const notifications = this.dataService.getNotificationsByUser(this.currentUser.id);

    this.recentActivity = [
      {
        type: 'bid',
        title: 'New Bid Received',
        description: 'Mike Buyer placed a bid of $8,800 on your Rolex Submariner',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        type: 'sale',
        title: 'Sale Completed',
        description: 'Sarah Mitchell purchased your Omega Speedmaster for $4,200',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'listing',
        title: 'Listing Created',
        description: 'You created a new listing for Rolex Submariner',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getMemberSince(): string {
    if (!this.currentUser?.createdAt) return 'Unknown';
    return this.currentUser.createdAt.toLocaleDateString();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'bid': return '💰';
      case 'sale': return '✅';
      case 'message': return '💬';
      case 'listing': return '📋';
      default: return '📊';
    }
  }

  viewOrderDetails(orderId: string) {
    // TODO: Implement order details view
  }

  uploadGovernmentId() {
    // TODO: Implement government ID upload
  }

  viewPrivacyPolicy() {
    // TODO: Implement privacy policy view
  }

  viewCookiePolicy() {
    // TODO: Implement cookie policy view
  }

  viewTermsConditions() {
    // TODO: Implement terms and conditions view
  }

  logout() {
    this.dataService.logout();
    // Immediately redirect to splash and force reload to bypass auth checks
    window.location.href = '/';
  }

  // Contact form methods
  initializeContactForm() {
    if (this.currentUser) {
      this.contactForm.email = this.currentUser.email;
    }
  }

  isContactFormValid(): boolean {
    return !!(
      this.contactForm.reason &&
      this.contactForm.subject &&
      this.contactForm.message &&
      this.contactForm.email &&
      this.contactForm.email.includes('@')
    );
  }

  async submitContactForm() {
    if (!this.isContactFormValid()) {
      this.contactFormStatus = {
        type: 'error',
        message: 'Please fill in all required fields correctly.'
      };
      return;
    }

    this.isSubmitting = true;
    this.contactFormStatus = null;

    try {
      // Prepare contact form data
      const contactData: ContactFormData = {
        reason: this.contactForm.reason,
        subject: this.contactForm.subject,
        message: this.contactForm.message,
        email: this.contactForm.email,
        userName: this.currentUser?.name,
        userId: this.currentUser?.id
      };

      // Store the contact form submission locally
      const contactSubmission = {
        id: Date.now().toString(),
        ...this.contactForm,
        timestamp: new Date(),
        userId: this.currentUser?.id || 'anonymous'
      };
      
      // Save to local storage
      const existingSubmissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      existingSubmissions.push(contactSubmission);
      localStorage.setItem('contactSubmissions', JSON.stringify(existingSubmissions));

      // Send email using the email service
      const emailResponse = await this.contactEmailService.sendContactEmailFallback(contactData);

      if (emailResponse.success) {
        this.contactFormStatus = {
          type: 'success',
          message: emailResponse.message
        };

        // Reset form
        this.contactForm = {
          reason: '',
          subject: '',
          message: '',
          email: this.currentUser?.email || ''
        };
      } else {
        this.contactFormStatus = {
          type: 'error',
          message: emailResponse.message
        };
      }

    } catch (error) {
      this.contactFormStatus = {
        type: 'error',
        message: 'Failed to send message. Please try again.'
      };
    } finally {
      this.isSubmitting = false;
    }
  }
}