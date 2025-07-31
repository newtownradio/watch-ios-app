import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CloudflareAuthService } from '../../services/cloudflare-auth.service';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { EmailService } from '../../services/email.service';
import { User } from '../../models/bid.interface';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo and Header -->
        <div class="auth-header">
          <div class="logo">
            <h1>Watch</h1>
          </div>
          <p class="auth-subtitle">Join the trusted marketplace for luxury timepieces</p>
          <div class="auth-actions" *ngIf="isAuthenticated()">
            <button class="btn-link" (click)="logout()">
              Sign Out
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="auth-tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'login'"
            (click)="setActiveTab('login')"
            role="tab"
            [attr.aria-selected]="activeTab === 'login'"
          >
            Sign In
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'register'"
            (click)="setActiveTab('register')"
            role="tab"
            [attr.aria-selected]="activeTab === 'register'"
          >
            Create Account
          </button>
        </div>

        <!-- Login Form -->
        <div class="auth-form" *ngIf="activeTab === 'login'">
          <form (ngSubmit)="login()" #loginForm="ngForm">
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <input 
                type="email" 
                id="login-email"
                [(ngModel)]="loginData.email"
                name="email"
                required
                autocomplete="email"
                placeholder="Enter your email"
              >
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <input 
                type="password" 
                id="login-password"
                [(ngModel)]="loginData.password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!loginForm.valid">
                Sign In
              </button>
              <button type="button" class="btn-link" (click)="setActiveTab('forgot-password')">
                Forgot Password?
              </button>
            </div>
          </form>
        </div>

        <!-- Registration Form -->
        <div class="auth-form" *ngIf="activeTab === 'register'">
          <form (ngSubmit)="register()" #registerForm="ngForm">
            <div class="form-group">
              <label for="register-name">Full Name</label>
              <input 
                type="text" 
                id="register-name"
                [(ngModel)]="registerData.name"
                name="name"
                required
                autocomplete="name"
                placeholder="Enter your full name"
              >
            </div>

            <div class="form-group">
              <label for="register-email">Email Address</label>
              <input 
                type="email" 
                id="register-email"
                [(ngModel)]="registerData.email"
                name="email"
                required
                autocomplete="email"
                placeholder="Enter your email"
              >
            </div>

            <div class="form-group">
              <label for="register-password">Password</label>
              <input 
                type="password" 
                id="register-password"
                [(ngModel)]="registerData.password"
                name="password"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="Create a password"
              >
            </div>

            <div class="form-group">
              <label for="register-confirm-password">Confirm Password</label>
              <input 
                type="password" 
                id="register-confirm-password"
                [(ngModel)]="registerData.confirmPassword"
                name="confirmPassword"
                required
                autocomplete="new-password"
                placeholder="Confirm your password"
              >
            </div>

            <!-- Policy Agreements -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="registerData.privacyPolicy" 
                  name="privacyPolicy"
                  required>
                I agree to the <a href="#" (click)="showPrivacyPolicy($event)">Privacy Policy</a>
              </label>
            </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="registerData.cookiePolicy" 
                  name="cookiePolicy"
                  required>
                I agree to the <a href="#" (click)="showCookiePolicy($event)">Cookie Policy</a>
              </label>
            </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="registerData.termsConditions" 
                  name="termsConditions"
                  required>
                I agree to the <a href="#" (click)="showTermsConditions($event)">Terms & Conditions</a>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!isRegistrationValid()">
                Create Account
              </button>
            </div>
          </form>
        </div>

        <!-- Forgot Password Form -->
        <div class="auth-form" *ngIf="activeTab === 'forgot-password'">
          <h2>Forgot Password</h2>
          <form (ngSubmit)="forgotPassword()" #forgotForm="ngForm">
            <div class="form-group">
              <label for="forgot-email">Email Address</label>
              <input 
                type="email" 
                id="forgot-email"
                [(ngModel)]="forgotPasswordData.email"
                name="email"
                required
                autocomplete="email"
                placeholder="Enter your email"
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!forgotForm.valid">
                Send Reset Code
              </button>
              <button type="button" class="btn-link" (click)="setActiveTab('login')">
                Back to Login
              </button>
            </div>
          </form>
        </div>

        <!-- Reset Password Form -->
        <div class="auth-form" *ngIf="activeTab === 'reset-password'">
          <h2>Reset Password</h2>
          <form (ngSubmit)="resetPassword()" #resetForm="ngForm">
            <div class="form-group">
              <label for="reset-email">Email Address</label>
              <input 
                type="email" 
                id="reset-email"
                [(ngModel)]="resetPasswordData.email"
                name="email"
                required
                autocomplete="email"
                placeholder="Enter your email"
              >
            </div>

            <div class="form-group">
              <label for="reset-code">Verification Code</label>
              <input 
                type="text" 
                id="reset-code"
                [(ngModel)]="resetPasswordData.code"
                name="code"
                required
                placeholder="Enter verification code"
              >
            </div>

            <div class="form-group">
              <label for="reset-password">New Password</label>
              <input 
                type="password" 
                id="reset-password"
                [(ngModel)]="resetPasswordData.password"
                name="password"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="Enter new password"
              >
            </div>

            <div class="form-group">
              <label for="reset-confirm-password">Confirm New Password</label>
              <input 
                type="password" 
                id="reset-confirm-password"
                [(ngModel)]="resetPasswordData.confirmPassword"
                name="confirmPassword"
                required
                autocomplete="new-password"
                placeholder="Confirm new password"
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!resetForm.valid">
                Reset Password
              </button>
              <button type="button" class="btn-link" (click)="setActiveTab('login')">
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal for Privacy Policy, Terms, etc. -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="modal-close" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body" [innerHTML]="modalContent"></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .auth-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo h1 {
      color: #333;
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .auth-subtitle {
      color: #666;
      margin: 10px 0 0 0;
      font-size: 1rem;
    }

    .auth-tabs {
      display: flex;
      margin-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
    }

    .tab-btn {
      flex: 1;
      padding: 15px;
      background: none;
      border: none;
      font-size: 1rem;
      font-weight: 600;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .tab-btn.active {
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-actions {
      margin-top: 30px;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-link {
      background: none;
      border: none;
      color: #667eea;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: underline;
      margin-top: 15px;
    }

    .checkbox-group {
      margin: 15px 0;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      line-height: 1.4;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      margin: 0;
      flex-shrink: 0;
    }

    .checkbox-label a {
      color: #667eea;
      text-decoration: none;
    }

    .checkbox-label a:hover {
      text-decoration: underline;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .modal-body {
      color: #666;
      line-height: 1.6;
    }

    .demo-account-section {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .demo-label {
      font-size: 14px;
      font-weight: 600;
      color: #495057;
      margin: 0 0 10px 0;
    }

    .demo-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 15px;
      transition: background-color 0.3s ease;
    }

    .demo-btn:hover {
      background: #218838;
    }

    .demo-credentials {
      font-size: 13px;
      color: #6c757d;
      margin: 0;
      line-height: 1.4;
    }
  `]
})
export class AuthComponent implements OnInit {
  activeTab = 'login';
  showModal = false;
  modalTitle = '';
  modalContent = '';

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacyPolicy: false,
    cookiePolicy: false,
    termsConditions: false
  };

  forgotPasswordData = {
    email: ''
  };

  resetPasswordData = {
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  };

  currentVerificationCode = '';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dataService = inject(DataPersistenceService);
  private emailService = inject(EmailService);
  private cloudflareAuthService = inject(CloudflareAuthService);

  ngOnInit() {
    // Check if user is already authenticated
    if (this.isAuthenticated()) {
      this.router.navigate(['/discovery']);
      return;
    }

    // Check for password reset flow
    const resetEmail = this.route.snapshot.queryParams['email'];
    const resetCode = this.route.snapshot.queryParams['code'];
    
    if (resetEmail && resetCode) {
      this.activeTab = 'reset-password';
      this.resetPasswordData.email = resetEmail;
      this.resetPasswordData.code = resetCode;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  async login() {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const result = await this.cloudflareAuthService.loginUser({
        email: this.loginData.email,
        password: this.loginData.password
      });

      if (result.success && result.data) {
        this.dataService.setCurrentUser(result.data);
        this.router.navigate(['/discovery']);
      } else {
        alert(result.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  }

  async register() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!this.isRegistrationValid()) {
      alert('Please accept all terms and conditions.');
      return;
    }

    try {
      const result = await this.cloudflareAuthService.registerUser({
        name: this.registerData.name,
        email: this.registerData.email,
        password: this.registerData.password
      });

      if (result.success && result.data) {
        this.dataService.setCurrentUser(result.data);
        alert('Account created successfully!');
        this.router.navigate(['/discovery']);
      } else {
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  }

  async forgotPassword() {
    if (!this.forgotPasswordData.email) {
      alert('Please enter your email address.');
      return;
    }

    try {
      // Show immediate feedback
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      const result = await this.cloudflareAuthService.resetPassword({
        email: this.forgotPasswordData.email
      });

      if (result.success) {
        // Show the verification code in console for immediate access (simulates email)
        if (result.code) {
          console.log('🔐 Verification Code:', result.code);
        }
        
        alert('Password reset code sent to your email! Please check your inbox and enter the verification code below.');
        this.setActiveTab('reset-password');
        this.resetPasswordData.email = this.forgotPasswordData.email;
      } else {
        alert(result.message || 'Failed to send reset code. Please try again.');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      alert('Failed to send reset code. Please try again.');
    } finally {
      // Reset button state
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Reset Code';
      }
    }
  }

  async resetPassword() {
    if (this.resetPasswordData.password !== this.resetPasswordData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const result = await this.cloudflareAuthService.updateUserPassword(
        this.resetPasswordData.email,
        this.resetPasswordData.password,
        this.resetPasswordData.code
      );

      if (result.success) {
        alert('Password updated successfully! Please log in with your new password.');
        this.setActiveTab('login');
        this.loginData.email = this.resetPasswordData.email;
      } else {
        alert(result.message || 'Failed to update password. Please try again.');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      alert('Failed to update password. Please try again.');
    }
  }

  isRegistrationValid(): boolean {
    return this.registerData.privacyPolicy && 
           this.registerData.cookiePolicy && 
           this.registerData.termsConditions;
  }

  showPrivacyPolicy(event: Event) {
    event.preventDefault();
    this.modalTitle = 'Privacy Policy';
    this.modalContent = `
      <h4>Privacy Policy</h4>
      <p>We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our app.</p>
      <p><strong>Information We Collect:</strong></p>
      <ul>
        <li>Account information (email, name)</li>
        <li>Usage data and app interactions</li>
        <li>Device information</li>
      </ul>
      <p><strong>How We Use Your Information:</strong></p>
      <ul>
        <li>To provide and maintain our services</li>
        <li>To process transactions</li>
        <li>To send important updates</li>
        <li>To improve our services</li>
      </ul>
      <p><strong>Data Security:</strong></p>
      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      <p><strong>Contact Us:</strong></p>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@watchios.com</p>
    `;
    this.showModal = true;
  }

  showCookiePolicy(event: Event) {
    event.preventDefault();
    this.modalTitle = 'Cookie Policy';
    this.modalContent = `
      <h4>Cookie Policy</h4>
      <p>This Cookie Policy explains how we use cookies and similar technologies to recognize you when you visit our app.</p>
      <p><strong>What Are Cookies:</strong></p>
      <p>Cookies are small data files that are placed on your device when you visit our app. They help us provide you with a better experience.</p>
      <p><strong>How We Use Cookies:</strong></p>
      <ul>
        <li>To remember your preferences</li>
        <li>To analyze app usage</li>
        <li>To improve app performance</li>
        <li>To provide personalized content</li>
      </ul>
      <p><strong>Managing Cookies:</strong></p>
      <p>You can control and manage cookies through your device settings. However, disabling cookies may affect app functionality.</p>
    `;
    this.showModal = true;
  }

  showTermsConditions(event: Event) {
    event.preventDefault();
    this.modalTitle = 'Terms & Conditions';
    this.modalContent = `
      <h4>Terms & Conditions</h4>
      <p>By using our app, you agree to these terms and conditions.</p>
      <p><strong>Acceptable Use:</strong></p>
      <ul>
        <li>You must use the app in accordance with applicable laws</li>
        <li>You are responsible for maintaining the security of your account</li>
        <li>You must not use the app for any illegal or unauthorized purpose</li>
      </ul>
      <p><strong>User Responsibilities:</strong></p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Maintain the confidentiality of your account</li>
        <li>Notify us immediately of any security concerns</li>
      </ul>
      <p><strong>Limitation of Liability:</strong></p>
      <p>We are not liable for any indirect, incidental, or consequential damages arising from your use of the app.</p>
      <p><strong>Changes to Terms:</strong></p>
      <p>We may update these terms from time to time. Continued use of the app constitutes acceptance of any changes.</p>
    `;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  isAuthenticated(): boolean {
    return this.dataService.isAuthenticated();
  }

  logout() {
    this.cloudflareAuthService.logout();
    this.dataService.logout();
    window.location.href = '/';
  }

  async createDemoAccount() {
    try {
      const result = await this.cloudflareAuthService.createDemoAccount();
      if (result.success) {
        this.showModal = true;
        this.modalTitle = 'Demo Account Created';
        this.modalContent = `
          <p><strong>Demo account has been created successfully!</strong></p>
          <p>You can now login with these credentials:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Email:</strong> demo@watchios.com</p>
            <p><strong>Password:</strong> Demo123!</p>
          </div>
          <p>This account is pre-verified and ready for testing all app features.</p>
        `;
      } else {
        this.showModal = true;
        this.modalTitle = 'Demo Account';
        this.modalContent = `
          <p><strong>Demo account already exists!</strong></p>
          <p>You can login with these credentials:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Email:</strong> demo@watchios.com</p>
            <p><strong>Password:</strong> Demo123!</p>
          </div>
        `;
      }
    } catch (error) {
      this.showModal = true;
      this.modalTitle = 'Error';
      this.modalContent = 'Failed to create demo account. Please try again.';
    }
  }
} 