# 🚀 Complete Setup Guide: Cloudflare Pages Environment Variables

## ✅ **What We've Implemented**

We've created a **secure architecture** where:
- ✅ **No hardcoded credentials** in the widget
- ✅ **Environment variables** stored securely in Cloudflare
- ✅ **Server-side API** handles Supabase communication
- ✅ **Client-side widget** only makes secure API calls

## 🔧 **Step 1: Add Environment Variables to Cloudflare Pages**

### **1.1 Access Cloudflare Dashboard**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **iheard-ai-widget**
3. Click **Settings** tab
4. Scroll down to **Environment variables** section

### **1.2 Add Production Variables**
Click **"Add variable"** and add these for **Production**:

| Variable Name | Value |
|---------------|-------|
| `SUPABASE_URL` | `https://migtkyxdbsmtktzklouc.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ3RreXhkYnNtdGt0emtsb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjkzNzMsImV4cCI6MjA2ODY0NTM3M30.Aj3Cgqsj7zBhHwdyOnDOhVPsj23ZgF4fy83zl4rjHus` |

### **1.3 Add Preview Variables (Optional)**
Add the same variables to **Preview** environment for testing.

## 🔄 **Step 2: How It Works**

### **Architecture:**
```
User's Website
    ↓ (loads widget)
Cloudflare Pages (widget.min.js)
    ↓ (API call)
Cloudflare Pages Function (/api/config)
    ↓ (uses env vars)
Supabase Database
```

### **Security Flow:**
1. **Widget loads** from Cloudflare Pages (no credentials)
2. **Widget calls** `/api/config?agentId=xxx` (secure API)
3. **Cloudflare Function** uses environment variables to connect to Supabase
4. **Function returns** configuration data to widget
5. **Widget displays** with user's configuration

## 🧪 **Step 3: Test the Setup**

### **3.1 Wait for Deployment**
- GitHub Actions will automatically deploy the new version
- Usually takes 2-3 minutes

### **3.2 Test the API Endpoint**
Visit: `https://iheard-ai-widget.pages.dev/api/config?agentId=YOUR_AGENT_ID`

You should see JSON response with your agent configuration.

### **3.3 Test the Widget**
Use the integration code from your dashboard:
```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w['iHeardAIWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;
    if(fjs){fjs.parentNode.insertBefore(js,fjs);}else{d.head.appendChild(js);}
  })(window,document,'script','iHeardAI','https://iheard-ai-widget.pages.dev/widget.min.js?agentId=YOUR_AGENT_ID');
</script>
```

## 🔒 **Security Benefits**

### **✅ What's Secure:**
- **No credentials** in client-side code
- **Environment variables** stored securely in Cloudflare
- **Server-side validation** of agent status
- **CORS protection** built-in
- **Error handling** without exposing internals

### **✅ Easy Management:**
- **Change credentials** in Cloudflare dashboard
- **No code changes** needed
- **Environment isolation** (dev/prod can use different values)
- **Automatic deployment** when you update environment variables

## 🚨 **Troubleshooting**

### **If API returns 500 error:**
1. Check environment variables are set correctly in Cloudflare
2. Verify Supabase credentials are valid
3. Check Cloudflare Pages deployment logs

### **If widget doesn't load:**
1. Verify the agent ID is correct
2. Check browser console for errors
3. Test the API endpoint directly

### **If configuration doesn't update:**
1. Ensure agent is `isActive: true` and `isEnabled: true`
2. Check Supabase database directly
3. Verify the API endpoint is working

## 🎉 **You're All Set!**

Your widget is now:
- ✅ **Securely deployed** with environment variables
- ✅ **No hardcoded credentials** in source code
- ✅ **Easy to manage** through Cloudflare dashboard
- ✅ **Production-ready** with proper error handling

The widget will automatically use the secure API and environment variables once Cloudflare Pages finishes deploying! 🚀 