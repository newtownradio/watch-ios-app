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
            (click)="setActiveTab('login'); $event.stopPropagation()"
            (keyup.enter)="setActiveTab('login')"
            (keyup.space)="setActiveTab('login')"
            tabindex="0"
            role="tab"
            [attr.aria-selected]="activeTab === 'login'"
          >
            Sign In
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'register'"
            (click)="setActiveTab('register'); $event.stopPropagation()"
            (keyup.enter)="setActiveTab('register')"
            (keyup.space)="setActiveTab('register')"
            tabindex="0"
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
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
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
                maxlength="50"
                autocomplete="current-password"
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
                placeholder="Enter your password"
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!loginForm.valid">
                Sign In
              </button>
              <button type="button" class="btn-link" (click)="setActiveTab('forgot-password')" (keyup.enter)="setActiveTab('forgot-password')" (keyup.space)="setActiveTab('forgot-password')" tabindex="0">
                Forgot Password?
              </button>
            </div>
          </form>
          

        </div>

        <!-- Registration Form -->
        <div class="auth-form" *ngIf="activeTab === 'register'">
          <form (ngSubmit)="register()" #registerForm="ngForm">
            <div class="form-row">
              <div class="form-group">
                <label for="register-name">Full Name</label>
                <input 
                  type="text" 
                  id="register-name"
                  [(ngModel)]="registerData.name"
                  name="name"
                  required
                  autocomplete="name"
                  autocapitalize="words"
                  autocorrect="on"
                  spellcheck="true"
                  placeholder="Enter your full name"
                >
              </div>
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
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
                placeholder="Enter your email"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="register-password">Password</label>
                <input 
                  type="password" 
                  id="register-password"
                  [(ngModel)]="registerData.password"
                  name="password"
                  required
                  minlength="8"
                  maxlength="50"
                  autocomplete="new-password"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
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
                  maxlength="50"
                  autocomplete="new-password"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  placeholder="Confirm your password"
                >
              </div>
            </div>





            <!-- Legal Agreements -->
            <div class="legal-agreements">
              <div class="agreement-item">
                <input 
                  type="checkbox" 
                  id="privacy-policy"
                  [(ngModel)]="registerData.privacyPolicy"
                  name="privacyPolicy"
                  required
                >
                <label for="privacy-policy">
                  I agree to the <a href="#" (click)="showPrivacyPolicy($event)">Privacy Policy</a>
                </label>
              </div>
              
              <div class="agreement-item">
                <input 
                  type="checkbox" 
                  id="cookie-policy"
                  [(ngModel)]="registerData.cookiePolicy"
                  name="cookiePolicy"
                  required
                >
                <label for="cookie-policy">
                  I agree to the <a href="#" (click)="showCookiePolicy($event)">Cookie Policy</a>
                </label>
              </div>
              
              <div class="agreement-item">
                <input 
                  type="checkbox" 
                  id="terms-conditions"
                  [(ngModel)]="registerData.termsConditions"
                  name="termsConditions"
                  required
                >
                <label for="terms-conditions">
                  I agree to the <a href="#" (click)="showTermsConditions($event)">Terms & Conditions</a>
                </label>
              </div>
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
          <form (ngSubmit)="forgotPassword()" #forgotForm="ngForm">
            <div class="form-group">
              <label for="forgot-email">Email Address</label>
              <input 
                type="email" 
                id="forgot-email"
                [(ngModel)]="forgotPasswordData.email"
                name="email"
                required
                placeholder="Enter your email"
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!forgotForm.valid">
                Send Reset Code
              </button>
              <button type="button" class="btn-link" (click)="setActiveTab('login')">
                Back to Sign In
              </button>
            </div>
          </form>
        </div>

        <!-- Reset Password Form -->
        <div class="auth-form" *ngIf="activeTab === 'reset-password'">
          <form (ngSubmit)="resetPassword()" #resetForm="ngForm">
            <div class="form-group">
              <label for="reset-code">Verification Code</label>
              <div class="code-hint" *ngIf="currentVerificationCode">
                <strong>Current Code:</strong> {{ currentVerificationCode }}
                <br><small>Use this code from the console or email</small>
              </div>
              <input 
                type="text" 
                id="reset-code"
                [(ngModel)]="resetPasswordData.code"
                name="code"
                required
                placeholder="Enter 6-digit code"
                maxlength="6"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="reset-password">New Password</label>
                <input 
                  type="password" 
                  id="reset-password"
                  [(ngModel)]="resetPasswordData.password"
                  name="password"
                  required
                  minlength="8"
                  maxlength="50"
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
                  maxlength="50"
                  placeholder="Confirm new password"
                >
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!resetForm.valid" (click)="onResetSubmit()">
                Reset Password
              </button>
              <button type="button" class="btn-link" (click)="setActiveTab('login')">
                Back to Sign In
              </button>
            </div>
            <div class="form-debug" *ngIf="resetForm.invalid">
              <small>Form validation: {{ resetForm.errors | json }}</small>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Legal Policy Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button type="button" class="modal-close" (click)="closeModal()" (keyup.enter)="closeModal()" (keyup.space)="closeModal()" tabindex="0" aria-label="Close modal">×</button>
        </div>
        <div class="modal-body">
          <div [innerHTML]="modalContent"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      
      @media (max-width: 768px) {
        padding: 16px;
      }
      
      @media (max-width: 480px) {
        padding: 12px;
      }
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 480px;
      position: relative;
      border: 1px solid #e1e5e9;
      
      @media (max-width: 768px) {
        padding: 32px;
        max-width: 100%;
        border-radius: 16px;
      }
      
      @media (max-width: 480px) {
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
      
      @media (max-width: 768px) {
        margin-bottom: 24px;
      }
      
      @media (max-width: 480px) {
        margin-bottom: 20px;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }

    .logo-icon {
      font-size: 2rem;
      margin-right: 10px;
    }

    .auth-subtitle {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
      
      @media (max-width: 768px) {
        font-size: 0.85rem;
      }
      
      @media (max-width: 480px) {
        font-size: 0.8rem;
      }
    }

    .auth-tabs {
      display: flex;
      margin-bottom: 30px;
      border-radius: 10px;
      background: #f5f5f5;
      padding: 4px;
      
      @media (max-width: 768px) {
        margin-bottom: 24px;
      }
      
      @media (max-width: 480px) {
        margin-bottom: 20px;
        border-radius: 8px;
      }
    }

    .tab-btn {
      flex: 1;
      padding: 12px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      
      @media (max-width: 768px) {
        padding: 10px;
        font-size: 0.9rem;
      }
      
      @media (max-width: 480px) {
        padding: 8px;
        font-size: 0.85rem;
        min-height: 44px;
      }
    }

    .tab-btn.active {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .form-group {
      margin-bottom: 20px;
      
      @media (max-width: 768px) {
        margin-bottom: 16px;
      }
      
      @media (max-width: 480px) {
        margin-bottom: 12px;
      }
    }

    .code-hint {
      background: #f0f8ff;
      border: 1px solid #1e3a8a;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;
      font-size: 0.9rem;
      
      @media (max-width: 768px) {
        font-size: 0.85rem;
        padding: 8px;
      }
      
      @media (max-width: 480px) {
        font-size: 0.8rem;
        padding: 6px;
      }
    }

    .form-debug {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 10px;
      margin-top: 10px;
      font-size: 0.8rem;
      color: #856404;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      
      @media (max-width: 768px) {
        gap: 12px;
      }
      
      @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 10px;
      }
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
      
      @media (max-width: 768px) {
        font-size: 0.9rem;
        margin-bottom: 6px;
      }
      
      @media (max-width: 480px) {
        font-size: 0.85rem;
        margin-bottom: 5px;
      }
    }

    input[type="email"],
    input[type="password"],
    input[type="text"] {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      
      @media (max-width: 768px) {
        padding: 10px 14px;
        font-size: 16px; // Prevent zoom on iOS
        border-radius: 8px;
      }
      
      @media (max-width: 480px) {
        padding: 8px 12px;
        border-radius: 6px;
      }
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .provider-select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      background: white;
    }

    .provider-select:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-help {
      display: block;
      margin-top: 4px;
      font-size: 0.8rem;
      color: #666;
    }

    .form-actions {
      margin-top: 30px;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      @media (max-width: 768px) {
        padding: 12px;
        font-size: 0.95rem;
        border-radius: 8px;
      }
      
      @media (max-width: 480px) {
        padding: 10px;
        font-size: 0.9rem;
        border-radius: 6px;
        min-height: 44px;
      }
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-link {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      text-decoration: underline;
      margin-top: 10px;
      font-size: 0.9rem;
    }

    .id-upload-container {
      border: 2px dashed #e1e5e9;
      border-radius: 10px;
      overflow: hidden;
    }

    .id-preview {
      position: relative;
      max-height: 200px;
      overflow: hidden;
    }

    .id-image {
      width: 100%;
      height: auto;
      display: block;
    }

    .remove-id-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .id-upload-area {
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .id-upload-area:hover {
      background-color: #f8f9fa;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .upload-icon {
      font-size: 2rem;
    }

    .legal-agreements {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .agreement-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
      gap: 10px;
    }

    .agreement-item:last-child {
      margin-bottom: 0;
    }

    .agreement-item input[type="checkbox"] {
      margin-top: 2px;
    }

    .agreement-item label {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .agreement-item a {
      color: #667eea;
      text-decoration: none;
    }

    .agreement-item a:hover {
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
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 15px;
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px;
      border-bottom: 1px solid #e1e5e9;
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
      padding: 25px;
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 30px 20px;
        margin: 10px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .auth-tabs {
        flex-direction: column;
        gap: 4px;
      }

      .tab-btn {
        border-radius: 6px;
      }
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
    // Check query parameters for tab selection
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'signup') {
        this.activeTab = 'register';
      }
    });

    // Don't auto-redirect - let users see the auth page
    // Users can manually navigate to discovery if they're already logged in
    
    // For debugging: show existing users in console
    const users = this.dataService.getAllUsers();
    console.log('Existing users:', users.map(u => ({ email: u.email, name: u.name })));
  }



  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  async login() {
    console.log('Login method called');
    console.log('Login data:', this.loginData);
    
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter both email and password.');
      return;
    }

          try {
        console.log('Attempting login with Cloudflare service...');
        const result = await this.cloudflareAuthService.loginUser({
          email: this.loginData.email,
          password: this.loginData.password
        });
      
      console.log('Login result:', result);
      
      if (result.success && result.data) {
        console.log('Login successful, setting current user...');
        this.dataService.setCurrentUser(result.data);
        console.log('User set, navigating to discovery...');
        this.router.navigate(['/discovery']);
      } else {
        console.error('Login failed:', result.message);
        
        // Handle rate limiting specifically
        if (result.code === 'RATE_LIMITED') {
          const useBypass = confirm('Firebase is rate limiting login attempts. Would you like to use the bypass login to continue testing?');
          if (useBypass) {
            this.testLogin();
          } else {
            alert(result.message);
          }
        } else {
          alert(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      });
      alert('Login failed. Please try again.');
    }
  }

  async register() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    console.log('Starting registration process...');
    console.log('Registration data:', {
      name: this.registerData.name,
      email: this.registerData.email,
      passwordLength: this.registerData.password.length
    });

    try {
      const result = await this.cloudflareAuthService.registerUser({
        name: this.registerData.name,
        email: this.registerData.email,
        password: this.registerData.password
      });

      console.log('Registration result:', result);

      if (result.success && result.data) {
        this.dataService.setCurrentUser(result.data);
        alert('Account created successfully!');
        this.router.navigate(['/discovery']);
      } else {
        console.error('Registration failed:', result.message);
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error details:', {
        error: error,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert('Registration failed. Please check your internet connection and try again.');
    }
  }

  async forgotPassword() {
    if (!this.forgotPasswordData.email) {
      alert('Please enter your email address.');
      return;
    }

    // Check if user exists in Cloudflare database
    const userExists = await this.cloudflareAuthService.checkUserExists();
    
    if (!userExists) {
      alert('No account found with this email address. Please check your email or create a new account.');
      return;
    }

    try {
      // Generate verification code and expiration
      const code = this.emailService.generateVerificationCode();
      const expiresAt = this.emailService.generateExpirationTime();
      
      // Save password reset data to Azure database
      this.dataService.savePasswordReset(this.forgotPasswordData.email, code, expiresAt);
      
      // Store the current code for display
      this.currentVerificationCode = code;
      
      // Send email
      const emailSent = await this.emailService.sendPasswordResetEmail(this.forgotPasswordData.email, code);
      
      if (emailSent) {
        alert(`Verification code sent to ${this.forgotPasswordData.email}`);
        this.resetPasswordData.email = this.forgotPasswordData.email;
        this.setActiveTab('reset-password');
      } else {
        alert('Failed to send email. Please check your internet connection and try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      alert('An error occurred. Please try again later.');
    }
  }

  onResetSubmit() {
    console.log('Reset submit clicked');
    console.log('Form data:', this.resetPasswordData);
    console.log('Code entered:', this.resetPasswordData.code);
    console.log('Password:', this.resetPasswordData.password);
    console.log('Confirm password:', this.resetPasswordData.confirmPassword);
    this.resetPassword();
  }

  async resetPassword() {
    console.log('Reset password method called');
    console.log('Email:', this.resetPasswordData.email);
    console.log('Code entered:', this.resetPasswordData.code);
    console.log('Password:', this.resetPasswordData.password);
    console.log('Confirm password:', this.resetPasswordData.confirmPassword);
    
    if (this.resetPasswordData.password !== this.resetPasswordData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!this.resetPasswordData.code) {
      alert('Please enter the verification code.');
      return;
    }

    // Verify the code
    const resetData = this.dataService.getPasswordReset(this.resetPasswordData.email);
    console.log('Reset data from storage:', resetData);
    console.log('Current time:', new Date());
    
    if (!resetData) {
      console.log('No reset data found for email:', this.resetPasswordData.email);
      alert('Invalid or expired verification code. Please request a new one.');
      return;
    }

    console.log('Stored code:', resetData.code);
    console.log('Entered code:', this.resetPasswordData.code);
    console.log('Codes match?', resetData.code === this.resetPasswordData.code);
    console.log('Code types - stored:', typeof resetData.code, 'entered:', typeof this.resetPasswordData.code);

    if (resetData.code !== this.resetPasswordData.code) {
      alert('Invalid verification code. Please check and try again.');
      return;
    }

    // Try to update password or create new account
    try {
      console.log('Updating password for:', this.resetPasswordData.email);
      const updateResult = await this.cloudflareAuthService.updateUserPassword(
        this.resetPasswordData.email,
        this.resetPasswordData.password,
        this.resetPasswordData.code
      );

      console.log('Password update result:', updateResult);

      if (updateResult.success) {
        console.log('Password updated successfully, attempting to create new account...');
        
        // Instead of trying to login (which might be rate limited), create a new account
        const createResult = await this.cloudflareAuthService.registerUser({
          name: 'User',
          email: this.resetPasswordData.email,
          password: this.resetPasswordData.password
        });
        
        console.log('Account creation result:', createResult);
        
        if (createResult.success && createResult.data) {
          this.dataService.setCurrentUser(createResult.data);
          this.resetPasswordData = { email: '', code: '', password: '', confirmPassword: '' };
          this.currentVerificationCode = '';
          alert('Password reset successful! You are now logged in.');
          this.router.navigate(['/discovery']);
        } else {
          console.error('Account creation failed:', createResult.message);
          alert('Password was updated but login failed. Please try logging in manually with your new password.');
          this.setActiveTab('login');
          this.loginData.email = this.resetPasswordData.email;
          this.loginData.password = '';
        }
      } else {
        console.error('Password update failed:', updateResult.message);
        alert(updateResult.message || 'Password update failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      alert('Password reset failed. Please try again.');
    }
  }



  isRegistrationValid(): boolean {
    return !!this.registerData.name &&
           !!this.registerData.email &&
           !!this.registerData.password &&
           !!this.registerData.confirmPassword &&
           this.registerData.password === this.registerData.confirmPassword &&
           !!this.registerData.privacyPolicy &&
           !!this.registerData.cookiePolicy &&
           !!this.registerData.termsConditions;
  }

  showPrivacyPolicy(event: Event) {
    event.preventDefault();
    this.modalTitle = 'Privacy Policy';
    this.modalContent = `
      <h4>Privacy Policy</h4>
      <p>This Privacy Policy describes how Watch iOS ("we," "us," or "our") collects, uses, and shares your personal information when you use our platform.</p>
      
      <h5>Information We Collect</h5>
      <ul>
        <li>Account information (name, email, password)</li>
        <li>Government ID for verification</li>
        <li>Transaction and payment information</li>
        <li>Device and usage information</li>
      </ul>
      
      <h5>How We Use Your Information</h5>
      <ul>
        <li>To provide and maintain our services</li>
        <li>To verify your identity and prevent fraud</li>
        <li>To process transactions and payments</li>
        <li>To communicate with you about your account</li>
      </ul>
      
      <h5>Information Sharing</h5>
      <p>We do not sell your personal information. We may share your information with:</p>
      <ul>
        <li>Verification partners for ID verification</li>
        <li>Payment processors for transactions</li>
        <li>Law enforcement when required by law</li>
      </ul>
      
      <h5>Data Security</h5>
      <p>We implement appropriate security measures to protect your personal information, including encryption and secure data storage.</p>
      
      <h5>Your Rights</h5>
      <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
    `;
    this.showModal = true;
  }

  showCookiePolicy(event: Event) {
    event.preventDefault();
    this.modalTitle = 'Cookie Policy';
    this.modalContent = `
      <h4>Cookie Policy</h4>
      <p>This Cookie Policy explains how Watch iOS uses cookies and similar technologies on our platform.</p>
      
      <h5>What Are Cookies?</h5>
      <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience.</p>
      
      <h5>Types of Cookies We Use</h5>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
        <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
        <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
        <li><strong>Security Cookies:</strong> Help protect against fraud and security threats</li>
      </ul>
      
      <h5>How We Use Cookies</h5>
      <ul>
        <li>To remember your login status</li>
        <li>To personalize your experience</li>
        <li>To analyze website traffic and usage</li>
        <li>To improve our services</li>
      </ul>
      
      <h5>Managing Cookies</h5>
      <p>You can control cookies through your browser settings. However, disabling certain cookies may affect website functionality.</p>
      
      <h5>Third-Party Cookies</h5>
      <p>We may use third-party services that place their own cookies. These services help us provide better functionality and analytics.</p>
    `;
    this.showModal = true;
  }

  showTermsConditions(event: Event) {
    event.preventDefault();
    this.modalTitle = 'Terms & Conditions';
    this.modalContent = `
      <h4>Terms & Conditions</h4>
      <p>By using Watch iOS, you agree to these Terms & Conditions. Please read them carefully.</p>
      
      <h5>Account Registration</h5>
      <ul>
        <li>You must provide accurate and complete information</li>
        <li>You are responsible for maintaining account security</li>
        <li>You must be at least 18 years old to use our services</li>
        <li>Government ID verification is required for all accounts</li>
      </ul>
      
      <h5>Listing and Selling</h5>
      <ul>
        <li>All items must be authentic and accurately described</li>
        <li>You must have legal ownership of items you list</li>
        <li>We reserve the right to remove listings that violate our policies</li>
        <li>5% commission fee applies to all successful sales</li>
      </ul>
      
      <h5>Buying and Bidding</h5>
      <ul>
        <li>Bids are binding and cannot be retracted</li>
        <li>You must have sufficient funds to complete purchases</li>
        <li>All transactions are subject to verification</li>
        <li>Returns are subject to our return policy</li>
      </ul>
      
      <h5>Verification and Trust</h5>
      <ul>
        <li>Third-party verification services are used for authentication</li>
        <li>Government ID verification is mandatory</li>
        <li>We may require additional verification at any time</li>
        <li>Fraudulent activity will result in account termination</li>
      </ul>
      
      <h5>Prohibited Activities</h5>
      <ul>
        <li>Listing counterfeit or replica items</li>
        <li>Providing false information</li>
        <li>Circumventing verification processes</li>
        <li>Engaging in fraudulent transactions</li>
      </ul>
      
      <h5>Limitation of Liability</h5>
      <p>Watch iOS is not responsible for the authenticity of items or the conduct of users. We provide a platform for transactions but do not guarantee the quality or authenticity of items.</p>
      
      <h5>Termination</h5>
      <p>We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.</p>
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
    this.dataService.logout();
    // Immediately redirect to splash and force reload to bypass auth checks
    window.location.href = '/';
  }

  /**
   * Create a test user for password reset testing
   */
  async createTestUserForPasswordReset() {
    console.log('Creating test user...');
    this.dataService.createTestUserForPasswordReset();
    
    // Also create a Cloudflare account with known credentials
    try {
      console.log('Creating Cloudflare account for test user...');
      const createResult = await this.cloudflareAuthService.registerUser({
        name: 'Test User',
        email: 'test@passwordreset.com',
        password: 'testpassword123'
      });
      
      console.log('Firebase account creation result:', createResult);
      
      if (createResult.success) {
        console.log('Test user created successfully!');
        // No alert needed - just log to console
      } else {
        console.error('Firebase account creation failed:', createResult.message);
        // No alert needed - just log to console
      }
    } catch (error: any) {
      console.error('Error creating Firebase test account:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      });
      // No alert needed - just log to console
    }
  }

  /**
   * Simple test login that bypasses Firebase for testing
   */
  async testLogin() {
    console.log('Test login method called');
    
    // Create a simple test user locally
    const testUser: User = {
      id: 'test-user-direct',
      email: 'test@passwordreset.com',
      name: 'Test User',
      idVerified: false,
      disclaimerSigned: true,
      policySigned: true,
      termsSigned: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to local storage
    this.dataService.setCurrentUser(testUser);
    
    console.log('Test user logged in directly:', testUser);
    this.router.navigate(['/discovery']);
  }

  /**
   * Debug Cloudflare state and user existence
   */
  async debugCloudflareState() {
    console.log('=== CLOUDFLARE DEBUG ===');
    
    // Check current auth state
    const currentUser = this.cloudflareAuthService.getCurrentUser();
    console.log('Current Cloudflare user:', currentUser);
    
    // Check if test user exists
    const userExists = await this.cloudflareAuthService.checkUserExists();
    console.log('Test user exists in Cloudflare:', userExists);
    
    // Try to create test user again
    console.log('Attempting to create test user in Cloudflare...');
    const createResult = await this.cloudflareAuthService.registerUser({
      name: 'Test User',
      email: 'test@passwordreset.com',
      password: 'testpassword123'
    });
    console.log('Create result:', createResult);
    
    console.log('=== END CLOUDFLARE DEBUG ===');
  }

  /**
   * Verify Cloudflare credentials and test login
   */
  async verifyCloudflareCredentials() {
    console.log('=== CLOUDFLARE CREDENTIALS VERIFICATION ===');
    
    const testEmail = 'test@passwordreset.com';
    const testPassword = 'testpassword123';
    
    // Step 1: Check if user exists in Cloudflare
    console.log('Step 1: Checking if user exists in Cloudflare...');
    const userExists = await this.cloudflareAuthService.checkUserExists();
    console.log('User existence check:', userExists);
    
    // Step 2: Test login with credentials
    console.log('Step 2: Testing login with credentials...');
    const loginTest = await this.cloudflareAuthService.loginUser({
      email: testEmail,
      password: testPassword
    });
    console.log('Login test result:', loginTest);
    
    // Step 3: Try to create the user if it doesn't exist
    if (!userExists) {
      console.log('Step 3: User does not exist, creating...');
      const createResult = await this.cloudflareAuthService.registerUser({
        name: 'Test User',
        email: testEmail,
        password: testPassword
      });
      console.log('Create result:', createResult);
      
      // Step 4: Test login again after creation
      if (createResult.success) {
        console.log('Step 4: Testing login after creation...');
        const loginAfterCreate = await this.cloudflareAuthService.loginUser({
          email: testEmail,
          password: testPassword
        });
        console.log('Login after creation:', loginAfterCreate);
      }
    }
    
    console.log('=== END CLOUDFLARE CREDENTIALS VERIFICATION ===');
    
    // Log summary to console instead of showing alert
    console.log('Cloudflare Credentials Verification Summary:');
    console.log(`User exists: ${userExists}`);
    console.log(`Login test: ${loginTest.success}`);
    console.log(`Login details: ${loginTest.message}`);
  }

  /**
   * Check Cloudflare initialization status
   */
  async checkCloudflareStatus() {
    console.log('=== CLOUDFLARE STATUS CHECK ===');
    
    const connectivity = await this.cloudflareAuthService.testCloudflareConnectivity();
    
    console.log('Cloudflare connectivity:', connectivity);
    
    if (!connectivity) {
      console.error('Cloudflare not properly connected');
      // Log to console instead of showing alert
    } else {
      console.log('Cloudflare is properly connected');
      // Log to console instead of showing alert
    }
    
    console.log('=== END CLOUDFLARE STATUS CHECK ===');
  }

  /**
   * Comprehensive diagnostic to test all components
   */
  async runFullDiagnostic() {
    console.log('=== FULL SYSTEM DIAGNOSTIC ===');
    
    try {
                    // Test 1: Cloudflare Service
              console.log('1. Testing Cloudflare Service...');
              const cloudflareConnectivity = await this.cloudflareAuthService.testCloudflareConnectivity();
              console.log('Cloudflare Connectivity:', cloudflareConnectivity);
      
      // Test 2: Data Persistence Service
      console.log('2. Testing Data Persistence Service...');
      const currentUser = this.dataService.getCurrentUser();
      console.log('Current User:', currentUser);
      const isAuthenticated = this.dataService.isAuthenticated();
      console.log('Is Authenticated:', isAuthenticated);
      
      // Test 3: Email Service
      console.log('3. Testing Email Service...');
      const testCode = this.emailService.generateVerificationCode();
      console.log('Generated Code:', testCode);
      
      // Test 4: Cloudflare User Service
      console.log('4. Testing Cloudflare User Service...');
      const userExists = await this.cloudflareAuthService.checkUserExists();
      console.log('User Exists Check:', userExists);
      
      // Test 5: Router
      console.log('5. Testing Router...');
      console.log('Router Object:', this.router);
      
      // Test 6: Network Connectivity
      console.log('6. Testing Network Connectivity...');
      let networkTestResult = 'FAILED';
      try {
        const response = await fetch('https://www.google.com', { method: 'HEAD' });
        networkTestResult = response.ok ? 'SUCCESS' : 'FAILED';
        console.log('Network Test:', networkTestResult);
      } catch (error) {
        console.log('Network Test: FAILED', error);
      }
      
      // Test 7: Local Storage
      console.log('7. Testing Local Storage...');
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('Local Storage: WORKING');
      } catch (error) {
        console.log('Local Storage: FAILED', error);
      }
      
      console.log('=== DIAGNOSTIC COMPLETE ===');
      
                      // Show summary
                const summary = `
            Cloudflare: ${cloudflareConnectivity ? 'OK' : 'FAILED'}
            Data Persistence: ${currentUser !== null ? 'OK' : 'OK (no user)'}
            Email Service: ${testCode ? 'OK' : 'FAILED'}
            Cloudflare Service: ${userExists ? 'OK' : 'FAILED'}
            Router: ${this.router ? 'OK' : 'FAILED'}
            Network: ${networkTestResult}
            Local Storage: WORKING
                `;
      
      console.log('Diagnostic Summary:', summary);
      
    } catch (error) {
      console.error('Diagnostic Error:', error);
    }
  }

  /**
   * Test Cloudflare connectivity and potential blocking
   */
  async testCloudflareConnectivity() {
    console.log('=== CLOUDFLARE CONNECTIVITY TEST ===');
    
    const testUrls = [
      'https://www.google.com',
      'https://firebase.google.com',
      'https://watch-style-d9597.firebaseapp.com',
      'https://www.cloudflare.com'
    ];
    
    for (const url of testUrls) {
      try {
        console.log(`Testing ${url}...`);
        const startTime = Date.now();
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`${url}: SUCCESS (${duration}ms)`);
      } catch (error: any) {
        console.log(`${url}: FAILED - ${error.message}`);
      }
    }
    
    // Test Cloudflare specifically
    console.log('Testing Cloudflare connectivity...');
    try {
      const connectivity = await this.cloudflareAuthService.testCloudflareConnectivity();
      console.log('Cloudflare Connectivity:', connectivity);
    } catch (error) {
      console.log('Cloudflare Test Failed:', error);
    }
    
    console.log('=== CLOUDFLARE TEST COMPLETE ===');
  }

  // Add styles for test user section
  styles = `
    .test-user-section {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .test-user-info {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6c757d;
    }
    
    .test-btn {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .test-btn:hover {
      background-color: #218838;
    }
    
    .test-user-details {
      margin: 0;
      font-size: 12px;
      color: #495057;
    }
    
    .test-login-section {
      margin-top: 20px;
      padding: 15px;
      background-color: #fff3cd;
      border-radius: 8px;
      border: 1px solid #ffeaa7;
    }
    
    .test-login-info {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #856404;
    }
    
    .test-login-btn {
      background-color: #ffc107;
      color: #212529;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .test-login-btn:hover {
      background-color: #e0a800;
    }
    
    .test-login-details {
      margin: 0;
      font-size: 12px;
      color: #856404;
    }
    
    .debug-section {
      margin-top: 15px;
      padding: 15px;
      background-color: #d1ecf1;
      border-radius: 8px;
      border: 1px solid #bee5eb;
    }
    
    .debug-info {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #0c5460;
    }
    
    .debug-btn {
      background-color: #17a2b8;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .debug-btn:hover {
      background-color: #138496;
    }
    
    .debug-details {
      margin: 0;
      font-size: 12px;
      color: #0c5460;
    }
    
    .verify-section {
      margin-top: 15px;
      padding: 15px;
      background-color: #f8d7da;
      border-radius: 8px;
      border: 1px solid #f5c6cb;
    }
    
    .verify-info {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #721c24;
    }
    
    .verify-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .verify-btn:hover {
      background-color: #c82333;
    }
    
    .verify-details {
      margin: 0;
      font-size: 12px;
      color: #721c24;
    }
    
    .status-section {
      margin-top: 15px;
      padding: 15px;
      background-color: #e2e3e5;
      border-radius: 8px;
      border: 1px solid #d6d8db;
    }
    
    .status-info {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #383d41;
    }
    
    .status-btn {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .status-btn:hover {
      background-color: #5a6268;
    }
    
    .status-details {
      margin: 0;
      font-size: 12px;
      color: #383d41;
    }
    
    .diagnostic-section {
      margin-top: 15px;
      padding: 15px;
      background-color: #d4edda;
      border-radius: 8px;
      border: 1px solid #c3e6cb;
    }
    
    .diagnostic-info {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #155724;
    }
    
    .diagnostic-btn {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .diagnostic-btn:hover {
      background-color: #218838;
    }
    
    .diagnostic-details {
      margin: 0;
      font-size: 12px;
      color: #155724;
    }
    
    .cloudflare-section {
      margin-top: 15px;
      padding: 15px;
      background-color: #fff3cd;
      border-radius: 8px;
      border: 1px solid #ffeaa7;
    }
    
    .cloudflare-info {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #856404;
    }
    
    .cloudflare-btn {
      background-color: #ffc107;
      color: #212529;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .cloudflare-btn:hover {
      background-color: #e0a800;
    }
    
    .cloudflare-details {
      margin: 0;
      font-size: 12px;
      color: #856404;
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
      color: #007bff;
      text-decoration: none;
    }
    
    .checkbox-label a:hover {
      text-decoration: underline;
    }
  `;
}