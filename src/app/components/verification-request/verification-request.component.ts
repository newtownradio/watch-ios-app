import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationPartner } from '../../models/authentication-partner.interface';
import { 
  VerificationApiService, 
  VerificationRequestPayload, 
  VerificationResponse,
  VerificationStatusResponse,
  VerificationResultResponse 
} from '../../services/verification-api.service';

@Component({
  selector: 'app-verification-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-request.component.html',
  styleUrl: './verification-request.component.scss'
})
export class VerificationRequestComponent implements OnInit {
  @Input() selectedPartner: AuthenticationPartner | null = null;
  @Input() watchDetails: {
    brand: string;
    model: string;
    year?: number;
    condition: string;
    estimatedValue: number;
    description: string;
    photos: string[];
  } | null = null;
  @Input() sellerInfo: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  } | null = null;

  @Output() verificationSubmitted = new EventEmitter<VerificationResponse>();
  @Output() verificationStatusUpdated = new EventEmitter<VerificationStatusResponse>();
  @Output() verificationCompleted = new EventEmitter<VerificationResultResponse>();

  // Form data
  verificationForm = {
    serialNumber: '',
    includeConditionReport: true,
    includeMarketValuation: true,
    includeInvestmentGrade: false,
    rushService: false,
    specialInstructions: '',
    insuranceRequired: true,
    declaredValue: 0
  };

  // Component state
  showRequestForm = false;
  isSubmitting = false;
  isTracking = false;
  currentRequest: VerificationResponse | null = null;
  currentStatus: VerificationStatusResponse | null = null;
  currentResult: VerificationResultResponse | null = null;
  errorMessage = '';
  successMessage = '';

  // Tracking state
  trackingInterval: any = null;
  trackingRequestId = '';

  constructor(private verificationApiService: VerificationApiService) {}

  ngOnInit() {
    if (this.watchDetails) {
      this.verificationForm.declaredValue = this.watchDetails.estimatedValue;
    }
  }

  ngOnDestroy() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
  }

  /**
   * Toggle the verification request form
   */
  toggleRequestForm() {
    this.showRequestForm = !this.showRequestForm;
    if (this.showRequestForm) {
      this.resetForm();
    }
  }

  /**
   * Submit verification request to selected partner
   */
  async submitVerificationRequest() {
    if (!this.selectedPartner || !this.watchDetails || !this.sellerInfo) {
      this.errorMessage = 'Missing required information. Please select a partner and ensure watch details are complete.';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const payload: VerificationRequestPayload = {
        partnerId: this.selectedPartner.id,
        watchDetails: {
          brand: this.watchDetails.brand,
          model: this.watchDetails.model,
          serialNumber: this.verificationForm.serialNumber || undefined,
          year: this.watchDetails.year,
          condition: this.watchDetails.condition,
          estimatedValue: this.watchDetails.estimatedValue,
          photos: this.watchDetails.photos,
          description: this.watchDetails.description
        },
        sellerInfo: this.sellerInfo,
        shippingDetails: {
          fromAddress: {
            name: this.sellerInfo.name,
            street: this.sellerInfo.address.street,
            city: this.sellerInfo.address.city,
            state: this.sellerInfo.address.state,
            zipCode: this.sellerInfo.address.zipCode,
            country: this.sellerInfo.address.country,
            phone: this.sellerInfo.phone,
            email: this.sellerInfo.email
          },
          toAddress: {
            name: this.selectedPartner.name,
            company: this.selectedPartner.name,
            street: '123 Authentication St',
            city: 'Authentication City',
            state: 'AS',
            zipCode: '12345',
            country: 'US',
            phone: '1-800-AUTH-123',
            email: 'auth@partner.com'
          },
          packageDetails: {
            weight: 2,
            dimensions: {
              length: 6,
              width: 4,
              height: 3
            },
            declaredValue: this.verificationForm.declaredValue,
            insuranceRequired: this.verificationForm.insuranceRequired
          }
        },
        authenticationOptions: {
          includeConditionReport: this.verificationForm.includeConditionReport,
          includeMarketValuation: this.verificationForm.includeMarketValuation,
          includeInvestmentGrade: this.verificationForm.includeInvestmentGrade,
          rushService: this.verificationForm.rushService
        }
      };

      // Check if partner has real API enabled
      if (this.verificationApiService.isPartnerApiEnabled(this.selectedPartner.id)) {
        // Use real API
        this.verificationApiService.submitVerificationRequest(
          this.selectedPartner.id,
          payload
        ).subscribe({
          next: (response) => {
            this.handleVerificationResponse(response);
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
        // Use mock API for development
        this.verificationApiService.getMockVerificationResponse(payload).subscribe({
          next: (response) => {
            this.handleVerificationResponse(response);
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle successful verification response
   */
  private handleVerificationResponse(response: VerificationResponse) {
    this.currentRequest = response;
    this.successMessage = `Verification request submitted successfully! Request ID: ${response.requestId}`;
    this.isSubmitting = false;
    this.showRequestForm = false;

    // Emit event for parent component
    this.verificationSubmitted.emit(response);

    // Start tracking if request was accepted
    if (response.status === 'accepted') {
      this.startTracking(response.requestId);
    }

    // Show instructions
    this.showInstructions(response);
  }

  /**
   * Start tracking verification progress
   */
  startTracking(requestId: string) {
    this.trackingRequestId = requestId;
    this.isTracking = true;

    // Check status immediately
    this.checkVerificationStatus();

    // Set up periodic status checks (every 30 seconds)
    this.trackingInterval = setInterval(() => {
      this.checkVerificationStatus();
    }, 30000);
  }

  /**
   * Check current verification status
   */
  checkVerificationStatus() {
    if (!this.selectedPartner || !this.trackingRequestId) {
      return;
    }

    if (this.verificationApiService.isPartnerApiEnabled(this.selectedPartner.id)) {
      // Use real API
      this.verificationApiService.getVerificationStatus(
        this.selectedPartner.id,
        this.trackingRequestId
      ).subscribe({
        next: (status) => {
          this.updateStatus(status);
        },
        error: (error) => {
          console.error('Error checking status:', error);
        }
      });
    } else {
      // Use mock API
      this.verificationApiService.getMockStatusResponse(this.trackingRequestId).subscribe({
        next: (status) => {
          this.updateStatus(status);
        },
        error: (error) => {
          console.error('Error checking status:', error);
        }
      });
    }
  }

  /**
   * Update verification status
   */
  private updateStatus(status: VerificationStatusResponse) {
    this.currentStatus = status;
    this.verificationStatusUpdated.emit(status);

    // Check if verification is complete
    if (status.status === 'completed') {
      this.getVerificationResult();
    } else if (status.status === 'failed' || status.status === 'cancelled') {
      this.stopTracking();
    }
  }

  /**
   * Get final verification result
   */
  getVerificationResult() {
    if (!this.selectedPartner || !this.trackingRequestId) {
      return;
    }

    if (this.verificationApiService.isPartnerApiEnabled(this.selectedPartner.id)) {
      // Use real API
      this.verificationApiService.getVerificationResult(
        this.selectedPartner.id,
        this.trackingRequestId
      ).subscribe({
        next: (result) => {
          this.handleVerificationResult(result);
        },
        error: (error) => {
          console.error('Error getting result:', error);
        }
      });
    } else {
      // Use mock API
      this.verificationApiService.getMockResultResponse(this.trackingRequestId).subscribe({
        next: (result) => {
          this.handleVerificationResult(result);
        },
        error: (error) => {
          console.error('Error getting result:', error);
        }
      });
    }
  }

  /**
   * Handle verification result
   */
  private handleVerificationResult(result: VerificationResultResponse) {
    this.currentResult = result;
    this.verificationCompleted.emit(result);
    this.stopTracking();

    if (result.result.isAuthentic) {
      this.successMessage = `Verification completed! Your watch is authentic with ${result.result.confidence}% confidence.`;
    } else {
      this.errorMessage = 'Verification completed. The watch could not be verified as authentic.';
    }
  }

  /**
   * Stop tracking verification
   */
  stopTracking() {
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  /**
   * Cancel verification request
   */
  cancelVerificationRequest() {
    if (!this.selectedPartner || !this.trackingRequestId) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) {
      return;
    }

    if (this.verificationApiService.isPartnerApiEnabled(this.selectedPartner.id)) {
      // Use real API
      this.verificationApiService.cancelVerificationRequest(
        this.selectedPartner.id,
        this.trackingRequestId,
        reason
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = `Verification cancelled successfully. ${response.cancellationFee ? `Cancellation fee: $${response.cancellationFee}` : ''}`;
            this.stopTracking();
            this.currentRequest = null;
            this.currentStatus = null;
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    } else {
      // Mock cancellation
      this.successMessage = 'Verification cancelled successfully.';
      this.stopTracking();
      this.currentRequest = null;
      this.currentStatus = null;
    }
  }

  /**
   * Show verification instructions
   */
  private showInstructions(response: VerificationResponse) {
    // This could open a modal or expand a section with instructions
    console.log('Verification instructions:', response.instructions);
  }

  /**
   * Validate form data
   */
  private validateForm(): boolean {
    if (this.verificationForm.declaredValue <= 0) {
      this.errorMessage = 'Please enter a valid declared value for insurance purposes.';
      return false;
    }

    if (this.verificationForm.declaredValue > this.watchDetails!.estimatedValue * 1.5) {
      this.errorMessage = 'Declared value cannot exceed 150% of estimated value.';
      return false;
    }

    return true;
  }

  /**
   * Handle errors
   */
  private handleError(error: any) {
    this.isSubmitting = false;
    this.errorMessage = error.message || 'An error occurred while submitting the verification request.';
    console.error('Verification error:', error);
  }

  /**
   * Reset form to default values
   */
  private resetForm() {
    this.verificationForm = {
      serialNumber: '',
      includeConditionReport: true,
      includeMarketValuation: true,
      includeInvestmentGrade: false,
      rushService: false,
      specialInstructions: '',
      insuranceRequired: true,
      declaredValue: this.watchDetails?.estimatedValue || 0
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Calculate total cost including add-ons
   */
  getTotalCost(): number {
    if (!this.selectedPartner) return 0;

    let total = this.selectedPartner.baseFee;

    if (this.verificationForm.includeInvestmentGrade) {
      total += 50; // Investment grade add-on
    }

    if (this.verificationForm.rushService) {
      total += 75; // Rush service fee
    }

    // Add estimated shipping costs
    total += 25; // Base shipping

    return total;
  }

  /**
   * Get estimated completion date
   */
  getEstimatedCompletion(): string {
    if (!this.selectedPartner) return 'Unknown';

    const baseDays = parseInt(this.selectedPartner.estimatedTime.split('-')[1]) || 5;
    let totalDays = baseDays;

    if (this.verificationForm.rushService) {
      totalDays = Math.max(2, Math.floor(totalDays * 0.6)); // Rush service reduces time by 40%
    }

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + totalDays);

    return completionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Get progress percentage for status bar
   */
  getProgressPercentage(): number {
    if (!this.currentStatus) return 0;
    return this.currentStatus.progress;
  }

  /**
   * Get status color for progress bar
   */
  getStatusColor(): string {
    if (!this.currentStatus) return '#6b7280';

    switch (this.currentStatus.status) {
      case 'pending':
        return '#6b7280';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'cancelled':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }
}
