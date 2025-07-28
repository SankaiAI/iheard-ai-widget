# Cloudflare Pages Environment Variables Setup

## 🔐 **Recommended Approach: Cloudflare Pages Environment Variables**

### **Why This Approach is Better:**
- ✅ **No GitHub secrets needed**
- ✅ **Runtime injection** (more secure)
- ✅ **Easy to manage** in Cloudflare dashboard
- ✅ **Environment isolation** (dev/prod can use different values)

### **Step 1: Add Environment Variables to Cloudflare Pages**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **iheard-ai-widget**
3. Click on **Settings** tab
4. Scroll down to **Environment variables** section

### **Step 2: Add These Variables for Production**

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `SUPABASE_URL` | `https://migtkyxdbsmtktzklouc.supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ3RreXhkYnNtdGt0emtsb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjkzNzMsImV4cCI6MjA2ODY0NTM3M30.Aj3Cgqsj7zBhHwdyOnDOhVPsj23ZgF4fy83zl4rjHus` | Your Supabase anon key |

### **Step 3: Update Widget to Use Runtime Environment Variables**

The widget will access these variables at runtime using Cloudflare's environment variable injection.

## 🔄 **Simplified Build Process**

With this approach:
- **No GitHub secrets** needed
- **No build-time injection** required
- **Cloudflare handles** environment variable injection
- **More secure** - variables not embedded in code

## 🔒 **Security Benefits**

- ✅ **Credentials not in source code**
- ✅ **Easy credential rotation** (change in Cloudflare dashboard)
- ✅ **Environment isolation** (dev/prod can use different credentials)
- ✅ **No build-time secrets** to manage 