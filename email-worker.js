/**
 * Email Service Cloudflare Worker
 * Handles password reset and contact form emails via ReSend API
 */

const RESEND_API_KEY = 're_XfDN7Ek7_KDHYmDEMUQhD5SFS98phG7gP';
const FROM_EMAIL = 'noreply@watch.style';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (path === '/send-password-reset' && request.method === 'POST') {
        return await handlePasswordReset(request);
      }

      if (path === '/send-contact-email' && request.method === 'POST') {
        return await handleContactEmail(request);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};

async function handlePasswordReset(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email and code are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailData = {
      from: FROM_EMAIL,
      to: [email],
      subject: 'Password Reset - Watch Style iOS',
      html: generatePasswordResetEmailHTML(code),
      text: generatePasswordResetEmailText(code),
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      const result = await response.json();
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        emailId: result.id 
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      const error = await response.text();
      console.error('ReSend API error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send email',
        details: error 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

async function handleContactEmail(request) {
  try {
    const { reason, subject, message, email, userName } = await request.json();

    if (!reason || !subject || !message || !email) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailData = {
      from: FROM_EMAIL,
      to: ['colin.ilgen@gmail.com'], // Your email
      subject: `[${reason.toUpperCase()}] ${subject}`,
      html: generateContactEmailHTML(reason, subject, message, email, userName),
      text: generateContactEmailText(reason, subject, message, email, userName),
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      const result = await response.json();
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Contact email sent successfully',
        emailId: result.id 
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      const error = await response.text();
      console.error('ReSend API error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send email',
        details: error 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

  } catch (error) {
    console.error('Contact email error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

function generatePasswordResetEmailHTML(code) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Watch Style iOS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; }
        .code-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .verification-code { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 4px; }
        .footer { margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Watch Style iOS</div>
        </div>
        
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Watch Style iOS account.</p>
        
        <div class="code-box">
          <p><strong>Your verification code:</strong></p>
          <div class="verification-code">${code}</div>
        </div>
        
        <div class="warning">
          <p><strong>Important:</strong></p>
          <ul>
            <li>This code expires in 10 minutes</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Never share this code with anyone</li>
          </ul>
        </div>
        
        <p>Enter this code in the Watch Style iOS app to complete your password reset.</p>
        
        <div class="footer">
          <p>This email was sent from Watch Style iOS</p>
          <p>If you have any questions, please contact support</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePasswordResetEmailText(code) {
  return `
Password Reset - Watch Style iOS

You requested a password reset for your Watch Style iOS account.

Your verification code: ${code}

This code expires in 10 minutes.

If you didn't request this reset, please ignore this email.

Enter this code in the Watch Style iOS app to complete your password reset.

---
Watch Style iOS
  `;
}

function generateContactEmailHTML(reason, subject, message, email, userName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact Form - Watch Style iOS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; }
        .content { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1a1a1a; }
        .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef; }
        .footer { margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Watch Style iOS</div>
        </div>
        
        <h2>Contact Form Submission</h2>
        
        <div class="content">
          <div class="field">
            <div class="label">Reason for Contact:</div>
            <div class="value">${reason}</div>
          </div>
          
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${subject}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message}</div>
          </div>
          
          <div class="field">
            <div class="label">User Email:</div>
            <div class="value">${email}</div>
          </div>
          
          <div class="field">
            <div class="label">User Name:</div>
            <div class="value">${userName || 'Not provided'}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This contact form submission was sent from Watch Style iOS</p>
          <p>Submitted at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateContactEmailText(reason, subject, message, email, userName) {
  return `
Contact Form Submission - Watch Style iOS

Reason for Contact: ${reason}
Subject: ${subject}
User Email: ${email}
User Name: ${userName || 'Not provided'}

Message:
${message}

---
Submitted at: ${new Date().toLocaleString()}
Watch Style iOS
  `;
} 