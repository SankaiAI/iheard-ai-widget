# Cloudflare Pages Environment Variables Setup

## 🔐 **Setting Up Environment Variables in Cloudflare Pages**

### **1. Access Cloudflare Pages Dashboard**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **iheard-ai-widget**
3. Click on **Settings** tab
4. Scroll down to **Environment variables** section

### **2. Add Environment Variables**

Add these variables for **Production**:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `SUPABASE_URL` | `https://migtkyxdbsmtktzklouc.supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ3RreXhkYnNtdGt0emtsb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjkzNzMsImV4cCI6MjA2ODY0NTM3M30.Aj3Cgqsj7zBhHwdyOnDOhVPsj23ZgF4fy83zl4rjHus` | Your Supabase anon key |

### **3. Add Preview Environment Variables (Optional)**

For staging/testing, add the same variables to **Preview** environment.

### **4. Environment Variable Access in Build**

The environment variables will be available during build time and can be injected into the widget code.

## 🔄 **Updated Build Process**

The build script will now inject environment variables into the widget code.

## 🔒 **Security Benefits**

- ✅ **Credentials hidden** from client-side code
- ✅ **Environment isolation** (dev/prod can use different credentials)
- ✅ **Easy credential rotation** (change in Cloudflare dashboard)
- ✅ **No hardcoded secrets** in source code 