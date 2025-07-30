# iHeardAI Voice Agent Widget

*Production Ready - Updated 2025-07-30*

A lightweight, configurable voice agent widget that can be embedded on any website. Built with vanilla JavaScript for maximum compatibility and performance.

## 🚀 Quick Start

### Installation

Add this script to your website's `<head>` section:

```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w['iHeardAIWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;
    if(fjs){fjs.parentNode.insertBefore(js,fjs);}else{d.head.appendChild(js);}
  })(window,document,'script','iHeardAI','https://cdn.iheard.ai/widget.min.js?apiKey=YOUR_API_KEY');
</script>
```

### Basic Usage

```javascript
// Initialize the widget
iHeardAIWidget('init', {
  apiKey: 'your-api-key-here',
  position: 'bottom-right',
  theme: 'light'
});

// Open the widget
iHeardAIWidget('open');

// Send a message programmatically
iHeardAIWidget('sendMessage', 'Hello, I need help finding a product');
```

## 📦 CDN URLs

### Latest Version
```html
<script src="https://cdn.iheard.ai/widget.min.js"></script>
```

### Versioned (Recommended for Production)
```html
<script src="https://cdn.iheard.ai/widget-1.0.0.min.js"></script>
```

### With API Key
```html
<script src="https://cdn.iheard.ai/widget.min.js?apiKey=YOUR_API_KEY"></script>
```

## ⚙️ Configuration Options

### Widget Appearance
```javascript
{
  position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
  theme: 'light', // 'light', 'dark', 'auto'
  size: 'medium', // 'small', 'medium', 'large'
  primaryColor: '#ee5cee',
  gradientEnabled: true,
  gradientColor1: '#ee5cee',
  gradientColor2: '#31d1d1',
  glassEffect: false,
  showButtonText: true
}
```

### Agent Behavior
```javascript
{
  agentName: 'AI Assistant',
  welcomeMessage: 'Hello! How can I help you today?',
  voiceEnabled: true,
  chatEnabled: true,
  language: 'en-US',
  voiceType: 'natural' // 'natural', 'professional', 'enthusiastic', 'calm'
}
```

### Advanced Options
```javascript
{
  autoOpen: false,
  triggerKeywords: ['help', 'assistant', 'support'],
  sessionTimeout: 300000, // 5 minutes
  debug: false,
  analytics: true
}
```

## 🔧 API Reference

### Widget Methods

#### `iHeardAIWidget('init', config)`
Initialize the widget with configuration.

#### `iHeardAIWidget('open')`
Open the widget chat interface.

#### `iHeardAIWidget('close')`
Close the widget chat interface.

#### `iHeardAIWidget('sendMessage', message)`
Send a message programmatically.

#### `iHeardAIWidget('updateConfig', newConfig)`
Update widget configuration dynamically.

#### `iHeardAIWidget('destroy')`
Remove the widget from the page.

### Widget Events

```javascript
// Listen for widget events
window.addEventListener('iHeardAIWidgetReady', () => {
  console.log('Widget is ready!');
});

window.addEventListener('iHeardAIWidgetOpen', () => {
  console.log('Widget opened');
});

window.addEventListener('iHeardAIWidgetClose', () => {
  console.log('Widget closed');
});

window.addEventListener('iHeardAIWidgetMessage', (event) => {
  console.log('Message sent:', event.detail);
});
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/iheard-ai-widget.git
cd iheard-ai-widget

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build:cdn
```

### Project Structure
```
iheard-ai-widget/
├── src/
│   └── widget.js          # Widget source code
├── dist/                  # Built files (auto-generated)
├── scripts/
│   ├── build.js          # Build script
│   ├── build-cdn.js      # CDN build script
│   ├── dev-server.js     # Development server
│   └── test-widget.js    # Test script
├── examples/             # Integration examples
├── package.json
└── README.md
```

### Build Process
```bash
# Development build
pnpm run build

# Production CDN build
pnpm run build:cdn

# Test widget
pnpm run test
```

## 🚀 Deployment & Architecture

