/**
 * Event handling for iHeardAI Widget
 * Manages user interactions, clicks, and UI events
 */

import { 
  isOpen, 
  isVoiceConnected, 
  isConnecting,
  setOpen,
  setConnecting,
  setVoiceConnected
} from '../core/state.js';
import { widgetConfig } from '../core/config.js';
import { updateCallButtonState } from './components.js';
import { 
  addUserMessage, 
  addAgentMessage, 
  sendTextMessage,
  showWelcomeMessage,
  getMessageCount 
} from './messaging.js';
import { toggleTranscription } from './transcription.js';
import { 
  connectToLiveKit,
  disconnectFromLiveKit,
  updateWaveAnimation
} from '../voice/index.js';

/**
 * Setup event listeners for widget interactions
 * @param {HTMLElement} widget - Widget container element
 */
export function setupEventListeners(widget) {
  const button = widget.querySelector('.iheard-widget-button');
  const headerRect = widget.querySelector('.iheard-chat-header-rect');
  const callBtn = widget.querySelector('.iheard-call-btn');
  const ccBtn = widget.querySelector('.iheard-cc-btn');
  const actionBtn = widget.querySelector('.iheard-action-btn');
  const input = widget.querySelector('.iheard-input');
  const chatInterface = widget.querySelector('.iheard-chat-interface');

  // Toggle chat
  button.addEventListener('click', () => {
    if (!widgetConfig.isEnabled) return;
    
    const newIsOpen = !isOpen;
    setOpen(newIsOpen);
    chatInterface.style.display = newIsOpen ? 'grid' : 'none';
    chatInterface.classList.toggle('iheard-chat-open', newIsOpen);
    
    // Handle mobile body scroll prevention and full screen mode
    if (window.innerWidth <= 480) {
      if (newIsOpen) {
        document.body.classList.add('chat-open');
        button.classList.add('chat-open');
        
        // Ensure full screen positioning
        chatInterface.style.position = 'fixed';
        chatInterface.style.top = '0';
        chatInterface.style.left = '0';
        chatInterface.style.right = '0';
        chatInterface.style.bottom = '0';
        chatInterface.style.width = '100%';
        chatInterface.style.height = '100%';
        chatInterface.style.zIndex = '999999';
      } else {
        document.body.classList.remove('chat-open');
        button.classList.remove('chat-open');
        // Reset positioning
        chatInterface.style.position = '';
        chatInterface.style.top = '';
        chatInterface.style.left = '';
        chatInterface.style.right = '';
        chatInterface.style.bottom = '';
        chatInterface.style.width = '';
        chatInterface.style.height = '';
        chatInterface.style.zIndex = '';
      }
    }

    if (newIsOpen && input) {
      // Show welcome message if this is the first time opening and no messages exist
      if (widgetConfig.welcomeMessage && getMessageCount() === 0) {
        const messagesContainer = chatInterface.querySelector('.iheard-chat-messages');
        if (messagesContainer) {
          showWelcomeMessage(widgetConfig.welcomeMessage, messagesContainer);
        }
      }
      
      // Focus input when opening
      setTimeout(() => {
        if (input) {
          input.focus();
        }
      }, 100);
    }
  });

  // Close chat when clicking on header pill (except call button)
  headerRect.addEventListener('click', (e) => {
    // Don't close if clicking on the call button
    if (e.target.closest('.iheard-call-btn')) {
      return;
    }
    
    setOpen(false);
    chatInterface.style.display = 'none';
    chatInterface.classList.remove('iheard-chat-open');
    
    // Handle mobile body scroll restoration and reset positioning
    if (window.innerWidth <= 480) {
      document.body.classList.remove('chat-open');
      const button = widget.querySelector('.iheard-widget-button');
      if (button) button.classList.remove('chat-open');
      // Reset chat interface positioning
      chatInterface.style.position = '';
      chatInterface.style.top = '';
      chatInterface.style.left = '';
      chatInterface.style.right = '';
      chatInterface.style.bottom = '';
      chatInterface.style.width = '';
      chatInterface.style.height = '';
      chatInterface.style.zIndex = '';
    }
  });

  // Send message on action button click
  if (actionBtn && input) {
    actionBtn.addEventListener('click', () => {
      sendMessage();
    });
  }

  // Send message on Enter key
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Call button event listener
  if (callBtn) {
    callBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCallButtonClick();
    });
  }

  // CC button event listener
  if (ccBtn) {
    ccBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTranscription();
    });
  }
}

