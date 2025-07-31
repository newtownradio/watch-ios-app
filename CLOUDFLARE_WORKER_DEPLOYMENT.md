# Cloudflare Worker Email Service Deployment

## Overview

This guide will help you deploy the email service to Cloudflare Workers, providing a reliable backend for password reset and contact form emails.

## Prerequisites

1. **Cloudflare Account**: Sign up at https://cloudflare.com
2. **Wrangler CLI**: Install the Cloudflare Workers CLI
3. **ReSend API Key**: Already configured (`re_XfDN7Ek7_KDHYmDEMUQhD5SFS98phG7gP`)

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 3: Create Worker Configuration

Create a `wrangler.toml` file in your project root:

```toml
name = "email-service"
main = "email-worker.js"
compatibility_date = "2024-01-01"

[env.production]
name = "email-service"
```

## Step 4: Deploy the Worker

```bash
wrangler deploy
```

This will deploy your worker and provide you with a URL like:
`https://email-service.your-subdomain.workers.dev`

## Step 5: Update App Configuration

After deployment, update the worker URL in your Angular app:

### Update `src/app/services/email.service.ts`:
```typescript
private readonly WORKER_URL = 'https://email-service.your-subdomain.workers.dev';
```

### Update `src/app/services/contact-email.service.ts`:
```typescript
private readonly WORKER_URL = 'https://email-service.your-subdomain.workers.dev';
```

## Step 6: Test the Deployment

### Test Health Endpoint:
```bash
curl https://email-service.your-subdomain.workers.dev/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Test Password Reset:
```bash
curl -X POST https://email-service.your-subdomain.workers.dev/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### Test Contact Email:
```bash
curl -X POST https://email-service.your-subdomain.workers.dev/send-contact-email \
  -H "Content-Type: application/json" \
  -d '{"reason":"customer-service","subject":"Test","message":"Hello","email":"test@example.com","userName":"Test User"}'
```

## Benefits of Cloudflare Worker

### ✅ **Reliability**
- **Global CDN**: 200+ edge locations worldwide
- **99.9% Uptime**: Enterprise-grade reliability
- **Auto-scaling**: Handles traffic spikes automatically

### ✅ **Performance**
- **Edge Computing**: Runs close to users
- **Low Latency**: Sub-50ms response times
- **No Cold Starts**: Always ready to serve

### ✅ **Security**
- **DDoS Protection**: Built-in Cloudflare protection
- **API Key Security**: Keys stored server-side
- **CORS Handling**: Proper cross-origin support

### ✅ **Cost-Effective**
- **Free Tier**: 100,000 requests/day
- **Pay-per-use**: Only pay for what you use
- **No Server Management**: Fully managed service

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Worker includes CORS headers
   - Check browser console for specific errors

2. **API Key Issues**:
   - Verify ReSend API key is correct
   - Check ReSend dashboard for domain verification

3. **Deployment Errors**:
   - Ensure `wrangler.toml` is configured correctly
   - Check Cloudflare account permissions

### Debug Commands:

```bash
# View worker logs
wrangler tail

# Test locally
wrangler dev

# Check worker status
wrangler whoami
```

## Production Checklist

- [ ] Worker deployed successfully
- [ ] Health endpoint responding
- [ ] Email endpoints tested
- [ ] App URLs updated
- [ ] CORS working correctly
- [ ] Error handling tested
- [ ] Monitoring configured

## Next Steps

1. **Deploy the worker** using the steps above
2. **Update the app** with the new worker URL
3. **Test the functionality** in the iOS app
4. **Monitor performance** using Cloudflare analytics

The Cloudflare Worker provides a **reliable, scalable, and cost-effective** backend for your email functionality! 