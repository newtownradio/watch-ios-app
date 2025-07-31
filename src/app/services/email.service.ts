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
  private readonly APP_NAME = 'Watch Style iOS';
  private readonly RESEND_API_KEY = 're_AJ5NGsJ8_BZqPFHVCrSgb27uEvzwfYg7a';

    async sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
    try {
      // Try to send real email via Azure Functions API
      try {
        const requestBody = {
          email: email,
          code: code
        };
        
        const response = await fetch('https://watch-ios-functions.azurewebsites.net/api/send-password-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
  
        if (response.ok) {
          const result = await response.json();
          return true;
        } else {
          const error = await response.text();
          console.error('Failed to send email via Azure Function:', error);
          // For production, we'll still return false but show a helpful message
          return false;
        }
      } catch (fetchError) {
        console.error('Network error:', fetchError);
        // For production, we'll still return false but show a helpful message
        return false;
      }
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Removed console fallback for production build

  generateVerificationCode(): string {
    // Use Math.random for better compatibility with iOS WebView
    const timestamp = Date.now();
    const random1 = Math.random();
    const random2 = Math.random();
    
    // Create a more random number using multiple sources
    const combined = (timestamp % 1000000) + (random1 * 500000) + (random2 * 500000);
    const code = Math.floor(100000 + (combined % 900000)).toString();
    
    return code;
  }

  generateRandomPassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special character
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  generateExpirationTime(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10); // 10 minutes from now
    return now;
  }

  isCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  generatePasswordResetEmailHTML(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Watch.Style</title>
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

  generatePasswordResetEmailText(code: string): string {
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
}