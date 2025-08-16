import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-of-service-page">
      <div class="page-header">
        <h1>Terms of Service</h1>
        <p>Last updated: {{ lastUpdated | date:'longDate' }}</p>
      </div>

      <div class="terms-content">
        <section class="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using WatchStyle, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section class="terms-section">
          <h2>2. Description of Service</h2>
          <p>WatchStyle is a luxury watch marketplace that connects buyers and sellers of high-end timepieces. Our platform facilitates:</p>
          <ul>
            <li>Listing watches for sale</li>
            <li>Bidding on watch auctions</li>
            <li>Instant purchase options</li>
            <li>Authentication and verification services</li>
            <li>Secure payment processing</li>
            <li>Shipping and insurance services</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>3. User Accounts</h2>
          <h3>Account Creation</h3>
          <p>To use certain features of our service, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h3>Verification Requirements</h3>
          <p>We may require identity verification, including government-issued ID, to ensure platform security and compliance with regulations.</p>
        </section>

        <section class="terms-section">
          <h2>4. Listing and Selling</h2>
          <h3>Seller Responsibilities</h3>
          <p>As a seller, you agree to:</p>
          <ul>
            <li>Provide accurate and complete item descriptions</li>
            <li>Include high-quality, authentic photos</li>
            <li>Disclose any defects or issues</li>
            <li>Honor your listed prices and terms</li>
            <li>Ship items promptly and securely</li>
            <li>Provide accurate shipping information</li>
          </ul>

          <h3>Prohibited Items</h3>
          <p>You may not list:</p>
          <ul>
            <li>Counterfeit or replica watches</li>
            <li>Stolen items</li>
            <li>Items that violate intellectual property rights</li>
            <li>Items that violate applicable laws</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>5. Bidding and Purchasing</h2>
          <h3>Bid Commitments</h3>
          <p>By placing a bid, you commit to purchase the item if you win the auction. Bids are binding and cannot be retracted.</p>

          <h3>Payment Terms</h3>
          <p>Payment must be completed within 48 hours of winning an auction or making an instant purchase. We accept major credit cards and secure payment methods.</p>

          <h3>Buyer Protection</h3>
          <p>We provide escrow services and buyer protection programs to ensure secure transactions and item authenticity.</p>
        </section>

        <section class="terms-section">
          <h2>6. Fees and Commissions</h2>
          <p>Our fee structure includes:</p>
          <ul>
            <li>Listing fees for premium features</li>
            <li>Commission on successful sales (varies by item value)</li>
            <li>Payment processing fees</li>
            <li>Optional authentication and insurance fees</li>
          </ul>
          <p>All fees are clearly disclosed before listing or purchasing.</p>
        </section>

        <section class="terms-section">
          <h2>7. Shipping and Returns</h2>
          <h3>Shipping</h3>
          <p>Sellers are responsible for safe and timely shipping. We recommend using insured, trackable shipping methods.</p>

          <h3>Returns</h3>
          <p>Returns are subject to seller policies and our platform guidelines. Items must be returned in the same condition as received.</p>

          <h3>Disputes</h3>
          <p>We provide dispute resolution services for shipping issues, item condition disputes, and other transaction problems.</p>
        </section>

        <section class="terms-section">
          <h2>8. Authentication and Verification</h2>
          <p>We offer professional authentication services to verify watch authenticity. While we strive for accuracy, authentication results are provided "as is" and we cannot guarantee 100% accuracy.</p>
        </section>

        <section class="terms-section">
          <h2>9. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Engage in fraudulent activities</li>
            <li>Interfere with platform operations</li>
            <li>Harass or abuse other users</li>
            <li>Attempt to manipulate auction outcomes</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>10. Intellectual Property</h2>
          <p>WatchStyle and its content are protected by copyright, trademark, and other intellectual property laws. You may not use our branding or content without permission.</p>
        </section>

        <section class="terms-section">
          <h2>11. Limitation of Liability</h2>
          <p>WatchStyle is not liable for:</p>
          <ul>
            <li>Indirect, incidental, or consequential damages</li>
            <li>Loss of profits or data</li>
            <li>Damages exceeding the amount paid for our services</li>
            <li>Third-party actions or content</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>12. Termination</h2>
          <p>We may terminate or suspend your account for violations of these terms. You may terminate your account at any time by contacting customer support.</p>
        </section>

        <section class="terms-section">
          <h2>13. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of our service constitutes acceptance of updated terms.</p>
        </section>

        <section class="terms-section">
          <h2>14. Governing Law</h2>
          <p>These terms are governed by the laws of the jurisdiction where WatchStyle operates. Any disputes will be resolved in the appropriate courts.</p>
        </section>

        <section class="terms-section">
          <h2>15. Contact Information</h2>
          <p>For questions about these terms, please contact us at:</p>
          <div class="contact-info">
            <p><strong>Email:</strong> legal@watchstyle.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong> 123 Luxury Lane, Watch City, WC 12345</p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .terms-of-service-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #8b7355;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 10px;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .terms-content {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .terms-section {
      margin-bottom: 30px;
    }

    .terms-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #8b7355;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .terms-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c2c2c;
      margin: 20px 0 10px 0;
    }

    .terms-section p {
      margin-bottom: 15px;
      color: #555;
    }

    .terms-section ul {
      margin: 15px 0;
      padding-left: 20px;
    }

    .terms-section li {
      margin-bottom: 8px;
      color: #555;
    }

    .contact-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #8b7355;
    }

    .contact-info p {
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .terms-of-service-page {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .terms-content {
        padding: 20px;
      }
    }
  `]
})
export class TermsOfServiceComponent {
  lastUpdated = new Date('2024-08-15');
}