/**
 * Setup input event handlers for message sending
 * @param {HTMLElement} input - Input element
 * @param {HTMLElement} actionBtn - Action button element
 */
export function setupInputEventHandlers(input, actionBtn) {
  function handleSend() {
    const message = input.value.trim();
    if (message && !isConnecting) {
      addUserMessage(message);
      input.value = '';
      sendTextMessage(message);
    }
  }

  actionBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });
}

/**
 * Handle call button click
 */
async function handleCallButtonClick() {
  try {
    if (isVoiceConnected) {
      // End the call
      console.log('🔇 Ending voice call...');
      await disconnectFromLiveKit();
      setVoiceConnected(false);
      updateCallButtonState('disconnected');
      
      // Restore normal input with animation
      const inputWrapper = document.querySelector('.iheard-chat-input');
      const waveContainer = document.querySelector('.iheard-wave-container');
      
      if (inputWrapper) {
        inputWrapper.classList.remove('showing-waves');
        // Small delay to ensure state has propagated
        setTimeout(() => {
          updateWaveAnimation();
        }, 50);
      }
      
      if (waveContainer) {
        waveContainer.style.opacity = '0';
        setTimeout(() => {
          if (waveContainer.parentNode) {
            waveContainer.parentNode.removeChild(waveContainer);
          }
        }, 300);
      }
      
      addAgentMessage('Voice call ended. You can continue with text chat.');
      
    } else {
      // Start the call
      console.log('🎤 Starting voice call...');
      updateCallButtonState('connecting');
      
      await connectToLiveKit();
      setVoiceConnected(true);
      updateCallButtonState('connected');
      
      // Update input area to show voice mode - call after isVoiceConnected is set
      setTimeout(() => {
        updateWaveAnimation(false);
      }, 100);
      
      addAgentMessage('Voice call started! I can hear you now. Speak naturally.');
    }
    
  } catch (error) {
    console.error('❌ Call button action failed:', error);
    updateCallButtonState('disconnected');
    setVoiceConnected(false);
    // Restore normal input when call fails
    setTimeout(() => {
      updateWaveAnimation();
    }, 50);
    addAgentMessage(`Voice call failed: ${error.message}. Please try again.`);
  }
}

/**
 * Send message
 */
function sendMessage() {
  const input = document.querySelector('.iheard-input');
  if (!input) return;
  
  const message = input.value.trim();
  if (message && !isConnecting) {
    addUserMessage(message);
    input.value = '';
    sendTextMessage(message);
  }
}






/**
 * Handle window resize events
 */
export function setupWindowEventListeners() {
  // Handle window resize for mobile responsiveness
  window.addEventListener('resize', () => {
    const widget = document.getElementById('iheard-ai-widget');
    const chatInterface = widget?.querySelector('.iheard-chat-interface');
    
    if (chatInterface && isOpen) {
      // Re-apply mobile styles if needed
      if (window.innerWidth <= 480) {
        document.body.classList.add('chat-open');
        chatInterface.style.position = 'fixed';
        chatInterface.style.top = '0';
        chatInterface.style.left = '0';
        chatInterface.style.right = '0';
        chatInterface.style.bottom = '0';
        chatInterface.style.width = '100%';
        chatInterface.style.height = '100%';
      } else {
        document.body.classList.remove('chat-open');
        chatInterface.style.position = '';
        chatInterface.style.top = '';
        chatInterface.style.left = '';
        chatInterface.style.right = '';
        chatInterface.style.bottom = '';
        chatInterface.style.width = '';
        chatInterface.style.height = '';
      }
    }
  });

  // Handle orientation change on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      // Re-trigger resize logic after orientation change
      window.dispatchEvent(new Event('resize'));
    }, 100);
  });
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
export function handleKeyboardShortcuts(e) {
  // ESC to close chat
  if (e.key === 'Escape' && isOpen) {
    const widget = document.getElementById('iheard-ai-widget');
    const chatInterface = widget?.querySelector('.iheard-chat-interface');
    
    if (chatInterface) {
      setOpen(false);
      chatInterface.style.display = 'none';
      chatInterface.classList.remove('iheard-chat-open');
      
      if (window.innerWidth <= 480) {
        document.body.classList.remove('chat-open');
        const button = widget.querySelector('.iheard-widget-button');
        if (button) button.classList.remove('chat-open');
      }
    }
  }
}

/**
 * Setup global keyboard event listeners
 */
export function setupKeyboardEventListeners() {
  document.addEventListener('keydown', handleKeyboardShortcuts);
}