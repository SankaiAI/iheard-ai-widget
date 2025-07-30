// Cloudflare Pages Function to serve widget configuration
// This runs on the server side and can access environment variables

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Get agent ID from query parameters
  const url = new URL(request.url);
  const agentId = url.searchParams.get('agentId');
  
  if (!agentId) {
    return new Response(JSON.stringify({ error: 'Agent ID required' }), {
      status: 400,
      headers: corsHeaders
    });
  }
  
  try {
    // Use environment variables for Supabase credentials
    const supabaseUrl = env.SUPABASE_URL || 'https://migtkyxdbsmtktzklouc.supabase.co';
    const supabaseKey = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ3RreXhkYnNtdGt0emtsb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjkzNzMsImV4cCI6MjA2ODY0NTM3M30.Aj3Cgqsj7zBhHwdyOnDOhVPsj23ZgF4fy83zl4rjHus';
    
    // Fetch configuration from Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/VoiceAgentConfig?id=eq.${agentId}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        const config = data[0];
        
        // Check if agent is active and enabled
        if (!config.isActive || !config.isEnabled) {
          return new Response(JSON.stringify({ error: 'Agent is not active or enabled' }), {
            status: 403,
            headers: corsHeaders
          });
        }
        
        return new Response(JSON.stringify({ config }), {
          status: 200,
          headers: corsHeaders
        });
      } else {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Failed to fetch configuration' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
} 