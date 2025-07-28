# Supabase Security Setup for iHeardAI Widget

## 🔐 **Recommended Security Approach: Row-Level Security (RLS)**

### **1. Enable RLS on VoiceAgentConfig Table**

```sql
-- Enable RLS
ALTER TABLE "VoiceAgentConfig" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (widget access)
CREATE POLICY "Widget can read active agent configs" ON "VoiceAgentConfig"
FOR SELECT USING (
  is_active = true AND 
  is_enabled = true
);
```

### **2. Alternative: API Key-Based Access**

```sql
-- Add API key column to VoiceAgentConfig
ALTER TABLE "VoiceAgentConfig" ADD COLUMN api_key TEXT;

-- Create policy for API key access
CREATE POLICY "Widget can read configs with valid API key" ON "VoiceAgentConfig"
FOR SELECT USING (
  api_key = current_setting('request.headers')::json->>'x-api-key'
);
```

### **3. Alternative: User-Based Access**

```sql
-- Add user_id column to VoiceAgentConfig
ALTER TABLE "VoiceAgentConfig" ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create policy for user-based access
CREATE POLICY "Users can read their own agent configs" ON "VoiceAgentConfig"
FOR SELECT USING (
  user_id = auth.uid()
);
```

## 🔄 **Updated Widget Code with API Key**

```javascript
// Widget should receive API key from integration code
async function fetchConfiguration(agentId, apiKey) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/VoiceAgentConfig?id=eq.${agentId}&select=*`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'x-api-key': apiKey, // User's API key
      'Content-Type': 'application/json'
    }
  });
}
```

## 🚀 **Integration Code with API Key**

```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w['iHeardAIWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;
    if(fjs){fjs.parentNode.insertBefore(js,fjs);}else{d.head.appendChild(js);}
  })(window,document,'script','iHeardAI','https://iheard-ai-widget.pages.dev/widget.min.js?agentId=YOUR_AGENT_ID&apiKey=YOUR_API_KEY');
</script>
```

## 🔒 **Most Secure Approach: Backend Proxy**

### **1. Create Backend API Endpoint**

```typescript
// iheardAI_Frontend/src/app/api/widget/config/[agentId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  // Validate API key and get user
  const user = await validateApiKey(apiKey);
  if (!user) {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Get agent config (with user isolation)
  const config = await getAgentConfig(agentId, user.id);
  if (!config) {
    return Response.json({ error: 'Agent not found' }, { status: 404 });
  }
  
  return Response.json(config);
}
```

### **2. Update Widget to Use Backend**

```javascript
// Widget connects to your backend instead of Supabase directly
async function fetchConfiguration(agentId, apiKey) {
  const response = await fetch(`/api/widget/config/${agentId}`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });
}
```

## 📋 **Security Recommendations**

### **✅ For Production:**
1. **Use RLS policies** in Supabase
2. **Implement API key validation**
3. **Add rate limiting**
4. **Use HTTPS only**
5. **Monitor access logs**

### **✅ For Development:**
1. **Use separate Supabase project**
2. **Limit anon key permissions**
3. **Test with RLS enabled**

## 🔧 **Quick Fix for Current Setup**

If you want to keep the current approach but make it more secure:

```sql
-- Add this policy to limit access to only active/enabled agents
CREATE POLICY "Public read access for active agents only" ON "VoiceAgentConfig"
FOR SELECT USING (
  is_active = true AND 
  is_enabled = true
);
```

This ensures only active and enabled agents can be accessed by the widget. 