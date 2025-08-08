/**
 * Unified Conversation API for iHeardAI Widget
 * Handles seamless switching between text and voice modes with shared conversation history
 */

import { getTextAgentUrl } from './text-agent.js';
import { getVoiceAgentUrl } from '../voice/index.js';
import { logger } from '../utils/logging.js';

/**
 * Unified conversation manager for cross-modal continuity
 */
export class UnifiedConversationManager {
  constructor(agentKey, customerId) {
    this.agentKey = agentKey;
    this.customerId = customerId;
    this.sessionId = null;
    this.currentMode = 'text'; // Default to text mode
    this.previousMode = null;
    this.conversationHistory = [];
    this.isInitialized = false;
  }

  /**
   * Initialize conversation session with mode detection
   */
  async initialize(preferredMode = 'text', userMetadata = {}) {
    try {
      logger.info('🔄 Initializing unified conversation session');

      // Determine which agent to use for initialization
      const initUrl = preferredMode === 'voice' 
        ? `${getVoiceAgentUrl()}/api/session/initialize`
        : `${getTextAgentUrl()}/session/start`;

      const payload = {
        customer_id: this.customerId,
        agent_key: this.agentKey,
        mode: preferredMode,
        user_metadata: userMetadata
      };

      const response = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Session initialization failed: ${response.status}`);
      }

      const sessionData = await response.json();
      
      this.sessionId = sessionData.session_id;
      this.currentMode = sessionData.current_mode || preferredMode;
      this.previousMode = sessionData.previous_mode;
      this.isInitialized = true;

      // Load existing conversation history if available
      if (sessionData.context_messages > 0) {
        await this.loadConversationContext();
      }

      logger.info(`✅ Unified conversation initialized: ${sessionData.session_type} (${this.currentMode} mode)`);
      
      return {
        sessionType: sessionData.session_type,
        currentMode: this.currentMode,
        previousMode: this.previousMode,
        greeting: sessionData.greeting,
        hasContext: sessionData.has_previous_context || false
      };

    } catch (error) {
      logger.error('❌ Failed to initialize unified conversation:', error);
      
      // Fallback initialization
      this.sessionId = `fallback_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentMode = preferredMode;
      this.isInitialized = true;
      
      return {
        sessionType: 'new',
        currentMode: this.currentMode,
        greeting: 'Hello! How can I help you today?',
        hasContext: false
      };
    }
  }

  /**
   * Load conversation context from the current session
   */
  async loadConversationContext() {
    try {
      const contextUrl = this.currentMode === 'voice'
        ? `${getVoiceAgentUrl()}/api/session/${this.sessionId}/context`
        : `${getTextAgentUrl()}/session/${this.sessionId}/history`;

      const response = await fetch(contextUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contextData = await response.json();
        
        if (this.currentMode === 'voice') {
          this.conversationHistory = contextData.aggregated_context || [];
        } else {
          this.conversationHistory = contextData.messages || [];
        }
        
        logger.info(`🔄 Loaded ${this.conversationHistory.length} messages from conversation context`);
      }
    } catch (error) {
      logger.warn('⚠️ Failed to load conversation context:', error);
    }
  }

  /**
   * Send message with automatic mode handling
   */
  async sendMessage(message, messageMode = null) {
    if (!this.isInitialized) {
      throw new Error('Conversation not initialized');
    }

    const targetMode = messageMode || this.currentMode;
    
    try {
      let response;
      
      if (targetMode === 'voice') {
        // Voice messages are handled through LiveKit WebRTC
        // This method primarily handles text messages or mode switches
        response = await this.sendTextMessage(message);
      } else {
        response = await this.sendTextMessage(message);
      }

      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        mode: targetMode
      });

      if (response && response.response) {
        this.conversationHistory.push({
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          mode: targetMode
        });
      }

