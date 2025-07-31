// Simple test to verify ReSend setup
const RESEND_API_KEY = 're_XfDN7Ek7_KDHYmDEMUQhD5SFS98phG7gP';

async function testReSendSimple() {
  console.log('🧪 Testing ReSend API key...');
  
  try {
    // Test 1: Check if API key is valid
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
      
      // Check if watch.style is in the list
      const watchStyleDomain = domains.data?.find(d => d.name === 'watch.style');
      if (watchStyleDomain) {
        console.log('✅ watch.style domain found:', watchStyleDomain);
      } else {
        console.log('❌ watch.style domain not found in list');
      }
    } else {
      const error = await response.text();
      console.log('❌ API key issue:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testReSendSimple(); 