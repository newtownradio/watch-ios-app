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
  // Cloudflare Worker URL - update this after deployment
  private readonly WORKER_URL = 'https://email-service.perplexity-proxy.workers.dev';

  constructor() {}

  async sendContactEmail(formData: ContactFormData): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.WORKER_URL}/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: result.message || 'Your message has been sent successfully. We will get back to you within 24 hours.'
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          message: 'Failed to send message. Please try again.',
          error: error
        };
      }
    } catch (error: any) {
      console.error('Contact email error:', error);
      return {
        success: false,
        message: 'Failed to send message. Please try again.',
        error: error.message
      };
    }
  }

  // Fallback method for development/testing
  async sendContactEmailFallback(formData: ContactFormData): Promise<EmailResponse> {
    // Simulate email sending for development
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact form submission (development mode):', {
      to: '[CONFIGURE_RECIPIENT_EMAIL]',
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