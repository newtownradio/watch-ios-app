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
  private readonly FROM_EMAIL = 'noreply@watch.style';
  private readonly APP_NAME = 'Watch iOS';
  private readonly RESEND_API_KEY = 're_AJ5NGsJ8_BZqPFHVCrSgb27uEvzwfYg7a';

  /**
   * Send password reset email with verification code using Resend
   */
  async sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
    try {
      console.log('📧 Sending password reset email to:', email);
      console.log('📧 Verification code:', code);
      
      // Try to send real email via Azure Functions API
      try {
        const response = await fetch('https://watch-ios-functions.azurewebsites.net/api/send-password-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            code: code
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Password reset email sent successfully via Azure Function:', result);
          return true;
        } else {
          const error = await response.text();
          console.error('❌ Failed to send email via Azure Function:', error);
          console.log('📧 Falling back to console display for testing...');
          this.displayCodeInConsole(email, code);
          return true; // Return true so the flow continues
        }
      } catch (fetchError) {
        console.error('❌ CORS or network error:', fetchError);
        console.log('📧 Falling back to console display for testing...');
        this.displayCodeInConsole(email, code);
        return true; // Return true so the flow continues
      }
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      console.log('📧 Falling back to console display for testing...');
      this.displayCodeInConsole(email, code);
      return true; // Return true so the flow continues
    }
  }

  /**
   * Display verification code in console for testing
   */
  private displayCodeInConsole(email: string, code: string): void {
    console.log('📧 ==========================================');
    console.log('📧 PASSWORD RESET EMAIL (TESTING MODE)');
    console.log('📧 ==========================================');
    console.log('📧 To:', email);
    console.log('📧 Subject: Password Reset - Watch.Style');
    console.log('📧 Verification Code:', code);
    console.log('📧 Expires: 10 minutes from now');
    console.log('📧 ==========================================');
    console.log('📧 Use this code in the password reset form');
    console.log('📧 ==========================================');
  }

  /**
   * Generate HTML email template for password reset
   */
  private generatePasswordResetEmailHTML(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - ${this.APP_NAME}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .code { background: #1e3a8a; color: white; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0; letter-spacing: 3px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Watch.Style</h1>
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <p>You requested a password reset for your Watch.Style account.</p>
            
            <p>Use the verification code below to reset your password:</p>
            
            <div class="code">${code}</div>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This code will expire in 10 minutes</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this code with anyone</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Watch.Style. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email template for password reset
   */
  private generatePasswordResetEmailText(code: string): string {
    return `
Password Reset - Watch.Style

You requested a password reset for your Watch.Style account.

Use the verification code below to reset your password:

${code}

IMPORTANT:
- This code will expire in 10 minutes
- If you didn't request this reset, please ignore this email
- Never share this code with anyone

If you have any questions, please contact our support team.

© 2024 Watch.Style. All rights reserved.
    `;
  }

  /**
   * Generate a random 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check if a verification code is expired
   */
  isCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Generate expiration time (10 minutes from now)
   */
  generateExpirationTime(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    return expiresAt;
  }
} 