/**
 * Messaging and chat UI management for iHeardAI Widget
 * Handles message display, user interactions, and chat functionality
 */

import { 
  currentUserMessage,
  currentAssistantMessage,
  isConnecting,
  setCurrentUserMessage,
  setCurrentAssistantMessage,
  setConnecting
} from '../core/state.js';
import { widgetConfig } from '../core/config.js';
import { 
  getTextAgentUrl,
  sendMessageToAgent,
  getFallbackResponse,
  generateSessionId
} from '../api/index.js';

/**
 * Add user message to chat
 * @param {string} message - User message text
 */
export function addUserMessage(message) {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  const messageElement = document.createElement('div');
  messageElement.className = 'iheard-message user-message';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = message;

  messageElement.appendChild(messageContent);
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log('👤 User message added:', message);
}

/**
 * Add agent message to chat with streaming support
 * @param {string} message - Agent message text
 * @param {boolean} isFinal - Whether this is the final message
 */
export function addAgentMessage(message, isFinal = true) {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  if (!currentAssistantMessage) {
    // Create new assistant message
    setCurrentAssistantMessage(document.createElement('div'));
    currentAssistantMessage.className = 'iheard-message assistant-message streaming';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    currentAssistantMessage.appendChild(messageContent);

    messagesContainer.appendChild(currentAssistantMessage);
  }

  // Update content
  const messageContent = currentAssistantMessage.querySelector('.message-content');
  messageContent.textContent = message;

  if (isFinal) {
    // Finalize the message
    currentAssistantMessage.classList.remove('streaming');
    currentAssistantMessage.classList.add('final');
    setCurrentAssistantMessage(null);
  }

  // Auto-scroll
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log('🤖 Agent message added:', message, 'Final:', isFinal);
}

/**
 * Show typing indicator
 * @returns {HTMLElement} Typing indicator element
 */
export function showTypingIndicator() {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return null;

  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'iheard-typing-indicator';
  typingIndicator.innerHTML = `
    <div class="message-content">
      <span>AI is thinking</span>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;

  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return typingIndicator;
}

/**
 * Hide typing indicator
 * @param {HTMLElement} indicator - Typing indicator element to remove
 */
export function hideTypingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}

/**
 * Create and show animated welcome message
 * @param {string} message - Welcome message text
 * @param {HTMLElement} container - Container element
 */
export function showWelcomeMessage(message, container) {
  if (!message || !container) return;
  
  // Remove any existing welcome message
  removeWelcomeMessage();
  
  // Create welcome message element
  const welcomeElement = document.createElement('div');
  welcomeElement.className = 'iheard-welcome-message';
  
  // Add default appearance class if needed
  const chatContainer = document.querySelector('.iheard-chat-container');
  if (chatContainer && chatContainer.classList.contains('default-appearance')) {
    welcomeElement.classList.add('default-appearance');
  }
  
  // Create text content container
  const textContainer = document.createElement('span');
  textContainer.className = 'welcome-text';
  
  // Create cursor element
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  
  welcomeElement.appendChild(textContainer);
  welcomeElement.appendChild(cursor);
  container.appendChild(welcomeElement);
  
  // Start typing animation
  typeWriterEffect(textContainer, message, cursor, welcomeElement);
}

/**
 * Typewriter effect for welcome message
 * @param {HTMLElement} textContainer - Container for text
 * @param {string} fullText - Full text to type
 * @param {HTMLElement} cursor - Cursor element
 * @param {HTMLElement} welcomeElement - Welcome message element
 */
function typeWriterEffect(textContainer, fullText, cursor, welcomeElement) {
  let currentIndex = 0;
  const typingSpeed = 50; // milliseconds per character
  const fadeDelay = 2000; // delay before fade out starts
  
  welcomeElement.classList.add('typing');
  
  function typeNextCharacter() {
    // Check if welcome message still exists (might be removed by user interaction)
    if (!welcomeElement.parentNode) {
      return;
    }
    
    if (currentIndex < fullText.length) {
      textContainer.textContent += fullText.charAt(currentIndex);
      currentIndex++;
      setTimeout(typeNextCharacter, typingSpeed);
    } else {
      // Typing complete - remove cursor and start fade out
      cursor.style.display = 'none';
      
      setTimeout(() => {
        if (welcomeElement.parentNode) {
          welcomeElement.classList.add('fade-out');
          
          // Remove element after fade animation
          setTimeout(() => {
            removeWelcomeMessage();
          }, 1000); // Match CSS animation duration
        }
      }, fadeDelay);
    }
  }
  
  // Start typing with initial delay
  setTimeout(typeNextCharacter, 500);
}

/**
 * Remove welcome message when chat starts
 */
export function removeWelcomeMessage() {
  const welcomeMessage = document.querySelector('.iheard-welcome-message');
  if (welcomeMessage && welcomeMessage.parentNode) {
    welcomeMessage.parentNode.removeChild(welcomeMessage);
  }
  
  // Also remove old style welcome message for compatibility
  const oldWelcomeMessage = document.querySelector('.welcome-message');
  if (oldWelcomeMessage && oldWelcomeMessage.parentNode) {
    oldWelcomeMessage.parentNode.removeChild(oldWelcomeMessage);
  }
}

/**
 * Send text message to agent
 * @param {string} message - Message to send
 */
export async function sendTextMessage(message) {
  if (isConnecting) {
    console.log('⏳ Already processing a message, please wait...');
    return;
  }

  setConnecting(true);

  // Show typing indicator
  const typingIndicator = showTypingIndicator();

  try {
    // Use the centralized API function
    const sessionId = generateSessionId();
    const response = await sendMessageToAgent(message, sessionId);
    
    // Hide typing indicator
    hideTypingIndicator(typingIndicator);
    
    addAgentMessage(response.response || response.message || 'I received your message!');

  } catch (error) {
    console.error('❌ Failed to connect to text agent:', error);
    
    // Hide typing indicator on error
    hideTypingIndicator(typingIndicator);
    
    // Use centralized fallback response
    const fallbackResponse = getFallbackResponse(message);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    addAgentMessage(fallbackResponse);
  }

  setConnecting(false);
}




/**
 * Clear all messages from chat
 */
export function clearMessages() {
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
    
    // Re-add animated welcome message if configured and chat is open
    if (widgetConfig.welcomeMessage) {
      const chatInterface = document.querySelector('.iheard-chat-interface');
      const isVisible = chatInterface && chatInterface.style.display !== 'none';
      
      if (isVisible) {
        showWelcomeMessage(widgetConfig.welcomeMessage, messagesContainer);
      }
    }
  }
  
  // Reset streaming message references
  setCurrentUserMessage(null);
  setCurrentAssistantMessage(null);
}

/**
 * Get message count
 * @returns {number} Number of messages in chat
 */
export function getMessageCount() {
  const messages = document.querySelectorAll('.iheard-message:not(.welcome-message):not(.iheard-welcome-message)');
  return messages.length;
}

/**
 * Export messages as text
 * @returns {string} Chat transcript
 */
export function exportChatTranscript() {
  const messages = document.querySelectorAll('.iheard-message');
  const transcript = [];
  
  messages.forEach(message => {
    const content = message.querySelector('.message-content')?.textContent;
    const isUser = message.classList.contains('user-message');
    const speaker = isUser ? 'User' : 'Assistant';
    
    if (content) {
      transcript.push(`${speaker}: ${content}`);
    }
  });
  
  return transcript.join('\n');
}