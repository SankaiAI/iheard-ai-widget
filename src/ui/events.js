/**
 * Event handling for iHeardAI Widget
 * Manages user interactions, clicks, and UI events
 */

/**
 * Track user interaction for smart polling optimization
 */
function trackUserInteraction() {
  window.iHeardLastInteraction = Date.now();
}

import { 
  isOpen, 
  isVoiceConnected, 
  isConnecting,
  setOpen,
  setConnecting,
  setVoiceConnected,
  isAgentProcessing,
  isAgentThinking,
  isAgentResponding,
  canInterrupt,
  pauseRequested,
  setAgentProcessing,
  setPauseRequested,
  setAgentResponding,
  setCanInterrupt
} from '../core/state.js';
import { widgetConfig } from '../core/config.js';
import { updateCallButtonState } from './components.js';
import { 
  addUserMessage, 
  addAgentMessage, 
  sendTextMessage,
  showWelcomeMessage,
  getMessageCount,
  restoreChatHistory,
  startEndChatTimer,
  clearEndChatTimer
} from './messaging.js';
import { sendAgentInterrupt } from '../api/websocket.js';
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
    trackUserInteraction();
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
      // Load chat history when opening chat for the first time
      if (getMessageCount() === 0) {
        const messagesContainer = chatInterface.querySelector('.iheard-chat-messages');
        if (messagesContainer) {
          // Try to restore chat history first
          restoreChatHistory(messagesContainer).then((historyLoaded) => {
            // Only show welcome message if no history was loaded
            if (!historyLoaded && widgetConfig.welcomeMessage) {
              showWelcomeMessage(widgetConfig.welcomeMessage, messagesContainer);
            }
            // Start end chat timer after loading history
            if (historyLoaded || getMessageCount() > 0) {
              startEndChatTimer();
            }
          }).catch((error) => {
            console.warn('Failed to restore chat history:', error);
            // Show welcome message as fallback
            if (widgetConfig.welcomeMessage) {
              showWelcomeMessage(widgetConfig.welcomeMessage, messagesContainer);
            }
          });
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
    clearEndChatTimer(); // Clear end chat timer when closing
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
      trackUserInteraction();
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
      trackUserInteraction();
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
  
  // Restart end chat timer on input activity
  input.addEventListener('input', () => {
    startEndChatTimer();
  });
  
  // Also restart on focus (when user clicks in input)
  input.addEventListener('focus', () => {
    startEndChatTimer();
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
  const actionBtn = document.querySelector('.iheard-action-btn');
  if (!input || !actionBtn) return;
  
  console.log('🎯 sendMessage called:', {
    isAgentResponding,
    canInterrupt,
    hasPauseClass: actionBtn.classList.contains('pause'),
    buttonClasses: Array.from(actionBtn.classList),
    buttonDisabled: actionBtn.disabled
  });
  
  // Check if this is a pause action during any agent processing
  if ((isAgentResponding || isAgentThinking || isAgentProcessing) && actionBtn.classList.contains('pause')) {
    console.log('🎯 PAUSE ACTION DETECTED - calling handlePauseInterrupt');
    handlePauseInterrupt();
    return;
  }
  
  // Don't allow sending new messages while agent is processing
  if (isAgentProcessing || isAgentThinking || isAgentResponding) {
    console.log('⏸️ Agent is working - use pause button to interrupt');
    return;
  }
  
  // Send message when agent is ready
  const message = input.value.trim();
  if (message) {
    addUserMessage(message);
    input.value = '';
    sendTextMessage(message);
  }
}

/**
 * Handle pause/interrupt action during agent response
 */
function handlePauseInterrupt() {
  console.log('⏸️ User requested pause/interrupt');
  
  // Send interrupt signal to backend to stop agent processing
  const interruptSent = sendAgentInterrupt();
  if (interruptSent) {
    console.log('✅ Backend interrupt signal sent successfully');
  } else {
    console.warn('⚠️ Failed to send backend interrupt signal');
  }
  
  // Set pause state
  setPauseRequested(true);
  setAgentResponding(false);
  setCanInterrupt(false);
  setAgentProcessing(false);
  
  // Interrupt any ongoing typewriter effect
  const messageContent = document.querySelector('.iheard-message.streaming .message-content');
  if (messageContent && messageContent._interruptTypewriter) {
    messageContent._interruptTypewriter();
  }
  
  // Re-enable input for new message
  const input = document.querySelector('.iheard-input');
  if (input) {
    input.disabled = false;
    input.placeholder = 'Agent paused. Type your message...';
    input.focus();
  }
  
  // Reset button to send state
  const actionBtn = document.querySelector('.iheard-action-btn');
  if (actionBtn) {
    actionBtn.classList.remove('pause', 'processing');
    actionBtn.classList.add('send');
    actionBtn.disabled = false;
    actionBtn.title = 'Send message';
    actionBtn.style.pointerEvents = 'auto';
    actionBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
      </svg>
    `;
  }
  
  // Add a pause indicator message
  addPauseIndicator();
}

/**
 * Add visual indicator that agent was paused
 */
function addPauseIndicator() {
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  const pauseIndicator = document.createElement('div');
  pauseIndicator.className = 'iheard-pause-indicator';
  pauseIndicator.innerHTML = `
    <div class="pause-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="6" width="2" height="12"></rect>
        <rect x="13" y="6" width="2" height="12"></rect>
      </svg>
      <span>Agent response paused. You can send a new message.</span>
    </div>
  `;
  
  messagesContainer.appendChild(pauseIndicator);
  
  // Scroll to show the pause indicator
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  console.log('⏸️ Pause indicator added to chat');
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