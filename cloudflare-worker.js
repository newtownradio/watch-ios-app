// Cloudflare Worker for Watch Style iOS Authentication
// Deploy this to your Cloudflare Workers account

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check endpoint
      if (path === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // User management endpoints
      if (path === '/users' && request.method === 'POST') {
        const body = await request.json();
        const { user, password } = body;

        // In a real implementation, you'd store this in Cloudflare KV or D1
        // For now, we'll just return success
        console.log('User registration:', user.email);

        return new Response(JSON.stringify({
          success: true,
          message: 'User registered successfully',
          data: user
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Authentication endpoint
      if (path === '/auth/login' && request.method === 'POST') {
        const body = await request.json();
        const { email, password } = body;

        // In a real implementation, you'd verify against stored credentials
        console.log('Login attempt:', email);

        return new Response(JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            id: 'user_' + Date.now(),
            email: email,
            name: 'User',
            idVerified: false,
            disclaimerSigned: true,
            policySigned: true,
            termsSigned: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Password reset endpoint
      if (path === '/auth/reset-password' && request.method === 'POST') {
        const body = await request.json();
        const { email } = body;

        console.log('Password reset requested for:', email);

        return new Response(JSON.stringify({
          success: true,
          message: 'Password reset email sent',
          code: '123456' // In real app, generate and send via email
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response(JSON.stringify({
        success: false,
        message: 'Endpoint not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}; 