# Email Functionality Setup Guide

## Overview
This guide explains how to set up email functionality for the contact form in Watch Style iOS.

## Current Implementation
The contact form currently uses a fallback method that logs submissions to the console. To enable actual email sending, follow the steps below.

## Option 1: Cloudflare Workers (Recommended)

### Step 1: Deploy the Cloudflare Worker
1. Create a new Cloudflare Worker
2. Copy the code from `contact-email-worker.js`
3. Deploy to your Cloudflare account

### Step 2: Configure Environment Variables
In your Cloudflare Worker dashboard, set these environment variables:
- `RECIPIENT_EMAIL`: Your email address (e.g., colin.ilgen@gmail.com)
- `API_KEY`: A secure API key for authentication
- `SENDGRID_API_KEY`: Your SendGrid API key

### Step 3: Update the Email Service
In `src/app/services/contact-email.service.ts`, update:
```typescript
private readonly API_ENDPOINT = 'https://your-worker.your-domain.workers.dev/contact';
```

And replace the placeholder API key:
```typescript
'Authorization': 'Bearer [YOUR_API_KEY]' // Replace with your actual API key
```

### Step 4: Switch to Production Mode
In `src/app/pages/account/account.component.ts`, change:
```typescript
// From fallback method
const emailResponse = await this.contactEmailService.sendContactEmailFallback(contactData);

// To production method
const emailResponse = await this.contactEmailService.sendContactEmail(contactData);
```

## Option 2: Firebase Functions

### Step 1: Create Firebase Function
```javascript
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendContactEmail = functions.https.onCall(async (data, context) => {
  // Email sending logic here
});
```

### Step 2: Update Email Service
Update the `API_ENDPOINT` to point to your Firebase function.

## Option 3: Simple Email Service

### Step 1: Use EmailJS
1. Sign up at emailjs.com
2. Create an email template
3. Update the email service to use EmailJS

### Step 2: Update Email Service
```typescript
// In contact-email.service.ts
import emailjs from 'emailjs-com';

async sendContactEmail(formData: ContactFormData): Promise<EmailResponse> {
  try {
    const result = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: 'colin.ilgen@gmail.com',
        from_email: formData.email,
        subject: `[${formData.reason.toUpperCase()}] ${formData.subject}`,
        message: formData.message,
        user_name: formData.userName || 'Anonymous'
      },
      'YOUR_USER_ID'
    );
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to send email' };
  }
}
```

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables or secure configuration
- Rotate API keys regularly

### Email Validation
- Validate email format on both client and server
- Implement rate limiting to prevent spam
- Use CAPTCHA for additional protection

### Data Privacy
- Only collect necessary information
- Implement proper data retention policies
- Comply with GDPR and other privacy regulations

## Testing

### Development Testing
1. Use the fallback method (currently active)
2. Check console logs for form submissions
3. Verify local storage entries

### Production Testing
1. Deploy email functionality
2. Test with real email addresses
3. Verify email delivery and formatting
4. Test error handling and edge cases

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure your backend allows requests from your app domain
2. **Authentication Failures**: Verify API keys are correct
3. **Email Not Sending**: Check email service configuration
4. **Rate Limiting**: Implement proper error handling for rate limits

### Debug Steps
1. Check browser console for errors
2. Verify network requests in browser dev tools
3. Check server logs for backend errors
4. Test email service independently

## Production Deployment

### Before Going Live
1. ✅ Test email functionality thoroughly
2. ✅ Configure proper error handling
3. ✅ Set up monitoring and logging
4. ✅ Implement rate limiting
5. ✅ Secure API keys and endpoints
6. ✅ Test with real users

### Monitoring
- Set up email delivery monitoring
- Monitor API usage and costs
- Track contact form usage analytics
- Set up alerts for failures

## Cost Considerations

### Cloudflare Workers
- Free tier: 100,000 requests/day
- Paid: $5/month for additional requests

### SendGrid
- Free tier: 100 emails/day
- Paid: $14.95/month for 50k emails

### EmailJS
- Free tier: 200 emails/month
- Paid: $15/month for 50k emails

Choose the option that best fits your budget and requirements. 