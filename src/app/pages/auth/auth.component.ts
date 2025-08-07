import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CloudflareAuthService } from '../../services/cloudflare-auth.service';
import { AppleAuthService } from '../../services/apple-auth.service';
import { DataPersistenceService } from '../../services/data-persistence.service';
import { KeychainService } from '../../services/keychain.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  activeTab = 'login';
  showModal = false;
  modalTitle = '';
  modalContent = '';

  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
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

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dataService = inject(DataPersistenceService);
  private cloudflareAuthService = inject(CloudflareAuthService);
  private appleAuthService = inject(AppleAuthService);
  private keychainService = inject(KeychainService);

  async ngOnInit() {
    // Temporarily force login tab to show
    this.activeTab = 'login';
    
    // Temporarily disable authentication check
    // if (this.isAuthenticated()) {
    //   this.router.navigate(['/discovery']);
    //   return;
    // }

    const resetEmail = this.route.snapshot.queryParams['email'];
    const resetCode = this.route.snapshot.queryParams['code'];
    
    if (resetEmail && resetCode) {
      this.activeTab = 'reset';
      this.resetPasswordData.email = resetEmail;
      this.resetPasswordData.code = resetCode;
    }
  }

  setActiveTab(tab: string) {
    console.log('Setting active tab to:', tab);
    this.activeTab = tab;
    console.log('Active tab is now:', this.activeTab);
  }

  async login() {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const result = await this.cloudflareAuthService.loginUser({
        email: this.loginData.email,
        password: this.loginData.password,
        rememberMe: this.loginData.rememberMe
      });

      if (result.success && result.data) {
        this.dataService.setCurrentUser(result.data);
        this.router.navigate(['/discovery']);
      } else {
        alert(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
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
        password: this.registerData.password,
        rememberMe: this.registerData.rememberMe
      });

      if (result.success && result.data) {
        this.dataService.setCurrentUser(result.data);
        alert('Account created successfully!');
        this.router.navigate(['/discovery']);
      } else {
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
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
      const result = await this.cloudflareAuthService.resetPassword({
        email: this.forgotPasswordData.email
      });

      if (result.success) {
        if (result.code) {
          console.log('🔐 Verification Code:', result.code);
        }
        
        alert('Password reset code sent to your email! Please check your inbox and enter the verification code below.');
        this.setActiveTab('reset');
        this.resetPasswordData.email = this.forgotPasswordData.email;
      } else {
        alert(result.message || 'Failed to send reset code. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      alert('Failed to send reset code. Please try again.');
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
    } catch (error) {
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
    this.keychainService.clearAllCredentials();
    window.location.href = '/';
  }

  // Temporary method to clear stored authentication
  private async clearStoredAuth(): Promise<void> {
    localStorage.removeItem('watch_ios_current_user');
    localStorage.removeItem('watch_ios_users');
    localStorage.removeItem('watch_ios_authentication_requests');
    localStorage.removeItem('watch_ios_password_resets');
    await this.keychainService.clearAllCredentials();
  }


  async signInWithApple() {
    try {
      const result = await this.appleAuthService.signInWithApple();
      if (result.success && result.data) {
        this.router.navigate(['/discovery']);
      } else {
        alert(result.message || 'Apple Sign In failed. Please try again.');
      }
    } catch (error) {
      console.error('Apple Sign In error:', error);
      alert('Apple Sign In failed. Please try again.');
    }
  }

  async createDemoAccount() {
    try {
      const result = await this.cloudflareAuthService.createDemoAccount();
      if (result.success) {
        alert(result.message);
        // Pre-fill the login form with demo credentials
        this.loginData.email = 'demo@watchios.com';
        this.loginData.password = 'Demo123!';
        this.setActiveTab('login');
      } else {
        alert(result.message || 'Failed to create demo account.');
      }
    } catch (error) {
      console.error('Demo account creation error:', error);
      alert('Failed to create demo account. Please try again.');
    }
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
} 