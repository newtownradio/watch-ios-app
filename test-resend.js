// Test script to verify ReSend API key and domain status
// Run this in Node.js to check if ReSend is working

const RESEND_API_KEY = 're_XfDN7Ek7_KDHYmDEMUQhD5SFS98phG7gP';

async function testReSend() {
  console.log('🧪 Testing ReSend API...');
  
  try {
    // Test 1: Check API key validity
    console.log('📡 Testing API key...');
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const domains = await response.json();
      console.log('✅ API key is valid');
      console.log('📋 Available domains:', domains);
    } else {
      const error = await response.text();
      console.log('❌ API key issue:', error);
    }
    
    // Test 2: Try sending a test email
    console.log('\n📧 Testing email sending...');
    const emailData = {
      from: 'onboarding@resend.dev',
      to: ['test@example.com'],
      subject: 'Test Email - Watch Style iOS',
      html: '<h1>Test Email</h1><p>This is a test email from Watch Style iOS.</p>'
    };
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });
    
    console.log('📊 Email response status:', emailResponse.status);
    
    if (emailResponse.ok) {
      const result = await emailResponse.json();
      console.log('✅ Email test successful:', result);
    } else {
      const error = await emailResponse.text();
      console.log('❌ Email test failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testReSend(); 