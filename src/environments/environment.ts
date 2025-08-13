export const environment = {
  production: false,
  // Firebase configuration removed - now using Cloudflare-based authentication
  appName: 'Watch Style iOS',
  version: '1.0.0',
  
  // UPS API Configuration
  ups: {
    baseUrl: 'https://wwwcie.ups.com/api', // Use production URL for live
    apiKey: 'YOUR_UPS_API_KEY', // Store in environment variables
    username: 'YOUR_UPS_USERNAME',
    password: 'YOUR_UPS_PASSWORD',
    accountNumber: 'YOUR_UPS_ACCOUNT_NUMBER',
    testMode: true // Set to false for production
  }
};
