import { Injectable } from '@angular/core';
import { User } from '../models/bid.interface';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  constructor() { }

  /**
   * Check if user has completed all verification requirements
   */
  isUserVerified(user: User): boolean {
    return user.idVerified && user.disclaimerSigned && user.policySigned;
  }

  /**
   * Get missing verification requirements
   */
  getMissingRequirements(user: User): string[] {
    const missing: string[] = [];
    
    if (!user.idVerified) {
      missing.push('ID Verification');
    }
    
    if (!user.disclaimerSigned) {
      missing.push('Disclaimer Agreement');
    }
    
    if (!user.policySigned) {
      missing.push('Policy Agreement');
    }
    
    return missing;
  }

  /**
   * Simulate ID verification process
   */
  async verifyUserIdentity(userId: string): Promise<boolean> {
    // In production, this would integrate with Jumio or similar service
    console.log('Verifying user identity for:', userId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, always return true
    return true;
  }

  /**
   * Get disclaimer text
   */
  getDisclaimerText(): string {
    return `DISCLAIMER AGREEMENT

By using this platform, you acknowledge and agree to the following:

1. AUTHENTICITY: All watches are verified by trusted third-party authentication services before delivery.

2. TRANSACTION PROCESS: 
   - Seller ships watch to verification partner
   - Verification partner authenticates watch (2-3 business days)
   - Verified watch ships to buyer
   - Buyer has 48 hours to inspect and confirm
   - Funds released to seller upon buyer confirmation

3. DISPUTE RESOLUTION:
   - If watch is found to be fake: Seller pays return shipping + verification fee
   - If watch is damaged in transit: Full insurance coverage
   - If buyer rejects: Return shipping covered by insurance

4. FEES: Total price includes item cost + shipping + verification + 5% commission + insurance

5. VERIFICATION: All users must provide valid ID and agree to terms before transacting.

By proceeding, you agree to these terms and conditions.`;
  }

  /**
   * Get policy text
   */
  getPolicyText(): string {
    return `PRIVACY POLICY & TERMS OF SERVICE

1. ID VERIFICATION: We use trusted third-party services (Jumio) to verify user identity.

2. DATA COLLECTION: We collect necessary information for transaction processing and fraud prevention.

3. PAYMENT PROCESSING: All payments are processed securely through our payment partners.

4. SHIPPING: We provide prepaid shipping labels for secure delivery to verification partners.

5. INSURANCE: All transactions include full insurance coverage for the item value.

6. COMMUNICATION: We may contact you regarding your transactions and account status.

7. SECURITY: Your personal information is encrypted and stored securely.

8. COMPLIANCE: We comply with all applicable laws and regulations.

By using our service, you agree to this privacy policy and terms of service.`;
  }

  /**
   * Mark disclaimer as signed
   */
  markDisclaimerSigned(userId: string): void {
    // In production, this would update the database
    console.log('Disclaimer signed for user:', userId);
    localStorage.setItem(`disclaimer_signed_${userId}`, 'true');
  }

  /**
   * Mark policy as signed
   */
  markPolicySigned(userId: string): void {
    // In production, this would update the database
    console.log('Policy signed for user:', userId);
    localStorage.setItem(`policy_signed_${userId}`, 'true');
  }

  /**
   * Check if user has signed disclaimer
   */
  hasSignedDisclaimer(userId: string): boolean {
    return localStorage.getItem(`disclaimer_signed_${userId}`) === 'true';
  }

  /**
   * Check if user has signed policy
   */
  hasSignedPolicy(userId: string): boolean {
    return localStorage.getItem(`policy_signed_${userId}`) === 'true';
  }
}