# API3 Setup Guide for Watch Style Marketplace

## 1. API3 Account Creation

### Step 1: Create API3 Account
1. Go to [API3.org](https://api3.org)
2. Click "Get Started" or "Sign Up"
3. Create account with your email
4. Verify email address

### Step 2: Get API Keys
1. Log into API3 dashboard
2. Navigate to "API Keys" section
3. Generate new API key for Watch Style
4. Copy the API key (we'll add it to environment)

### Step 3: Configure Authentication Partners
1. Go to "Data Feeds" section
2. Add authentication partner endpoints:
   - WatchBox: `https://api.watchbox.com/authentication`
   - GIA: `https://api.gia.edu/authentication`
   - Rolex: `https://api.rolex.com/service/authentication`
   - (Add others as needed)

## 2. Environment Configuration

### Update environment.ts
```typescript
api3: {
  endpoint: 'https://api3.io/authentication',
  chainId: 80001, // Polygon testnet (Mumbai)
  apiKey: 'YOUR_API3_API_KEY_HERE',
  // ... rest of configuration
}
```

## 3. Smart Contract Deployment

### Step 1: Deploy to Polygon Testnet
1. Use Hardhat or Remix IDE
2. Connect to Polygon Mumbai testnet
3. Deploy WatchStyleMarketplace contract
4. Save contract address

### Step 2: Update Environment
```typescript
smartContract: {
  address: 'DEPLOYED_CONTRACT_ADDRESS',
  network: 'polygon-testnet',
  gasLimit: 300000,
  gasPrice: 'auto'
}
```

## 4. Testing Process

### Phase 1: Basic Integration
1. Test API3 connection
2. Verify authentication partner endpoints
3. Test smart contract deployment
4. Basic transaction flow

### Phase 2: Authentication Flow
1. Create test transaction
2. Request authentication
3. Simulate authentication result
4. Verify smart contract update

### Phase 3: End-to-End Testing
1. iOS app → API3 → Smart Contract
2. Test all authentication partners
3. Verify payment flows
4. Test error handling

## 5. Production Migration

### When Ready for Production:
1. Deploy to Polygon mainnet
2. Update environment to mainnet
3. Configure production API3 keys
4. Test with real authentication partners

## 6. Monitoring & Maintenance

### Daily Monitoring:
- API3 service health
- Smart contract gas usage
- Authentication partner availability
- Transaction success rates

### Weekly Tasks:
- Review error logs
- Update authentication partner status
- Monitor costs and usage
- Backup transaction data

## 7. Security Considerations

### API Key Security:
- Store API keys in environment variables
- Never commit keys to git
- Rotate keys regularly
- Monitor API usage

### Smart Contract Security:
- Audit contract before mainnet deployment
- Test all edge cases
- Monitor for suspicious activity
- Have emergency pause functionality

## 8. Cost Management

### API3 Costs:
- Basic requests: ~$0.01-0.05 each
- Authentication requests: ~$0.10-0.50 each
- Monthly estimated: $50-200 for 100-500 transactions

### Gas Costs (Polygon):
- Testnet: Free
- Mainnet: ~$0.01-0.05 per transaction

## 9. Troubleshooting

### Common Issues:
1. **API3 Connection Failed**
   - Check API key
   - Verify network connectivity
   - Check rate limits

2. **Smart Contract Deployment Failed**
   - Check gas settings
   - Verify network connection
   - Check contract compilation

3. **Authentication Partner Unavailable**
   - Check partner API status
   - Verify endpoint configuration
   - Test with alternative partner

## 10. Support Resources

### API3 Documentation:
- [API3 Docs](https://docs.api3.org)
- [API3 Discord](https://discord.gg/api3)
- [API3 GitHub](https://github.com/api3dao)

### Polygon Resources:
- [Polygon Docs](https://docs.polygon.technology)
- [Polygon Faucet](https://faucet.polygon.technology)
- [Polygon Explorer](https://mumbai.polygonscan.com)
