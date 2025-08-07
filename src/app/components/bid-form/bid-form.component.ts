import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
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
export class BidFormComponent {
  @Input() listing!: Listing;
  @Output() bidPlaced = new EventEmitter<BidResponse>();
  @Output() cancelled = new EventEmitter<void>();

  private bidService = inject(BidService);
  private dataService = inject(DataPersistenceService);

  bidAmount: number = 0;
  agreeTerms: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit() {
    // Set minimum bid amount
    this.bidAmount = this.listing.currentPrice + 1;
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
        this.successMessage = response.message;
        this.bidPlaced.emit(response);
        
        // Clear form after successful bid
        setTimeout(() => {
          this.cancelBid();
        }, 2000);
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