This widget is part of the iHeard.ai three-service architecture:

### Service Architecture

1. **Frontend Dashboard** (`iheardAI_Frontend` - Vercel)
   - User management and agent configuration
   - Generates integration code snippets with `agentId` and `apiKey`
   - URL: `https://www.iheard.ai`

2. **Widget CDN** (This repo - CloudFlare Pages)
   - Serves `widget.js` from `https://iheard-ai-widget.pages.dev`
   - Provides `/api/config` endpoint for agent configuration
   - CORS configured for all customer domains
   - Auto-deploys from `master` branch

3. **Voice Agent Server** (`voice-agent-server` - Railway)
   - Handles LiveKit voice connections and AI interactions
   - URL: `https://endearing-playfulness-production.up.railway.app`
   - CORS configured for all customer domains

### Integration Workflow

1. **Dashboard**: Users create agents and copy integration code
2. **Customer Site**: Integration code loads widget with `agentId` and `apiKey`
3. **Widget Loading**: This widget loads from CloudFlare CDN
4. **Configuration**: Widget fetches agent config from `/api/config` endpoint
5. **Voice Connection**: Widget connects to Railway voice server via LiveKit
6. **Authentication**: All services use CORS wildcard for customer domains

### Cloudflare Pages Deployment

1. **Connect Repository**
   - Go to [Cloudflare Pages](https://dash.cloudflare.com)
   - Create new project from GitHub repository
   - **IMPORTANT**: Deploy from `master` branch (not `main`)

2. **Build Settings**
   ```yaml
   Build command: # Leave empty for static deployment
   Build output directory: .
   ```

3. **Environment Variables**
   ```bash
   NODE_ENV=production
   SUPABASE_URL=https://migtkyxdbsmtktzklouc.supabase.co
   SUPABASE_ANON_KEY=eyJh...
   ```

4. **Functions Configuration**
   - CloudFlare Pages Functions in `/functions/api/config.js`
   - Handles agent configuration requests with CORS
   - Connects to Supabase to fetch agent data

### Manual Deployment

```bash
# Build widget
pnpm run build:cdn

# Upload dist/ files to your CDN
# Files to upload:
# - widget.min.js
# - widget-1.0.0.min.js
# - widget-[hash].min.js
```

## 📊 Performance

### File Sizes
- **Uncompressed**: ~15KB
- **Gzipped**: ~5KB
- **Brotli**: ~4KB

### Load Times
- **First Load**: < 500ms
- **Cached Load**: < 100ms
- **Global CDN**: < 200ms latency

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔒 Security

### API Key Security
- API keys are validated server-side
- Rate limiting is enforced
- CORS is properly configured
- No sensitive data is stored in the widget

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.iheard.ai 'unsafe-inline';">
```

## 🐛 Troubleshooting

### Common Issues

#### Widget Not Loading
- Check if CDN URL is accessible
- Verify API key is valid
- Check browser console for errors
- Ensure CORS is configured correctly

#### Widget Not Responding
- Check network connectivity
- Verify API endpoints are working
- Check browser console for errors
- Ensure widget is properly initialized

#### Performance Issues
- Check file size and compression
- Verify CDN cache settings
- Monitor load times
- Check for JavaScript errors

### Debug Mode
Enable debug mode for troubleshooting:
```javascript
// Add to widget URL
https://cdn.iheard.ai/widget.min.js?debug=true

// Or set globally
window.iHeardAIWidgetDebug = true;
```

## 📈 Analytics

The widget automatically tracks:
- Widget loads
- User interactions
- Conversation sessions
- Performance metrics

### Custom Analytics
```javascript
// Listen for analytics events
window.addEventListener('iHeardAIWidgetAnalytics', (event) => {
  console.log('Analytics event:', event.detail);
  // Send to your analytics service
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.iheard.ai](https://docs.iheard.ai)
- **Issues**: [GitHub Issues](https://github.com/your-username/iheard-ai-widget/issues)
- **Email**: support@iheard.ai

---

**Made with ❤️ by iHeardAI** 