import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="logo">
            <div class="logo-text">WATCH</div>
          </div>
          <p class="hero-subtitle">The trusted marketplace for Pre-Owned Luxury Timepieces</p>
          <p class="hero-description">
            Buy and sell authentic watches with AI-powered pricing, secure verification, and trusted shipping.
          </p>
          <p class="disclaimer">
            We are a used watch company and do not represent the brands.
          </p>
          <div class="cta-buttons">
            <button class="cta-btn primary" (click)="navigateToAuth()">
              Get Started
            </button>
            <button class="cta-btn secondary" (click)="scrollToHowItWorks()">
              Learn More
            </button>
          </div>
        </div>
      </div>

      <!-- How It Works Section -->
      <div class="how-it-works" id="how-it-works">
                  <h2>How it works:</h2>
                  <p class="verification-notice">We authenticate all orders to a 3rd party verifier.</p>
        
        <!-- For Sellers -->
        <div class="process-section">
          <h3>For Sellers</h3>
          <div class="process-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>List Your Watch</h4>
                <p>Upload photos and details of your timepiece. Our AI provides accurate pricing based on market data.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>48-Hour Auction</h4>
                <p>Your watch goes live for 48 hours. Bidders place offers, and you can accept or make counteroffers.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Secure Transaction</h4>
                <p>When sold, we handle verification, shipping, and payment. You receive funds after delivery.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- For Buyers -->
        <div class="process-section">
          <h3>For Buyers</h3>
          <div class="process-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Discover Watches</h4>
                <p>Browse authenticated timepieces with AI-powered pricing and detailed condition reports.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Place Your Bid</h4>
                <p>Bid on watches during the 48-hour auction window. Make competitive offers or accept counteroffers.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Verified Delivery</h4>
                <p>Watches are verified by experts, shipped securely, and delivered to your door with full insurance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust & Safety Section -->
      <div class="trust-section">
        <h2>Trust & Safety</h2>
        <div class="trust-features">
          <div class="feature">
            <div class="feature-icon">Security</div>
            <h4>Government ID Verification</h4>
            <p>All users must upload valid government ID for enhanced security and trust.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">AI</div>
            <h4>AI Price Predictions</h4>
            <p>Advanced AI analyzes market data to provide accurate pricing recommendations.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">Shipping</div>
            <h4>Secure Shipping</h4>
            <p>UPS shipping with full insurance and tracking for every transaction.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">Verified</div>
            <h4>Expert Verification</h4>
            <p>Third-party verification services ensure authenticity and condition accuracy.</p>
          </div>
        </div>
      </div>

      <!-- Get Started Section -->
      <div class="get-started-section">
        <h2>Ready to Start?</h2>
        <p>Join thousands of watch enthusiasts buying and selling with confidence.</p>
        <button class="cta-btn primary large" (click)="navigateToAuth()">
          Create Your Account
        </button>
      </div>
    </div>
  `,
  styles: [`
    .splash-container {
      min-height: 100vh;
      background: #1e3a8a;
      color: white;
      overflow-x: hidden;
      padding: 20px;
      padding-top: 40px; /* Add top padding to prevent title cutoff */

      @media (max-width: 480px) {
        padding: 16px;
        padding-top: 32px; /* Reduced top padding on mobile */
      }
    }

    .hero-section {
      display: flex;
      align-items: center;
      justify-content: center; /* Center content */
      padding: 20px 20px 0 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 40vh; /* Further reduced for more compact layout */

      @media (max-width: 768px) {
        flex-direction: column;
        padding: 20px 20px 0 20px;
        text-align: center;
        min-height: 35vh; /* Even more compact on mobile */
      }

      @media (max-width: 480px) {
        padding: 16px 16px 0 16px;
        min-height: 30vh;
      }
    }

    .hero-content {
      flex: 1;
      max-width: 600px; /* Increased for better text layout */
      text-align: center; /* Center all content */

      @media (max-width: 768px) {
        max-width: 100%;
      }

      @media (max-width: 480px) {
        max-width: 100%;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center; /* Center the logo */
      margin-bottom: 20px; /* Reduced margin */

      .logo-text {
        font-size: 48px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-style: italic;
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 
          2px 2px 4px rgba(0, 0, 0, 0.3),
          1px 1px 2px rgba(0, 0, 0, 0.2);
        transform: skew(-5deg);
        letter-spacing: 2px;

        @media (max-width: 768px) {
          font-size: 42px;
          letter-spacing: 1.5px;
        }

        @media (max-width: 480px) {
          font-size: 36px;
          letter-spacing: 1px;
        }
      }
    }

    .hero-subtitle {
      font-size: 22px; /* Slightly larger */
      font-weight: 600;
      margin-bottom: 8px; /* Reduced margin */
      opacity: 0.9;

      @media (max-width: 768px) {
        font-size: 20px;
      }

      @media (max-width: 480px) {
        font-size: 18px;
      }
    }

    .hero-description {
      font-size: 16px;
      line-height: 1.6; /* Improved line height */
      margin-bottom: 12px; /* Reduced margin */
      opacity: 0.8;
      max-width: 500px; /* Limit text width for better readability */
      margin-left: auto;
      margin-right: auto;

      @media (max-width: 768px) {
        font-size: 15px;
        max-width: 100%;
      }

      @media (max-width: 480px) {
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .disclaimer {
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 20px;
      opacity: 0.7;
      font-style: italic;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;

      @media (max-width: 768px) {
        font-size: 13px;
        max-width: 100%;
      }

      @media (max-width: 480px) {
        font-size: 12px;
        line-height: 1.3;
      }
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center; /* Center buttons */
      margin-bottom: 30px; /* Add proper spacing below Learn More button */

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px; /* Slightly reduced gap on mobile */
        margin-bottom: 25px; /* Slightly less spacing on mobile */
      }

      @media (max-width: 480px) {
        gap: 10px;
        margin-bottom: 20px; /* Even less spacing on small mobile */
      }
    }

    .cta-btn {
      padding: 14px 28px; /* Slightly larger padding */
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      min-width: 140px; /* Ensure consistent button width */

      @media (max-width: 768px) {
        padding: 12px 24px;
        font-size: 15px;
        min-width: 120px;
      }

      @media (max-width: 480px) {
        padding: 10px 20px;
        font-size: 14px;
        min-width: 100px;
      }

      &.primary {
        background: #1e3a8a;
        color: white;
        box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
      }

      &.secondary {
        background: transparent;
        color: white;
        border: 2px solid white;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
      }

      &.large {
        padding: 20px 40px;
        font-size: 18px;

        @media (max-width: 768px) {
          padding: 16px 32px;
          font-size: 16px;
        }

        @media (max-width: 480px) {
          padding: 14px 28px;
          font-size: 15px;
        }
      }
    }

    .how-it-works {
      background: white;
      color: #1f2937;
      padding: 30px 40px 80px 40px; /* Increased top padding from 20px to 30px for spacing */
      text-align: center;

      @media (max-width: 768px) {
        padding: 20px 20px 40px 20px; /* Increased top padding from 10px to 20px for spacing */
      }

      @media (max-width: 480px) {
        padding: 16px 16px 32px 16px;
      }

      h2 {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 20px; /* Reduced for the new notice */
        color: #667eea;

        @media (max-width: 768px) {
          font-size: 32px;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          font-size: 28px;
          margin-bottom: 12px;
        }
      }

      .verification-notice {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 40px;
        color: #374151;
        text-align: center;

        @media (max-width: 768px) {
          font-size: 16px;
          margin-bottom: 32px;
        }

        @media (max-width: 480px) {
          font-size: 15px;
          margin-bottom: 24px;
        }
      }

      h3 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 32px;
        color: #374151;
      }
    }

    .process-section {
      margin-bottom: 60px;

      @media (max-width: 768px) {
        margin-bottom: 40px;
      }

      @media (max-width: 480px) {
        margin-bottom: 32px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
      max-width: 1000px;
      margin: 0 auto;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      @media (max-width: 480px) {
        gap: 20px;
      }
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      text-align: left;

      @media (max-width: 480px) {
        gap: 12px;
      }

      .step-number {
        background: #667eea;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 18px;
        flex-shrink: 0;

        @media (max-width: 480px) {
          width: 36px;
          height: 36px;
          font-size: 16px;
        }
      }

      .step-content {
        h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;

          @media (max-width: 768px) {
            font-size: 16px;
          }

          @media (max-width: 480px) {
            font-size: 15px;
          }
        }

        p {
          margin: 0;
          line-height: 1.6;
          color: #6b7280;

          @media (max-width: 768px) {
            font-size: 14px;
          }

          @media (max-width: 480px) {
            font-size: 13px;
            line-height: 1.5;
          }
        }
      }
    }

    .trust-section {
      background: #f8fafc;
      color: #1f2937;
      padding: 80px 40px;
      text-align: center;

      @media (max-width: 768px) {
        padding: 40px 20px;
      }

      @media (max-width: 480px) {
        padding: 32px 16px;
      }

      h2 {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 60px;
        color: #667eea;

        @media (max-width: 768px) {
          font-size: 32px;
          margin-bottom: 40px;
        }

        @media (max-width: 480px) {
          font-size: 28px;
          margin-bottom: 32px;
        }
      }
    }

    .trust-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px;
      max-width: 1000px;
      margin: 0 auto;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      @media (max-width: 480px) {
        gap: 20px;
      }
    }

    .feature {
      background: white;
      padding: 32px 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      @media (max-width: 768px) {
        padding: 24px 20px;
      }

      @media (max-width: 480px) {
        padding: 20px 16px;
      }

      &:hover {
        transform: translateY(-4px);
      }

      .feature-icon {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;

        @media (max-width: 768px) {
          font-size: 40px;
        }

        @media (max-width: 480px) {
          font-size: 36px;
        }
      }

      h4 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: #1f2937;

        @media (max-width: 768px) {
          font-size: 16px;
        }

        @media (max-width: 480px) {
          font-size: 15px;
        }
      }

      p {
        margin: 0;
        line-height: 1.6;
        color: #6b7280;

        @media (max-width: 768px) {
          font-size: 14px;
        }

        @media (max-width: 480px) {
          font-size: 13px;
          line-height: 1.5;
        }
      }
    }

    .get-started-section {
      background: #1e3a8a;
      color: white;
      padding: 80px 40px;
      text-align: center;

      @media (max-width: 768px) {
        padding: 40px 20px;
      }

      @media (max-width: 480px) {
        padding: 32px 16px;
      }

      h2 {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 16px;

        @media (max-width: 768px) {
          font-size: 32px;
        }

        @media (max-width: 480px) {
          font-size: 28px;
        }
      }

      p {
        font-size: 18px;
        margin-bottom: 32px;
        opacity: 0.9;

        @media (max-width: 768px) {
          font-size: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 480px) {
          font-size: 15px;
          margin-bottom: 20px;
        }
      }

      .cta-btn {
        border: 2px solid white;
      }
    }
  `]
})
export class SplashComponent {
  private router = inject(Router);

  navigateToAuth() {
    this.router.navigate(['/auth'], { queryParams: { tab: 'signup' } });
  }

  scrollToHowItWorks() {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}