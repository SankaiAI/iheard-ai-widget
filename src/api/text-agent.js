/**
 * Text agent API communication for iHeardAI Widget
 * Handles communication with the text-based AI agent service
 */

import { getTextAgentUrl as getEnvironmentTextAgentUrl } from '../core/environment.js';

/**
 * Get the appropriate text agent URL based on environment
 * @returns {string} Text agent URL
 */
export function getTextAgentUrl() {
  // Priority 1: Check for explicit window configuration (highest priority)
  if (window.iHeardConfig && window.iHeardConfig.textAgentUrl) {
    console.log('🎯 Using explicit configuration:', window.iHeardConfig.textAgentUrl);
    return window.iHeardConfig.textAgentUrl;
  }
  
  // Priority 2: Check for URL parameter override (useful for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const paramUrl = urlParams.get('textAgentUrl');
  if (paramUrl) {
    console.log('🔗 Using URL parameter override:', paramUrl);
    return paramUrl;
  }
  
  // Priority 3: Load from environment variables (local .env or Cloudflare variables)
  try {
    const envUrl = getEnvironmentTextAgentUrl();
    console.log('🌍 Using environment text agent URL');
    return envUrl;
  } catch (error) {
    console.error('❌ Failed to load text agent URL from environment:', error.message);
    throw error;
  }
}

/**
 * Send message to text agent
 * @param {string} message - User message
 * @param {string} sessionId - Session ID for conversation tracking
 * @param {Object} userContext - User context for store-specific search
 * @returns {Promise<Object>} Agent response
 */
export async function sendMessageToAgent(message, sessionId, userContext = {}) {
  const textAgentUrl = getTextAgentUrl();
  
  // Build request payload with user context
  const payload = {
    message: message,
    session_id: sessionId,
    user_metadata: userContext.metadata || {}
  };
  
  // Add user identification if available
  if (userContext.user_id) {
    payload.user_id = userContext.user_id;
  }
  
  if (userContext.agent_key) {
    payload.agent_key = userContext.agent_key;
  }
  
  if (userContext.store_id) {
    payload.store_id = userContext.store_id;
  }
  
  const response = await fetch(`${textAgentUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Text agent API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Check text agent health
 * @returns {Promise<Object>} Health status
 */
export async function checkAgentHealth() {
  const textAgentUrl = getTextAgentUrl();
  
  try {
    const response = await fetch(`${textAgentUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Text agent health check failed:', error);
    throw error;
  }
}

/**
 * Start a new conversation session
 * @param {Object} config - Session configuration
 * @returns {Promise<string>} Session ID
 */
export async function startSession(config = {}) {
  const textAgentUrl = getTextAgentUrl();
  
  try {
    const response = await fetch(`${textAgentUrl}/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`Session start failed: ${response.status}`);
    }

    const data = await response.json();
    return data.session_id;
  } catch (error) {
    console.warn('⚠️ Session start failed, using client-generated ID:', error);
    // Fallback to client-generated session ID
    return generateSessionId();
  }
}

/**
 * End conversation session and archive to CustomerSessionArchive
 * @param {string} sessionId - Session ID to end
 * @param {string} archivedBy - Who initiated the archive (default: 'user')
 * @returns {Promise<Object>} Archive result with success status and details
 */
export async function endSession(sessionId, archivedBy = 'user') {
  const textAgentUrl = getTextAgentUrl();
  
  try {
    const response = await fetch(`${textAgentUrl}/api/chat/end-session/${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        archived_by: archivedBy
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Session ended and archived:', result);
    
    return {
      success: true,
      archive_id: result.archive_id,
      archived_at: result.archived_at,
      message_count: result.message_count,
      session_duration_minutes: result.session_duration_minutes,
      message: result.message
    };

  } catch (error) {
    console.warn('⚠️ Session end failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get conversation history
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} Message history
 */
export async function getConversationHistory(sessionId) {
  const textAgentUrl = getTextAgentUrl();
  
  try {
    const response = await fetch(`${textAgentUrl}/session/${sessionId}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`History fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.warn('⚠️ History fetch failed:', error);
    return [];
  }
}

/**
 * Check server health and connectivity
 * @returns {Promise<boolean>} True if server is healthy
 */
export async function checkServerHealth() {
  const textAgentUrl = getTextAgentUrl();
  
  try {
    const response = await fetch(`${textAgentUrl}/api/admin/active-sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (response.ok) {
      console.log('✅ Server is healthy');
      return true;
    } else {
      console.warn('⚠️ Server responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    return false;
  }
}

/**
 * Get server timezone information
 * @returns {Promise<Object>} Timezone information
 */
export async function getServerTimezoneInfo() {
  const textAgentUrl = getTextAgentUrl();
  
  try {
    const response = await fetch(`${textAgentUrl}/api/timezone/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const timezoneInfo = await response.json();
      console.log('🌍 Server timezone:', timezoneInfo.timezone);
      return timezoneInfo;
    } else {
      throw new Error(`Timezone info request failed: ${response.status}`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to get timezone info:', error);
    return { 
      timezone: 'UTC',
      error: error.message,
      message: 'Failed to get timezone info, using UTC'
    };
  }
}

/**
 * Generate a client-side session ID
 * @returns {string} Session ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get fallback response for when agent is unavailable
 * @param {string} userMessage - Original user message
 * @returns {string} Fallback response
 */
export function getFallbackResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your AI assistant. How can I help you today?";
  } else if (lowerMessage.includes('help')) {
    return "I'm here to help! You can ask me about products, get recommendations, or just have a conversation. What would you like to know?";
  } else if (lowerMessage.includes('product') || lowerMessage.includes('buy') || lowerMessage.includes('shop')) {
    return "I'd be happy to help you find the perfect products! Could you tell me what you're looking for or what type of product interests you?";
  } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
    return "I can help you find products within your budget. What price range are you considering, and what type of product are you interested in?";
  } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return "I'd love to give you some recommendations! To provide the best suggestions, could you tell me more about your preferences or what you're looking for?";
  } else {
    return "Thank you for your message! I understand you're interested in learning more. While I'm having some connectivity issues right now, I'm here to help with any questions about our products or services.";
  }
}