# Cloudflare Authentication Setup

## Overview

We've successfully migrated from Firebase to a **Cloudflare-based authentication system** that provides:

- ✅ **No rate limiting** - Cloudflare handles this better than Firebase
- ✅ **Simpler setup** - No complex Firebase console configuration
- ✅ **Better iOS compatibility** - Works reliably in iOS WebView
- ✅ **Local storage persistence** - Immediate data availability
- ✅ **Email integration** - ReSend API for password reset emails

## Architecture

### Current Services:
- `CloudflareAuthService` - Handles all authentication logic
- `DataPersistenceService` - Manages local storage
- `EmailService` - Handles ReSend API integration
- `ContactEmailService` - Manages contact form emails

### Removed Services:
- ~~`FirebaseService`~~ - Completely removed
- ~~`AzureUserService`~~ - Completely removed

## Email Configuration

### ReSend API Setup:
1. **API Key**: `re_XfDN7Ek7_KDHYmDEMUQhD5SFS98phG7gP`
2. **Domain**: `watch.style` (verified in ReSend dashboard)
3. **From Email**: `noreply@watch.style`

### DNS Records (Cloudflare):
- **TXT**: `resend._domainkey` (for domain verification)
- **DKIM**: ReSend-provided DKIM records
- **SPF**: Include ReSend in SPF record

## Development Mode

The system includes a development fallback that:
- Simulates email sending when network requests fail
- Logs verification codes to console for testing
- Allows password reset flow to continue without real emails

## Production Deployment

For production, ensure:
1. ReSend domain verification is complete
2. DNS records are properly configured
3. API key has appropriate permissions
4. Network connectivity is stable

## Troubleshooting

### "Load failed" errors:
- Common in iOS WebView
- Development fallback handles this automatically
- Check network connectivity and DNS configuration

### Email not received:
- Check spam folder
- Verify domain configuration in ReSend
- Use console logs for immediate testing 