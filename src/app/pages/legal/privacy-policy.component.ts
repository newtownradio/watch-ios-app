import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-policy-page">
      <div class="page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: {{ lastUpdated | date:'longDate' }}</p>
      </div>

      <div class="policy-content">
        <section class="policy-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, list items for sale, place bids, or contact us for support.</p>
          
          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Government ID for verification</li>
            <li>Communication preferences</li>
          </ul>

          <h3>Transaction Information</h3>
          <ul>
            <li>Bidding and purchase history</li>
            <li>Item listings and descriptions</li>
            <li>Shipping and delivery information</li>
            <li>Authentication and verification records</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Verify user identity and prevent fraud</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Communicate with you about products, services, and events</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:</p>
          
          <h3>Service Providers</h3>
          <p>We may share information with trusted third-party service providers who assist us in operating our platform, including:</p>
          <ul>
            <li>Payment processors (Stripe)</li>
            <li>Authentication services</li>
            <li>Shipping and delivery partners</li>
            <li>Cloud storage providers</li>
          </ul>

          <h3>Legal Requirements</h3>
          <p>We may disclose information if required by law or to protect our rights, property, or safety.</p>
        </section>

        <section class="policy-section">
          <h2>4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information:</p>
          <ul>
            <li>Encryption of sensitive data</li>
            <li>Secure authentication protocols</li>
            <li>Regular security assessments</li>
            <li>Access controls and monitoring</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request data portability</li>
            <li>File a complaint with supervisory authorities</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>6. Data Retention</h2>
          <p>We retain your information for as long as necessary to provide our services and comply with legal obligations. Transaction records are typically retained for 7 years for tax and legal purposes.</p>
        </section>

        <section class="policy-section">
          <h2>7. International Transfers</h2>
          <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>
        </section>

        <section class="policy-section">
          <h2>8. Children's Privacy</h2>
          <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
        </section>

        <section class="policy-section">
          <h2>9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
        </section>

        <section class="policy-section">
          <h2>10. Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us at:</p>
          <div class="contact-info">
            <p><strong>Email:</strong> privacy&#64;watchstyle.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong> 123 Luxury Lane, Watch City, WC 12345</p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .privacy-policy-page {
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

    .policy-content {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .policy-section {
      margin-bottom: 30px;
    }

    .policy-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #8b7355;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .policy-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c2c2c;
      margin: 20px 0 10px 0;
    }

    .policy-section p {
      margin-bottom: 15px;
      color: #555;
    }

    .policy-section ul {
      margin: 15px 0;
      padding-left: 20px;
    }

    .policy-section li {
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
      .privacy-policy-page {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .policy-content {
        padding: 20px;
      }
    }
  `]
})
export class PrivacyPolicyComponent {
  lastUpdated = new Date('2024-08-15');
}
