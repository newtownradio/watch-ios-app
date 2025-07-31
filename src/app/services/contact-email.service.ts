import { Injectable } from '@angular/core';

export interface ContactFormData {
  reason: string;
  subject: string;
  message: string;
  email: string;
  userName?: string;
  userId?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactEmailService {
  private readonly API_ENDPOINT = 'https://your-cloudflare-worker.your-domain.workers.dev/contact';

  constructor() {}

  async sendContactEmail(formData: ContactFormData): Promise<EmailResponse> {
    try {
      const emailPayload = {
        to: '[RECIPIENT_EMAIL]', // Configure this in your Cloudflare Worker
        from: formData.email,
        subject: `[${formData.reason.toUpperCase()}] ${formData.subject}`,
        message: formData.message,
        userInfo: {
          name: formData.userName || 'Anonymous',
          email: formData.email,
          userId: formData.userId || 'anonymous'
        },
        timestamp: new Date().toISOString()
      };

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [YOUR_API_KEY]' // Configure this in your Cloudflare Worker
        },
        body: JSON.stringify(emailPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'Your message has been sent successfully. We will get back to you within 24 hours.'
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        message: 'Failed to send message. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Fallback method for development/testing
  async sendContactEmailFallback(formData: ContactFormData): Promise<EmailResponse> {
    // Simulate email sending for development
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact form submission (development mode):', {
      to: '[RECIPIENT_EMAIL]',
      from: formData.email,
      subject: `[${formData.reason.toUpperCase()}] ${formData.subject}`,
      message: formData.message,
      userInfo: {
        name: formData.userName || 'Anonymous',
        email: formData.email,
        userId: formData.userId || 'anonymous'
      }
    });

    return {
      success: true,
      message: 'Your message has been sent successfully. We will get back to you within 24 hours.'
    };
  }
} 