      return response;
    } catch (error) {
      logger.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send text message to text agent
   */
  async sendTextMessage(message) {
    const textAgentUrl = getTextAgentUrl();
    
    const payload = {
      message: message,
      session_id: this.sessionId,
      agent_key: this.agentKey,
      user_metadata: {
        customer_id: this.customerId,
        current_mode: this.currentMode,
        previous_mode: this.previousMode
      }
    };

    const response = await fetch(`${textAgentUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Text message failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Switch between text and voice modes with context preservation
   */
  async switchMode(toMode, preserveContext = true) {
    if (!this.isInitialized) {
      throw new Error('Conversation not initialized');
    }

    if (toMode === this.currentMode) {
      return {
        success: true,
        message: `Already in ${toMode} mode`,
        currentMode: this.currentMode
      };
    }

    try {
      logger.info(`🔄 Switching mode: ${this.currentMode} → ${toMode}`);
      
      // Call appropriate mode switch endpoint
      const switchUrl = toMode === 'voice'
        ? `${getVoiceAgentUrl()}/api/session/${this.sessionId}/switch-mode`
        : `${getTextAgentUrl()}/session/${this.sessionId}/switch-mode`;

      const payload = {
        from_mode: this.currentMode,
        to_mode: toMode,
        preserve_context: preserveContext
      };

      const response = await fetch(switchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.dumps(payload)
      });

      if (!response.ok) {
        throw new Error(`Mode switch failed: ${response.status}`);
      }

      const switchData = await response.json();
      
      // Update mode state
      this.previousMode = this.currentMode;
      this.currentMode = toMode;
      
      // Reload context if preserved
      if (preserveContext && switchData.session_updated) {
        await this.loadConversationContext();
      }

      logger.info(`✅ Mode switched successfully to ${toMode}`);
      
      return {
        success: true,
        fromMode: this.previousMode,
        toMode: this.currentMode,
        contextSummary: switchData.context_summary,
        suggestedGreeting: switchData.suggested_greeting,
        hasContext: preserveContext && this.conversationHistory.length > 0
      };

    } catch (error) {
      logger.error('❌ Mode switch failed:', error);
      return {
        success: false,
        error: error.message,
        currentMode: this.currentMode
      };
    }
  }

  /**
   * Get conversation analytics for dashboard integration
   */
  getConversationAnalytics() {
    if (!this.conversationHistory.length) {
      return {
        totalMessages: 0,
        textMessages: 0,
        voiceMessages: 0,
        modeSwitches: 0,
        currentMode: this.currentMode
      };
    }

    const textMessages = this.conversationHistory.filter(msg => msg.mode === 'text').length;
    const voiceMessages = this.conversationHistory.filter(msg => msg.mode === 'voice').length;
    
    // Count mode switches by looking for consecutive different modes
    let modeSwitches = 0;
    let lastMode = null;
    
    for (const message of this.conversationHistory) {
      if (lastMode && lastMode !== message.mode) {
        modeSwitches++;
      }
      lastMode = message.mode;
    }

    return {
      totalMessages: this.conversationHistory.length,
      textMessages,
      voiceMessages,
      modeSwitches,
      currentMode: this.currentMode,
      previousMode: this.previousMode,
      sessionId: this.sessionId
    };
  }

  /**
   * Get current conversation state for UI updates
   */
  getConversationState() {
    return {
      sessionId: this.sessionId,
      currentMode: this.currentMode,
      previousMode: this.previousMode,
      messageCount: this.conversationHistory.length,
      isInitialized: this.isInitialized,
      lastActivity: this.conversationHistory.length > 0 
        ? this.conversationHistory[this.conversationHistory.length - 1].timestamp 
        : null
    };
  }

  /**
   * Clean up conversation resources
   */
  async cleanup() {
    try {
      if (this.sessionId) {
        // Attempt to gracefully end session with both agents
        const endpoints = [
          `${getTextAgentUrl()}/session/end`,
          `${getVoiceAgentUrl()}/api/session/end`
        ];

        const payload = { session_id: this.sessionId };

        // Fire and forget - don't wait for responses
        endpoints.forEach(async endpoint => {
          try {
            await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.dumps(payload)
            });
          } catch (error) {
            // Silently handle cleanup errors
            logger.debug(`Cleanup attempt failed for ${endpoint}:`, error);
          }
        });
      }

      // Reset state
      this.conversationHistory = [];
      this.isInitialized = false;
      this.sessionId = null;
      
      logger.info('🧹 Unified conversation cleaned up');
    } catch (error) {
      logger.warn('⚠️ Error during conversation cleanup:', error);
    }
  }
}

/**
 * Create a unified conversation manager instance
 */
export function createUnifiedConversation(agentKey, customerId) {
  return new UnifiedConversationManager(agentKey, customerId);
}

/**
 * Helper function to detect if user wants to switch modes
 */
export function detectModeSwitch(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Text mode switch patterns
  const textSwitchPatterns = [
    'switch to text', 'text mode', 'type instead', 'i want to type',
    'change to text', 'use text', 'typing mode', 'chat mode'
  ];
  
  // Voice mode switch patterns
  const voiceSwitchPatterns = [
    'switch to voice', 'voice mode', 'speak instead', 'i want to talk',
    'change to voice', 'use voice', 'talking mode', 'voice chat'
  ];
  
  for (const pattern of textSwitchPatterns) {
    if (lowerMessage.includes(pattern)) {
      return { targetMode: 'text', pattern, confidence: 'high' };
    }
  }
  
  for (const pattern of voiceSwitchPatterns) {
    if (lowerMessage.includes(pattern)) {
      return { targetMode: 'voice', pattern, confidence: 'high' };
    }
  }
  
  return null;
}