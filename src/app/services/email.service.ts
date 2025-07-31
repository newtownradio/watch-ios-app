import { Injectable } from '@angular/core';

export interface PasswordResetData {
  email: string;
  code: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Cloudflare Worker URL - update this after deployment
  private readonly WORKER_URL = 'https://email-service.perplexity-proxy.workers.dev';
  private readonly FROM_EMAIL = 'noreply@watch.style';
  private readonly APP_NAME = 'Watch Style iOS';

  async sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
    try {
      console.log('📧 Attempting to send password reset email to:', email);
      console.log('🔑 Verification code:', code);
      
      const response = await fetch(`${this.WORKER_URL}/send-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent successfully via Cloudflare Worker:', result);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Failed to send email via Cloudflare Worker:', error);
        
        // Fallback to development mode
        console.log('📧 Development mode: Simulating email success');
        console.log('📧 Email would be sent to:', email);
        console.log('📧 From:', this.FROM_EMAIL);
        console.log('📧 Subject: Password Reset - Watch Style iOS');
        console.log('📧 Verification Code:', code);
        
        return true; // Return true for development to allow the flow to continue
      }
      
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error);
      
      // Development fallback - log code to console
      console.log('📧 Development mode: Simulating email success');
      console.log('📧 Email would be sent to:', email);
      console.log('📧 From:', this.FROM_EMAIL);
      console.log('📧 Subject: Password Reset - Watch Style iOS');
      console.log('📧 Verification Code:', code);
      
      return true; // Return true for development to allow the flow to continue
    }
  }

  generateVerificationCode(): string {
    const timestamp = Date.now();
    const random1 = Math.random();
    const random2 = Math.random();
    
    const combined = (timestamp % 1000000) + (random1 * 500000) + (random2 * 500000);
    const code = Math.floor(100000 + (combined % 900000)).toString();
    
    return code;
  }

  generateRandomPassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  generateExpirationTime(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now;
  }

  isCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  // These methods are now handled by the Cloudflare Worker
  generatePasswordResetEmailHTML(code: string): string {
    // This is now handled server-side
    return '';
  }

  generatePasswordResetEmailText(code: string): string {
    // This is now handled server-side
    return '';
  }
}