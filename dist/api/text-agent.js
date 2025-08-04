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
 * @returns {Promise<Object>} Agent response
 */
export async function sendMessageToAgent(message, sessionId) {
  const textAgentUrl = getTextAgentUrl();
  
  const response = await fetch(`${textAgentUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      session_id: sessionId
    })
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
 * End conversation session
 * @param {string} sessionId - Session ID to end
 * @returns {Promise<boolean>} Success status
 */
export async function endSession(sessionId) {
  const textAgentUrl = getTextAgentUrl();
  
  try {
    const response = await fetch(`${textAgentUrl}/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId
      })
    });

    return response.ok;
  } catch (error) {
    console.warn('⚠️ Session end failed:', error);
    return false;
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