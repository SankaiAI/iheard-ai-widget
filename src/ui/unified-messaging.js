/**
 * Unified messaging system for iHeardAI Widget
 * Handles seamless switching between text and voice modes with shared conversation history
 */

import { 
  currentUserMessage,
  currentAssistantMessage,
  isConnecting,
  setCurrentUserMessage,
  setCurrentAssistantMessage,
  setConnecting,
  currentApiKey,
  currentAgentId,
  currentCustomerId
} from '../core/state.js';
import { widgetConfig } from '../core/config.js';
import { 
  createUnifiedConversation,
  detectModeSwitch
} from '../api/unified-conversation.js';
import { 
  createThinkingStatusComponent,
  updateThinkingStatus,
  completeThinkingStatus,
  removeThinkingStatus 
} from './thinking-status.js';
import { logger } from '../utils/logging.js';

// Global unified conversation manager
let unifiedConversation = null;
let currentSessionData = null;

/**
 * Initialize unified conversation management
 */
export async function initializeUnifiedConversation(agentKey, customerId, preferredMode = 'text') {
  try {
    logger.info('🔄 Initializing unified conversation system');
    
    // Create new conversation manager
    unifiedConversation = createUnifiedConversation(agentKey, customerId);
    
    // Initialize with preferred mode
    currentSessionData = await unifiedConversation.initialize(preferredMode, {
      widget_version: '2.0.0',
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    });
    
    logger.info(`✅ Unified conversation initialized: ${currentSessionData.sessionType} (${currentSessionData.currentMode} mode)`);
    
    // Update UI based on session data
    updateUIForSessionData(currentSessionData);
    
    return currentSessionData;
    
  } catch (error) {
    logger.error('❌ Failed to initialize unified conversation:', error);
    throw error;
  }
}

/**
 * Update UI based on session initialization data
 */
