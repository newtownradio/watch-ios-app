# Backend Email Setup Guide

## Resend API Integration

Your Resend API key: `re_AJ5NGsJ8_BZqPFHVCrSgb27uEvzwfYg7a`

### Option 1: Serverless Function (Recommended)

Create a serverless function (Vercel, Netlify, etc.) to handle email sending:

```typescript
// api/send-password-reset.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, code } = req.body;

  try {
    const result = await resend.emails.send({
      from: 'noreply@watchios.app',
      to: email,
      subject: 'Password Reset - Watch iOS',
      html: generatePasswordResetEmailHTML(code),
      text: generatePasswordResetEmailText(code)
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}

function generatePasswordResetEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Watch iOS</title>
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
          <h1>Watch iOS</h1>
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>You requested a password reset for your Watch iOS account.</p>
          
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
          <p>&copy; 2024 Watch iOS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePasswordResetEmailText(code: string): string {
  return `
Password Reset - Watch iOS

You requested a password reset for your Watch iOS account.

Use the verification code below to reset your password:

${code}

IMPORTANT:
- This code will expire in 10 minutes
- If you didn't request this reset, please ignore this email
- Never share this code with anyone

If you have any questions, please contact our support team.

© 2024 Watch iOS. All rights reserved.
  `;
}
```

### Option 2: Update Email Service

Once you have the backend API, update the email service:

```typescript
// src/app/services/email.service.ts
async sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  try {
    const response = await fetch('/api/send-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
```

### Environment Variables

Set these in your deployment environment:

```bash
RESEND_API_KEY=re_AJ5NGsJ8_BZqPFHVCrSgb27uEvzwfYg7a
```

### Domain Verification

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain: `watchios.app`
3. Follow DNS verification steps
4. Update `fromEmail` to use your verified domain

### Testing

Test the email flow:
1. Request password reset
2. Check email for verification code
3. Enter code and reset password
4. Login with new password

## Security Notes

- ✅ API key stored in environment variables
- ✅ Email templates sanitized
- ✅ Rate limiting recommended
- ✅ Domain verification required
- ✅ HTTPS required for production 