// Test script to verify new user notification system
// Run this in Node.js to test the new user notification endpoint

const TEST_USER = {
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
  idVerified: false,
  disclaimerSigned: true,
  policySigned: true,
  termsSigned: true,
  createdAt: new Date().toISOString()
};

async function testNewUserNotification() {
  console.log('🧪 Testing New User Notification System...');
  console.log('📧 Using temporary email: colin.ilgen@gmail.com (while watch.style verifies)');
  
  try {
    // Test the new user notification endpoint
    const response = await fetch('https://email-service.perplexity-proxy.workers.dev/send-new-user-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: TEST_USER }),
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ New user notification test successful!');
      console.log('📧 Email ID:', result.emailId);
      console.log('💬 Message:', result.message);
      console.log('📬 Check colin.ilgen@gmail.com for the notification email');
    } else {
      const error = await response.text();
      console.log('❌ New user notification test failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNewUserNotification();
