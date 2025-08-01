# iHeard.ai Voice Widget - Customer Embedding Guide

## Quick Start - Embed in Any Website

### 1. Basic Embedding (Default SaaS Server)

Add this script tag to your website where you want the voice widget to appear:

```html
<script src="https://cdn.iheard.ai/widget.js?apiKey=YOUR_API_KEY&agentId=YOUR_AGENT_ID"></script>
```

**Example:**
```html
<script src="https://cdn.iheard.ai/widget.js?apiKey=ihd_live_abc123&agentId=ecommerce-assistant"></script>
```

### 2. Custom Server Configuration

If you have your own voice agent server deployment:

```html
<script src="https://cdn.iheard.ai/widget.js?apiKey=YOUR_API_KEY&agentId=YOUR_AGENT_ID&serverUrl=https://your-voice-server.com"></script>
```

**Example:**
```html
<script src="https://cdn.iheard.ai/widget.js?apiKey=ihd_live_abc123&agentId=ecommerce-assistant&serverUrl=https://voice.mystore.com"></script>
```

## Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `apiKey` | ✅ Yes | Your iHeard.ai API key | `ihd_live_abc123` |
| `agentId` | ✅ Yes | Your voice agent identifier | `ecommerce-assistant` |
| `serverUrl` | ❌ No | Custom voice server URL | `https://voice.mystore.com` |

## Supported Environments

- ✅ **E-commerce platforms**: Shopify, WooCommerce, Magento, BigCommerce
- ✅ **Website builders**: WordPress, Wix, Squarespace, Webflow
- ✅ **Custom websites**: Any HTML/JavaScript website
- ✅ **Mobile responsive**: Works on desktop, tablet, and mobile

## Server Requirements (For Custom Deployments)

If using `serverUrl` parameter, your server must:

1. **Support CORS** for any customer domain
2. **Provide these endpoints**:
   - `POST /api/livekit/token` - Token generation
   - `GET /health` - Health check
   - `POST /api/agent/session/start` - Session management
3. **Use HTTPS** in production
4. **Handle authentication** via API keys

## Widget Behavior

### Default (No serverUrl)
- Connects to iHeard.ai SaaS infrastructure
- Managed scaling and reliability
- Automatic updates and maintenance

### Custom Server (With serverUrl)
- Connects to your private voice server
- Full control over data and processing
- Requires server maintenance

## Security & Privacy

- All voice data is encrypted in transit
- No persistent storage of voice recordings
- GDPR and CCPA compliant
- API keys authenticate but don't store personal data

## Support

For integration help or custom configurations:
- 📧 Email: support@iheard.ai
- 📚 Documentation: https://docs.iheard.ai
- 💬 Chat: Available in your iHeard.ai dashboard