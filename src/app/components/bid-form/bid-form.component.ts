import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BidService, BidResponse } from '../../services/bid.service';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { Listing, User } from '../../models/bid.interface';

@Component({
  selector: 'app-bid-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-form.component.html',
  styleUrls: ['./bid-form.component.scss']
})
export class BidFormComponent implements OnInit {
  @Input() listing!: Listing;
  @Output() bidPlaced = new EventEmitter<BidResponse>();
  @Output() cancelled = new EventEmitter<void>();

  private bidService = inject(BidService);
  private dataService = inject(DataPersistenceService);

  bidAmount = 0;
  agreeTerms = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    console.log('BidFormComponent initialized with listing:', this.listing);
    // Set minimum bid amount
    this.bidAmount = this.listing.currentPrice + 1;
    console.log('Initial bid amount set to:', this.bidAmount);
  }

  async placeBid() {
    if (!this.bidAmount || this.bidAmount <= this.listing.currentPrice) {
      this.errorMessage = 'Bid amount must be higher than the current price';
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = 'Please agree to the terms and conditions';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const currentUser = this.dataService.getCurrentUser();
      if (!currentUser) {
        this.errorMessage = 'You must be logged in to place a bid';
        return;
      }

      const response = await this.bidService.placeBid(
        currentUser.id,
        this.listing.id,
        this.bidAmount
      );

      if (response.success) {
        this.successMessage = `✅ ${response.message}\n\nRedirecting to Orders page in 3 seconds...`;
        console.log('Bid successful, showing success message');
        this.bidPlaced.emit(response);
        
        // Clear form after successful bid - reduced to 3 seconds since we're redirecting
        setTimeout(() => {
          console.log('Auto-closing bid form after success');
          this.cancelBid();
        }, 3000);
      } else {
        this.errorMessage = response.message;
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      this.errorMessage = 'Failed to place bid. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelBid() {
    this.cancelled.emit();
  }

  showTerms(event: Event) {
    event.preventDefault();
    // TODO: Show terms and conditions modal
    alert('Terms and conditions will be displayed here.');
  }
} 