function updateUIForSessionData(sessionData) {
  try {
    // Update widget header with mode indicator
    const widgetHeader = document.querySelector('.iheard-widget-header');
    if (widgetHeader) {
      let modeIndicator = widgetHeader.querySelector('.mode-indicator');
      if (!modeIndicator) {
        modeIndicator = document.createElement('span');
        modeIndicator.className = 'mode-indicator';
        widgetHeader.appendChild(modeIndicator);
      }
      
      modeIndicator.textContent = `${sessionData.currentMode.charAt(0).toUpperCase() + sessionData.currentMode.slice(1)} Mode`;
      modeIndicator.style.cssText = `
        font-size: 10px;
        opacity: 0.7;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 8px;
        background: ${sessionData.currentMode === 'voice' ? '#4CAF50' : '#2196F3'};
        color: white;
      `;
    }
    
    // Display context-aware greeting if available
    if (sessionData.greeting && sessionData.sessionType === 'continuation') {
      displayMessage(sessionData.greeting, 'assistant', {
        isContextualGreeting: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update input placeholder based on mode
    updateInputPlaceholder(sessionData.currentMode);
    
  } catch (error) {
    logger.warn('⚠️ Error updating UI for session data:', error);
  }
}

/**
 * Update input placeholder based on current mode
 */
function updateInputPlaceholder(mode) {
  const inputElement = document.querySelector('.iheard-input input');
  if (inputElement) {
    const placeholders = {
      text: 'Type your message...',
      voice: 'Voice mode active - click to speak or type to switch',
      mixed: 'Multi-modal mode - type or speak'
    };
    inputElement.placeholder = placeholders[mode] || placeholders.text;
  }
}

/**
 * Send message with unified conversation management
 */
export async function sendUnifiedMessage(message, targetMode = null) {
  if (!unifiedConversation) {
    logger.error('❌ Unified conversation not initialized');
    throw new Error('Conversation system not initialized');
  }

  try {
    setConnecting(true);
    
    // Check for mode switch intent
    const modeSwitchIntent = detectModeSwitch(message);
    if (modeSwitchIntent) {
      return await handleModeSwitch(modeSwitchIntent.targetMode, message);
    }
    
    // Display user message
    displayMessage(message, 'user', {
      timestamp: new Date().toISOString(),
      mode: targetMode || unifiedConversation.currentMode
    });
    
    // Show thinking status
    const thinkingId = showThinkingStatus();
    
    try {
      // Send message through unified system
      const response = await unifiedConversation.sendMessage(message, targetMode);
      
      // Complete thinking status
      completeThinkingStatus(thinkingId);
      
      // Display assistant response
      if (response && response.response) {
        displayMessage(response.response, 'assistant', {
          timestamp: new Date().toISOString(),
          mode: targetMode || unifiedConversation.currentMode,
          confidence: response.confidence || 1.0
        });
      }
      
      // Update conversation analytics
      updateConversationAnalytics();
      
      return response;
      
    } catch (responseError) {
      // Remove thinking status on error
      removeThinkingStatus(thinkingId);
      
      // Display error message
      displayMessage(
        "I apologize, but I'm having trouble processing your request right now. Please try again.",
        'assistant',
        { isError: true }
      );
      
      throw responseError;
    }
    
  } finally {
    setConnecting(false);
  }
}

/**
 * Handle mode switching with user feedback
 */
async function handleModeSwitch(targetMode, originalMessage) {
  try {
    logger.info(`🔄 Processing mode switch request: ${unifiedConversation.currentMode} → ${targetMode}`);
    
    // Display user's mode switch request
    displayMessage(originalMessage, 'user', {
      timestamp: new Date().toISOString(),
      isModeSwitch: true
    });
    
    // Show mode switch status
    const thinkingId = showThinkingStatus('Switching modes...');
    
    // Process mode switch
    const switchResult = await unifiedConversation.switchMode(targetMode, true);
    
    completeThinkingStatus(thinkingId);
    
    if (switchResult.success) {
      // Display confirmation message
      const confirmationMessage = switchResult.suggestedGreeting || 
        `Switched to ${targetMode} mode. How can I help you?`;
      
      displayMessage(confirmationMessage, 'assistant', {
        timestamp: new Date().toISOString(),
        mode: targetMode,
        isModeSwitch: true
      });
      
      // Update UI for new mode
      updateInputPlaceholder(targetMode);
      updateModeIndicator(targetMode);
      
      // If switching to voice mode, initialize voice system
      if (targetMode === 'voice' && window.iHeardModules && window.iHeardModules.voice) {
        try {
          await window.iHeardModules.voice.initializeVoiceSystem();
        } catch (voiceError) {
          logger.error('❌ Failed to initialize voice system after mode switch:', voiceError);
        }
      }
      
      return switchResult;
      
    } else {
      displayMessage(
        `Sorry, I couldn't switch to ${targetMode} mode right now. ${switchResult.error || 'Please try again.'}`,
        'assistant',
        { isError: true }
      );
      return switchResult;
    }
    
  } catch (error) {
    logger.error('❌ Mode switch failed:', error);
    displayMessage(
      `I encountered an error while switching modes. Please try again.`,
      'assistant',
      { isError: true }
    );
    throw error;
  }
}

/**
 * Update mode indicator in UI
 */
function updateModeIndicator(newMode) {
  const modeIndicator = document.querySelector('.mode-indicator');
  if (modeIndicator) {
    modeIndicator.textContent = `${newMode.charAt(0).toUpperCase() + newMode.slice(1)} Mode`;
    modeIndicator.style.background = newMode === 'voice' ? '#4CAF50' : '#2196F3';
  }
}

/**
 * Display message in chat interface
 */
function displayMessage(content, role, metadata = {}) {
  const messagesContainer = document.querySelector('.iheard-messages');
  if (!messagesContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `iheard-message ${role}-message`;
  
  // Add special classes for message types
  if (metadata.isContextualGreeting) {
    messageDiv.classList.add('contextual-greeting');
  }
  if (metadata.isModeSwitch) {
    messageDiv.classList.add('mode-switch-message');
  }
  if (metadata.isError) {
    messageDiv.classList.add('error-message');
  }

  const timestamp = new Date(metadata.timestamp || new Date()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let modeIndicator = '';
  if (metadata.mode && metadata.mode !== 'text') {
    modeIndicator = `<span class="message-mode-indicator" title="${metadata.mode} mode">🎤</span>`;
  }
  
  let confidenceIndicator = '';
  if (metadata.confidence && metadata.confidence < 0.8) {
    confidenceIndicator = `<span class="confidence-indicator" title="Confidence: ${Math.round(metadata.confidence * 100)}%">⚠️</span>`;
  }

  messageDiv.innerHTML = `
    <div class="message-content">
      ${formatMessageForDisplay(content)}
    </div>
    <div class="message-metadata">
      <span class="message-timestamp">${timestamp}</span>
      ${modeIndicator}
      ${confidenceIndicator}
    </div>
  `;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Format message text for proper HTML display
 */
function formatMessageForDisplay(message) {
  if (!message) return '';
  
  // Escape basic HTML to prevent XSS
  let formatted = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Convert line breaks to HTML
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Convert basic markdown formatting
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
  
  return formatted;
}

/**
 * Show thinking status with custom message
 */
function showThinkingStatus(message = 'Thinking...') {
  const thinkingId = 'thinking_' + Date.now();
  const thinkingComponent = createThinkingStatusComponent(thinkingId, message);
  
  const messagesContainer = document.querySelector('.iheard-messages');
  if (messagesContainer) {
    messagesContainer.appendChild(thinkingComponent);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  return thinkingId;
}

/**
 * Update conversation analytics for dashboard integration
 */
function updateConversationAnalytics() {
  if (!unifiedConversation) return;
  
  try {
    const analytics = unifiedConversation.getConversationAnalytics();
    
    // Store analytics for potential dashboard integration
    if (window.iHeardAnalytics) {
      window.iHeardAnalytics.updateConversationMetrics(analytics);
    }
    
    // Log analytics for debugging
    logger.debug('📊 Conversation analytics updated:', analytics);
    
  } catch (error) {
    logger.warn('⚠️ Failed to update conversation analytics:', error);
  }
}

/**
 * Get current conversation state
 */
export function getConversationState() {
  if (!unifiedConversation) return null;
  return unifiedConversation.getConversationState();
}

/**
 * Switch to specific mode programmatically
 */
export async function switchToMode(targetMode) {
  if (!unifiedConversation) {
    throw new Error('Conversation system not initialized');
  }
  
  return await unifiedConversation.switchMode(targetMode, true);
}

/**
 * Clean up unified conversation resources
 */
export async function cleanupUnifiedConversation() {
  try {
    if (unifiedConversation) {
      await unifiedConversation.cleanup();
      unifiedConversation = null;
      currentSessionData = null;
      logger.info('🧹 Unified conversation cleaned up');
    }
  } catch (error) {
    logger.warn('⚠️ Error during unified conversation cleanup:', error);
  }
}

/**
 * Legacy compatibility - map to unified messaging
 */
export async function sendMessage(message) {
  return await sendUnifiedMessage(message);
}

/**
 * Export for module integration
 */
export {
  unifiedConversation,
  currentSessionData
};