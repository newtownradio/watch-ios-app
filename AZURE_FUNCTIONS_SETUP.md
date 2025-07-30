# Azure Functions Email API Setup

## Overview
This sets up an Azure Functions API to handle password reset emails via Resend, avoiding CORS issues.

## Prerequisites
- Azure subscription
- Azure CLI installed
- Node.js and npm

## Setup Steps

### 1. Install Azure Functions Core Tools
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

### 2. Navigate to Azure Functions Directory
```bash
cd azure-functions
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Test Locally
```bash
npm start
```
This will start the function at `http://localhost:7071/api/send-password-reset`

### 5. Deploy to Azure

#### Option A: Using Azure CLI
```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name watch-style-rg --location eastus

# Create storage account
az storage account create --name watchstylefunc --resource-group watch-style-rg --location eastus --sku Standard_LRS

# Create function app
az functionapp create --resource-group watch-style-rg --consumption-plan-location eastus --runtime node --runtime-version 18 --functions-version 4 --name watch-style-email-api --storage-account watchstylefunc

# Deploy function
func azure functionapp publish watch-style-email-api
```

#### Option B: Using VS Code
1. Install Azure Functions extension
2. Right-click on `azure-functions` folder
3. Select "Deploy to Function App"
4. Follow the wizard

### 6. Configure Environment Variables
In Azure Portal:
1. Go to your Function App
2. Settings → Configuration
3. Add application setting:
   - Name: `RESEND_API_KEY`
   - Value: `re_AJ5NGsJ8_BZqPFHVCrSgb27uEvzwfYg7a`

### 7. Update Email Service
Replace the URL in `src/app/services/email.service.ts`:
```typescript
const response = await fetch('https://watch-style-email-api.azurewebsites.net/api/send-password-reset', {
```

## Testing

### Local Testing
```bash
curl -X POST http://localhost:7071/api/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### Production Testing
1. Deploy the function
2. Update the email service URL
3. Test password reset flow
4. Check email delivery

## Security Notes
- ✅ CORS configured for web app
- ✅ Input validation
- ✅ Error handling
- ✅ Environment variables for API keys
- ✅ HTTPS enforced in production

## Cost Estimation
- Azure Functions Consumption Plan: ~$0.20 per million executions
- Very cost-effective for email sending

## Troubleshooting

### Common Issues
1. **CORS errors**: Check function URL and CORS headers
2. **Email not sending**: Verify Resend API key and domain
3. **Function not deploying**: Check Azure CLI login and permissions

### Debugging
- Check Azure Function logs in portal
- Monitor Resend dashboard for email status
- Test with Postman or curl

## Next Steps
1. Deploy the function
2. Update the email service URL
3. Test the complete flow
4. Monitor email delivery rates 