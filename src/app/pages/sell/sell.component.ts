import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Listing, Bid, Counteroffer } from '../../models/bid.interface';
import { AuthenticationPartner } from '../../models/authentication-partner.interface';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { AiPricingService, PricingRecommendation } from '../../services/ai-pricing.service';
import { AuthenticationPartnerService } from '../../services/authentication-partner.service';
import { AuthenticationPartnersComponent } from '../../components/authentication-partners/authentication-partners.component';
import { AuctionTimerService, AuctionTimer } from '../../services/auction-timer.service';
import { OrderService } from '../../services/order.service';
import { Share } from '@capacitor/share';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticationPartnersComponent],
  providers: [DataPersistenceService, AiPricingService],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.scss'
})
export class SellComponent implements OnInit, OnDestroy {
  form = {
    title: '',
    startingPrice: 0,
    description: '',
    brand: '',
    model: '',
    year: undefined as number | undefined,
    condition: 'excellent' as 'excellent' | 'very-good' | 'good' | 'fair',
    originalPrice: undefined as number | undefined,
    imageUrl: '',
    governmentIdUrl: '',
    scheduleType: 'immediate' as 'immediate' | 'scheduled',
    scheduleDate: '',
    scheduleTime: '',
    authenticationPartner: ''
  };

  activeListings: Listing[] = [];
  showCounterofferForm = false;
  selectedBidForCounteroffer: Bid | null = null;
  counterofferForm = {
    amount: 0,
    message: ''
  };

  // AI Pricing
  showPricingAssistant = false;
  pricingRecommendation: PricingRecommendation | null = null;
  availableBrands: string[] = [];
  availableModels: string[] = [];

  // Authentication Partners
  authenticationPartners: AuthenticationPartner[] = [];
  selectedPartner: AuthenticationPartner | null = null;
  userCountry: string = 'US';

  // Timer subscriptions for cleanup
  private timerSubscriptions: Subscription[] = [];

