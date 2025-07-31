// Cloudflare Worker for Contact Form Email Handling
// Deploy this to Cloudflare Workers to enable actual email functionality

// Configure these values in your Cloudflare Worker environment variables
const RECIPIENT_EMAIL = 'your-email@domain.com'; // Set this in Cloudflare Worker environment
const API_KEY = 'your-secure-api-key'; // Set this in Cloudflare Worker environment
const EMAIL_SERVICE_URL = 'https://api.sendgrid.com/v3/mail/send'; // Or use another email service
const SENDGRID_API_KEY = 'your-sendgrid-api-key'; // Set this in Cloudflare Worker environment

export default {
  async fetch(request, env, ctx) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Verify API key
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Parse request body
      const contactData = await request.json();
      
      // Validate required fields
      if (!contactData.email || !contactData.subject || !contactData.message || !contactData.reason) {
        return new Response('Missing required fields', { status: 400 });
      }

      // Prepare email content
      const emailContent = {
        personalizations: [
          {
            to: [{ email: RECIPIENT_EMAIL }],
            subject: `[${contactData.reason.toUpperCase()}] ${contactData.subject}`
          }
        ],
        from: { email: 'noreply@yourdomain.com', name: 'Watch Style iOS Contact Form' },
        reply_to: { email: contactData.email, name: contactData.userInfo?.name || 'Anonymous' },
        content: [
          {
            type: 'text/html',
            value: `
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${contactData.userInfo?.name || 'Anonymous'} (${contactData.email})</p>
              <p><strong>Reason:</strong> ${contactData.reason}</p>
              <p><strong>Subject:</strong> ${contactData.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                ${contactData.message.replace(/\n/g, '<br>')}
              </div>
              <p><strong>User ID:</strong> ${contactData.userInfo?.userId || 'anonymous'}</p>
              <p><strong>Timestamp:</strong> ${contactData.timestamp}</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                This message was sent from the Watch Style iOS app contact form.
              </p>
            `
          }
        ]
      };

      // Send email using SendGrid (or another email service)
      const emailResponse = await fetch(EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailContent)
      });

      if (!emailResponse.ok) {
        throw new Error(`Email service error: ${emailResponse.status}`);
      }

      // Return success response
      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Contact form error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to send email',
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
}; 