  constructor(
    private dataService: DataPersistenceService,
    private aiPricingService: AiPricingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    if (!this.dataService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
    
    this.loadActiveListings();
    this.loadAvailableBrands();
  }

  loadAvailableBrands() {
    try {
      this.availableBrands = this.aiPricingService.getAvailableBrands();
    } catch (error) {
      console.error('Error loading brands:', error);
    }
    this.cdr.detectChanges();
  }

  onBrandChange() {
    if (this.form.brand) {
      this.availableModels = this.aiPricingService.getModelsForBrand(this.form.brand);
      this.form.model = '';
    } else {
      this.availableModels = [];
      this.form.model = '';
    }
    
    this.cdr.detectChanges();
  }

  getModelCount(): number {
    return this.availableModels.length;
  }

  getPricingRecommendation() {
    if (!this.form.brand || !this.form.model) {
      alert('Please select a brand and model for pricing analysis');
      return;
    }

    try {
      this.pricingRecommendation = this.aiPricingService.getPricingRecommendation(
        this.form.brand,
        this.form.model,
        this.form.year,
        this.form.condition,
        this.form.originalPrice
      );

      // Auto-fill the suggested price
      this.form.startingPrice = this.pricingRecommendation.suggestedPrice;
      this.showPricingAssistant = true;
      
    } catch (error) {
      console.error('Error getting pricing recommendation:', error);
      alert('Error getting pricing recommendation. Please try again.');
    }
  }

  applyPricingRecommendation() {
    if (this.pricingRecommendation) {
      this.form.startingPrice = this.pricingRecommendation.suggestedPrice;
      this.showPricingAssistant = false;
    }
  }

  closePricingAssistant() {
    this.showPricingAssistant = false;
    this.pricingRecommendation = null;
  }

  submitForm() {
    // Check if form has required data
    if (!this.form.title || this.form.title.trim() === '') {
      alert('Please enter a title for your item');
      return;
    }
    
    if (!this.form.startingPrice || this.form.startingPrice <= 0) {
      alert('Please enter a valid starting price greater than 0');
      return;
    }

    // Check if Government ID is uploaded
    if (!this.form.governmentIdUrl) {
      alert('Please upload your government ID before listing an item');
      return;
    }

    // Final ID verification confirmation
    const idConfirmed = confirm(
      'Final Legal Compliance Verification:\n\n' +
      '• You confirm this is your own government-issued ID\n' +
      '• The name on the ID matches your account information\n' +
      '• You understand using someone else\'s ID is prohibited\n' +
      '• You acknowledge this is required for legal compliance\n' +
      '• You understand your ID information is encrypted and never shared publicly\n' +
      '• Your ID will be verified by our security team\n\n' +
      'Do you confirm these statements are true?'
    );

    if (!idConfirmed) {
      alert('Please ensure you are uploading your own government ID before proceeding.');
      return;
    }

    // Validate scheduled listing
    if (this.form.scheduleType === 'scheduled') {
      if (!this.form.scheduleDate || !this.form.scheduleTime) {
        alert('Please select both date and time for scheduled listing');
        return;
      }
      
      const scheduledDateTime = new Date(`${this.form.scheduleDate}T${this.form.scheduleTime}`);
      const now = new Date();
      
      if (scheduledDateTime <= now) {
        alert('Scheduled date and time must be in the future');
        return;
      }
    }
    
    // Determine start time based on schedule type
    let startTime: Date;
    if (this.form.scheduleType === 'scheduled') {
      startTime = new Date(`${this.form.scheduleDate}T${this.form.scheduleTime}`);
    } else {
      startTime = new Date();
    }
    
    const endTime = new Date(startTime.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months from start
    
    const newListing: Listing = {
      id: this.dataService.generateId(),
      sellerId: 'seller1',
      sellerName: 'John Seller',
      title: this.form.title.trim(),
      description: this.form.description || '',
      price: this.form.startingPrice,
      brand: this.form.brand || undefined,
      model: this.form.model || undefined,
      year: this.form.year,
      condition: this.form.condition,
      startingPrice: this.form.startingPrice,
      currentPrice: this.form.startingPrice,
      imageUrl: this.form.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
      images: [],
      createdAt: startTime,
      endTime: endTime,
      status: this.form.scheduleType === 'scheduled' ? 'scheduled' : 'active',
      bids: [],
      counteroffers: [],
      counterofferCount: 0
    };

    try {
      // Save to persistent storage
      this.dataService.saveListing(newListing);
      
      // Reload listings
      this.loadActiveListings();
      
      // Reset form
      this.form = { 
        title: '', 
        startingPrice: 0, 
        description: '',
        brand: '',
        model: '',
        year: undefined,
        condition: 'excellent',
        originalPrice: undefined,
        imageUrl: '',
        governmentIdUrl: '',
        scheduleType: 'immediate',
        scheduleDate: '',
        scheduleTime: '',
        authenticationPartner: ''
      };
      
      // Show success message with times
      const startTimeStr = this.getListingStartTime(startTime);
      const endTimeStr = this.getListingEndTime(endTime);
      const wasScheduled = this.form.scheduleType === 'scheduled';
      
      if (wasScheduled) {
        alert(`Item scheduled successfully!\n\nGoes live: ${startTimeStr}\nEnds: ${endTimeStr}\n\nBidding window is 2 months.`);
      } else {
                  alert(`Item listed successfully!\n\nStart: ${startTimeStr}\nEnd: ${endTimeStr}\n\nBidding window is 2 months.`);
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Error saving listing. Please try again.');
    }
  }

  deleteListing(listingId: string) {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.dataService.deleteListing(listingId);
      this.loadActiveListings();
      alert('Listing deleted successfully!');
    }
  }

  loadActiveListings() {
    // Get listings from persistent storage
    this.activeListings = this.dataService.getListingsBySeller('seller1');
    
    // Temporarily disable demo listings to prevent localStorage quota issues
    // if (this.activeListings.length === 0) {
    //   this.createDemoListings();
    // }

    // Set highest bid for each listing
    this.activeListings.forEach(listing => {
      if (listing.bids.length > 0) {
        listing.highestBid = listing.bids.reduce((highest, current) => 
          current.amount > highest.amount ? current : highest
        );
      }
    });
  }

  private createDemoListings() {
    const demoListings: Listing[] = [
      {
        id: this.dataService.generateId(),
        sellerId: 'seller1',
        sellerName: 'John Seller',
        title: 'Rolex Submariner',
        description: 'Classic dive watch in excellent condition',
        price: 8500,
        startingPrice: 8500,
        currentPrice: 9000,
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
        images: [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: 'active',
        bids: [
          {
            id: 'bid1',
            itemId: '1',
            bidderId: 'buyer1',
            bidderName: 'Mike Buyer',
            amount: 9000,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'pending'
          }
        ],
        counteroffers: [],
        counterofferCount: 0
      }
    ];

    // Save demo listings
    demoListings.forEach(listing => {
      this.dataService.saveListing(listing);
    });

    // Reload listings
    this.loadActiveListings();
  }

  getTimeRemaining(endTime: Date): string {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  getListingStartTime(createdAt: Date): string {
    return createdAt.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getListingEndTime(endTime: Date): string {
    return endTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getPendingBids(listing: Listing): Bid[] {
    return listing.bids.filter(bid => bid.status === 'pending');
  }

  hasPendingBids(listing: Listing): boolean {
    return this.getPendingBids(listing).length > 0;
  }

  acceptBid(listingId: string, bidId: string) {
    const listing = this.activeListings.find(l => l.id === listingId);
    if (listing) {
      const bid = listing.bids.find(b => b.id === bidId);
      if (bid) {
        bid.status = 'accepted';
        listing.status = 'sold';
        alert(`Bid accepted! Smart contract will be created. Shipping costs will be split.`);
      }
    }
  }

  declineBid(listingId: string, bidId: string) {
    const listing = this.activeListings.find(l => l.id === listingId);
    if (listing) {
      const bid = listing.bids.find(b => b.id === bidId);
      if (bid) {
        bid.status = 'declined';
        // Remove from highest bid if it was the highest
        if (listing.highestBid?.id === bidId) {
          const remainingBids = listing.bids.filter(b => b.status === 'pending');
          listing.highestBid = remainingBids.length > 0 ? 
            remainingBids.reduce((highest, current) => 
              current.amount > highest.amount ? current : highest
            ) : undefined;
        }
        alert('Bid declined.');
      }
    }
  }

  makeCounteroffer(listingId: string, bidId: string) {
    const listing = this.activeListings.find(l => l.id === listingId);
    if (listing && (listing.counterofferCount || 0) < 3) {
      const bid = listing.bids.find(b => b.id === bidId);
      if (bid) {
        this.selectedBidForCounteroffer = bid;
        this.counterofferForm.amount = bid.amount + 500; // Suggest 500 more
        this.showCounterofferForm = true;
      }
    } else if (listing && (listing.counterofferCount || 0) >= 3) {
      alert('You have already made 3 counteroffers for this listing.');
    }
  }

  submitCounteroffer() {
    if (this.selectedBidForCounteroffer && this.counterofferForm.amount > 0) {
      const listing = this.activeListings.find(l => 
        l.bids.some(b => b.id === this.selectedBidForCounteroffer?.id)
      );
      
      if (listing) {
        const counteroffer: Counteroffer = {
          id: Date.now().toString(),
          listingId: listing.id,
          bidId: this.selectedBidForCounteroffer.id,
          sellerId: listing.sellerId,
          sellerName: listing.sellerName,
          buyerId: this.selectedBidForCounteroffer.bidderId,
          buyerName: this.selectedBidForCounteroffer.bidderName,
          originalAmount: this.selectedBidForCounteroffer.amount,
          counterAmount: this.counterofferForm.amount,
          amount: this.counterofferForm.amount,
          originalBidId: this.selectedBidForCounteroffer.id,
          timestamp: new Date(),
          status: 'pending',
          message: this.counterofferForm.message
        };

        listing.counteroffers.push(counteroffer);
        listing.counterofferCount = (listing.counterofferCount || 0) + 1;
        
        // Update the original bid status
        const originalBid = listing.bids.find(b => b.id === this.selectedBidForCounteroffer?.id);
        if (originalBid) {
          originalBid.status = 'counteroffered';
        }

        this.showCounterofferForm = false;
        this.selectedBidForCounteroffer = null;
        this.counterofferForm = { amount: 0, message: '' };
        
        alert(`Counteroffer sent for $${this.counterofferForm.amount.toLocaleString()}. Buyer has 2 months to respond.`);
      }
    } else {
      alert('Please enter a valid counteroffer amount.');
    }
  }

  cancelCounteroffer() {
    this.showCounterofferForm = false;
    this.selectedBidForCounteroffer = null;
    this.counterofferForm = { amount: 0, message: '' };
  }

  getPendingCounteroffers(listing: Listing): Counteroffer[] {
    return listing.counteroffers.filter(co => co.status === 'pending');
  }

  async shareListing(listing: Listing) {
    const shareText = `${listing.title} - $${listing.currentPrice.toLocaleString()}\n\n` +
      `Sale ends: ${this.getListingEndTime(listing.endTime)}\n` +
      `Time remaining: ${this.getTimeRemaining(listing.endTime)}\n\n` +
      `Check out this watch on Watch Style iOS!`;

    try {
      // Use Capacitor Share plugin for native iOS sharing
      await Share.share({
        title: listing.title,
        text: shareText,
        url: window.location.href,
        dialogTitle: 'Share Watch Listing'
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: listing.title,
            text: shareText,
            url: window.location.href
          });
        } catch (webShareError) {
          console.error('Web Share API error:', webShareError);
          this.fallbackShare(shareText);
        }
      } else {
        // Final fallback to clipboard copy
        this.fallbackShare(shareText);
      }
    }
  }

  private fallbackShare(shareText: string) {
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Listing details copied to clipboard!');
      }).catch(() => {
        // Final fallback - show in alert
        alert(`Share this listing:\n\n${shareText}`);
      });
    } else {
      // Final fallback - show in alert
      alert(`Share this listing:\n\n${shareText}`);
    }
  }

  // Image upload methods
  triggerFileInput() {
    const fileInput = document.getElementById('product-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type - only JPG and PNG allowed
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a JPG or PNG image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.imageUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.form.imageUrl = '';
    this.cdr.detectChanges();
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Government ID upload methods
  triggerGovernmentIdInput() {
    const fileInput = document.getElementById('government-id') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onGovernmentIdSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type - only JPG and PNG allowed
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a JPG or PNG image file');
        return;
      }

      // Validate user identity before proceeding
      const currentUser = this.dataService.getCurrentUser();
      if (!currentUser) {
        alert('Please log in before uploading your government ID');
        return;
      }

      const identityValidation = this.dataService.validateUserIdentity(currentUser.id);
      if (!identityValidation.isValid) {
        alert(identityValidation.message);
        return;
      }

      // Check if user is already verified
      const verificationStatus = this.dataService.getUserVerificationStatus();
      if (verificationStatus.isVerified) {
        alert('Your account is already verified. No need to upload ID again.');
        return;
      }

      // Show ID validation warning
      const confirmed = confirm(
        'Legal Compliance & ID Verification Required:\n\n' +
        '• Government ID upload is mandatory for legal compliance and fraud prevention\n' +
        '• You must upload your own government-issued ID\n' +
        '• The name on the ID must match your account information: ' + currentUser.name + '\n' +
        '• Using someone else\'s ID is prohibited and may result in account suspension\n' +
        '• Your ID information is encrypted and never shared publicly\n' +
        '• Your ID will be securely verified by our security team\n' +
        '• Verification typically takes 24-48 hours\n\n' +
        'Do you confirm this is your own government ID?'
      );

      if (!confirmed) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.governmentIdUrl = e.target.result;
        this.cdr.detectChanges();
        
        // Show success message
        alert('Government ID uploaded successfully!\n\nYour ID has been encrypted and stored securely for legal compliance verification. Our security team will review your ID within 24-48 hours. You will receive an email notification once verification is complete.\n\nYour ID information is never shared publicly and is only used for verification purposes.');
      };
      reader.readAsDataURL(file);
    }
  }

  removeGovernmentId() {
    this.form.governmentIdUrl = '';
    this.cdr.detectChanges();
  }

  onAuthenticationPartnerChange(partner: AuthenticationPartner | string) {
    if (typeof partner === 'string') {
      this.form.authenticationPartner = partner;
    } else {
      this.form.authenticationPartner = partner.id;
    }
  }

  ngOnDestroy() {
    // Clean up timer subscriptions
    this.timerSubscriptions.forEach(sub => sub.unsubscribe());
    this.timerSubscriptions = [];
  }
}