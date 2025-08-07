/**
 * UI components creation for iHeardAI Widget
 * Creates and manages widget HTML structure and components
 */

import { widgetConfig } from '../core/config.js';

/**
 * Create the main widget HTML structure
 * @returns {HTMLElement} Widget container element
 */
export function createWidgetHTML() {
  const container = document.createElement('div');
  container.id = 'iheard-ai-widget';
  container.className = 'iheard-widget-container';
  
  // Set position
  if (widgetConfig.position.includes('bottom')) {
    container.style.bottom = '20px';
  } else {
    container.style.top = '20px';
  }
  
  if (widgetConfig.position.includes('right')) {
    container.style.right = '20px';
  } else {
    container.style.left = '20px';
  }
  
  // Add position class for CSS targeting
  container.classList.add(`position-${widgetConfig.position}`);

  // Create widget button
  const button = createWidgetButton();
  
  // Create chat interface
  const chatInterface = createChatInterface();

  // Assemble widget
  container.appendChild(button);
  container.appendChild(chatInterface);

  return container;
}

/**
 * Create the widget button
 * @returns {HTMLElement} Widget button element
 */
function createWidgetButton() {
  const button = document.createElement('div');
  button.className = 'iheard-widget-button';
  
  // Apply custom styling
  if (widgetConfig.gradientEnabled) {
    button.style.background = `linear-gradient(${widgetConfig.gradientDirection}, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`;
  } else {
    button.style.background = widgetConfig.primaryColor;
  }
  
  if (widgetConfig.glassEffect) {
    button.style.backdropFilter = 'blur(12px)';
    button.style.border = 'none';
  }

  // Create button content based on style
  if (widgetConfig.widgetStyle === 'eye-animation') {
    button.innerHTML = '<div class="iheard-eye-logo"></div>';
  } else {
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  }

  // Add button text if enabled
  if (widgetConfig.showButtonText) {
    button.innerHTML += `<span class="button-text">${widgetConfig.buttonText}</span>`;
  }

  return button;
}

/**
 * Create the chat interface
 * @returns {HTMLElement} Chat interface element
 */
function createChatInterface() {
  const chatInterface = document.createElement('div');
  chatInterface.className = 'iheard-chat-interface';
  
  // Apply appearance styling
  if (widgetConfig.useDefaultAppearance) {
    chatInterface.classList.add('default-appearance');
  } else if (widgetConfig.chatBackgroundColor && widgetConfig.chatBackgroundColor !== 'transparent') {
    chatInterface.style.background = widgetConfig.chatBackgroundColor;
  }

  // Create content container
  const contentContainer = createContentContainer();
  chatInterface.appendChild(contentContainer);

  return chatInterface;
}

/**
 * Create the chat content container
 * @returns {HTMLElement} Content container element
 */
function createContentContainer() {
  const contentContainer = document.createElement('div');
  contentContainer.className = 'iheard-chat-content-container';
  
  if (widgetConfig.useDefaultAppearance) {
    contentContainer.classList.add('default-appearance');
  }

  // Create header
  const header = createChatHeader();
  
  // Create messages container
  const messagesContainer = createMessagesContainer();
  
  // Create input area (now includes branding)
  const inputArea = createInputArea();

  // Assemble content container
  contentContainer.appendChild(header);
  contentContainer.appendChild(messagesContainer);
  contentContainer.appendChild(inputArea);

  return contentContainer;
}

/**
 * Create the chat header
 * @returns {HTMLElement} Chat header element
 */
function createChatHeader() {
  const header = document.createElement('div');
  header.className = 'iheard-chat-header';
  
  if (widgetConfig.useDefaultAppearance) {
    header.classList.add('default-appearance');
  }

  const headerRect = document.createElement('div');
  headerRect.className = 'iheard-chat-header-rect';

  const headerContent = document.createElement('div');
  headerContent.className = 'iheard-chat-header-content';

  // Create title group
  const titleGroup = document.createElement('div');
  titleGroup.className = 'iheard-chat-title-group';

  // Create down arrow
  const downArrow = document.createElement('div');
  downArrow.className = 'iheard-header-arrow';
  downArrow.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
  `;
  titleGroup.appendChild(downArrow);

  // Create avatar
  const avatar = createAvatar();
  titleGroup.appendChild(avatar);

  // Create title and status container
  const titleContainer = document.createElement('div');
  titleContainer.className = 'iheard-title-container';
  
  const titleElement = document.createElement('h3');
  titleElement.className = 'iheard-chat-title';
  titleElement.textContent = widgetConfig.agentName;
  
  const aiAgentLabel = document.createElement('span');
  aiAgentLabel.className = 'iheard-ai-agent-label';
  aiAgentLabel.innerHTML = `
    <span class="ai-badge">AI</span>
    <span class="agent-text">Agent</span>
  `;
  
  titleContainer.appendChild(titleElement);
  titleContainer.appendChild(aiAgentLabel);
  titleGroup.appendChild(titleContainer);

  // Create call section with CC toggle
  const callSection = createCallSection();

  // Assemble header
  headerContent.appendChild(titleGroup);
  headerContent.appendChild(callSection);
  headerRect.appendChild(headerContent);
  header.appendChild(headerRect);

  return header;
}

/**
 * Create avatar element
 * @returns {HTMLElement} Avatar element
 */
function createAvatar() {
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'iheard-chat-avatar';

  // Create gradient wrapper
  const gradientWrapper = document.createElement('div');
  gradientWrapper.className = 'iheard-chat-avatar-wrapper';

  if (widgetConfig.avatar) {
    const img = document.createElement('img');
    img.src = widgetConfig.avatar;
    img.alt = widgetConfig.agentName;
    gradientWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'iheard-chat-avatar-placeholder';
    placeholder.textContent = widgetConfig.agentName.charAt(0).toUpperCase();
    gradientWrapper.appendChild(placeholder);
  }

  avatarDiv.appendChild(gradientWrapper);
  return avatarDiv;
}

/**
 * Create call section with call button and CC toggle
 * @returns {HTMLElement} Call section element
 */
function createCallSection() {
  const callSection = document.createElement('div');
  callSection.className = 'iheard-call-section';

  // Create CC toggle button
  const ccButton = document.createElement('button');
  ccButton.className = 'iheard-cc-btn';
  ccButton.title = 'Toggle closed captions';
  ccButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <path d="M7 10h4m-4 4h4m2-4h4m-4 4h4"/>
    </svg>
  `;

  // Create call button
  const callButton = document.createElement('button');
  callButton.className = 'iheard-call-btn';
  callButton.title = 'Voice call';
  callButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="4" y="11" width="2" height="2" rx="1" fill="currentColor"/>
      <rect x="8" y="9" width="2" height="6" rx="1" fill="currentColor"/>
      <rect x="12" y="7" width="2" height="10" rx="1" fill="currentColor"/>
      <rect x="16" y="9" width="2" height="6" rx="1" fill="currentColor"/>
      <rect x="20" y="11" width="2" height="2" rx="1" fill="currentColor"/>
    </svg>
    Call
  `;

  callSection.appendChild(ccButton);
  callSection.appendChild(callButton);
  return callSection;
}

/**
 * Create messages container
 * @returns {HTMLElement} Messages container element
 */
function createMessagesContainer() {
  const container = document.createElement('div');
  container.className = 'iheard-chat-messages-container';

  const messagesDiv = document.createElement('div');
  const messagesClass = widgetConfig.useDefaultAppearance ? 'iheard-chat-messages default-appearance' : 'iheard-chat-messages';
  messagesDiv.className = messagesClass;

  // Welcome message will be added dynamically with animation when chat opens

  container.appendChild(messagesDiv);
  return container;
}

/**
 * Create input area
 * @returns {HTMLElement} Input area element
 */
function createInputArea() {
  const inputArea = document.createElement('div');
  const inputAreaClass = widgetConfig.useDefaultAppearance ? 'iheard-chat-input default-appearance' : 'iheard-chat-input';
  inputArea.className = inputAreaClass;

  const inputClass = widgetConfig.useDefaultAppearance ? 'iheard-input default-appearance' : 'iheard-input';
  
  inputArea.innerHTML = `
    <div class="iheard-input-row">
      <input type="text" class="${inputClass}" placeholder="${widgetConfig.inputPlaceholder}" />
      <button class="iheard-action-btn" title="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
        </svg>
      </button>
    </div>
    <div class="iheard-branding">
      <span class="iheard-powered-by">Powered by iHeard.ai</span>
    </div>
  `;

  return inputArea;
}


/**
 * Update call button state
 * @param {string} state - Button state ('disconnected', 'connecting', 'connected')
 */
export function updateCallButtonState(state) {
  const callBtn = document.querySelector('.iheard-call-btn');
  const statusIndicator = document.querySelector('.iheard-status-indicator');
  const statusText = document.querySelector('.iheard-status-text');
  
  if (!callBtn) return;
  
  switch (state) {
    case 'connecting':
      callBtn.style.background = 'rgba(255, 165, 0, 0.9)';
      callBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="8" width="2" height="8" rx="1">
            <animate attributeName="height" values="8;16;8" dur="1s" repeatCount="indefinite"/>
            <animate attributeName="y" values="8;4;8" dur="1s" repeatCount="indefinite"/>
          </rect>
          <rect x="8" y="6" width="2" height="12" rx="1">
            <animate attributeName="height" values="12;18;12" dur="1.2s" repeatCount="indefinite"/>
            <animate attributeName="y" values="6;3;6" dur="1.2s" repeatCount="indefinite"/>
          </rect>
          <rect x="12" y="4" width="2" height="16" rx="1">
            <animate attributeName="height" values="16;20;16" dur="0.8s" repeatCount="indefinite"/>
            <animate attributeName="y" values="4;2;4" dur="0.8s" repeatCount="indefinite"/>
          </rect>
          <rect x="16" y="6" width="2" height="12" rx="1">
            <animate attributeName="height" values="12;18;12" dur="1.1s" repeatCount="indefinite"/>
            <animate attributeName="y" values="6;3;6" dur="1.1s" repeatCount="indefinite"/>
          </rect>
          <rect x="20" y="8" width="2" height="8" rx="1">
            <animate attributeName="height" values="8;16;8" dur="0.9s" repeatCount="indefinite"/>
            <animate attributeName="y" values="8;4;8" dur="0.9s" repeatCount="indefinite"/>
          </rect>
        </svg>
        Connecting...
      `;
      if (statusIndicator) statusIndicator.className = 'iheard-status-indicator connecting';
      if (statusText) statusText.textContent = 'Connecting...';
      break;
      
    case 'connected':
      callBtn.style.background = 'rgba(239, 68, 68, 0.9)';
      callBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="10" width="2" height="4" rx="1" fill="currentColor"/>
          <rect x="8" y="8" width="2" height="8" rx="1" fill="currentColor"/>
          <rect x="12" y="6" width="2" height="12" rx="1" fill="currentColor"/>
          <rect x="16" y="8" width="2" height="8" rx="1" fill="currentColor"/>
          <rect x="20" y="10" width="2" height="4" rx="1" fill="currentColor"/>
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1" opacity="0.3"/>
        </svg>
        End Call
      `;
      if (statusIndicator) statusIndicator.className = 'iheard-status-indicator connected';
      if (statusText) statusText.textContent = 'Connected';
      // Show CC button when call is connected
      showCCButton();
      break;
      
    case 'disconnected':
    default:
      callBtn.style.background = 'rgba(34, 197, 94, 0.9)';
      callBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="11" width="2" height="2" rx="1" fill="currentColor"/>
          <rect x="8" y="9" width="2" height="6" rx="1" fill="currentColor"/>
          <rect x="12" y="7" width="2" height="10" rx="1" fill="currentColor"/>
          <rect x="16" y="9" width="2" height="6" rx="1" fill="currentColor"/>
          <rect x="20" y="11" width="2" height="2" rx="1" fill="currentColor"/>
        </svg>
        Call
      `;
      if (statusIndicator) statusIndicator.className = 'iheard-status-indicator';
      if (statusText) statusText.textContent = '';
      // Hide CC button when call is disconnected
      hideCCButton();
      break;
  }
}

/**
 * Show CC button with fade-in animation
 */
export function showCCButton() {
  const ccBtn = document.querySelector('.iheard-cc-btn');
  if (ccBtn) {
    // Small delay to ensure smooth animation
    setTimeout(() => {
      ccBtn.classList.add('visible');
    }, 200);
  }
}

/**
 * Hide CC button with fade-out animation
 */
export function hideCCButton() {
  const ccBtn = document.querySelector('.iheard-cc-btn');
  if (ccBtn) {
    ccBtn.classList.remove('visible');
  }
}

/**
 * Update widget appearance based on configuration
 * @param {HTMLElement} widget - Widget container element
 */
export function updateWidgetAppearance(widget) {
  console.log('🎨 Widget appearance updated from configuration');
  
  // Update widget position
  if (widget) {
    // Reset position styles
    widget.style.bottom = '';
    widget.style.top = '';
    widget.style.left = '';
    widget.style.right = '';
    
    // Remove old position classes
    widget.className = widget.className.replace(/position-\S+/g, '').trim();
    
    // Apply new position
    if (widgetConfig.position.includes('bottom')) {
      widget.style.bottom = '20px';
    } else {
      widget.style.top = '20px';
    }
    
    if (widgetConfig.position.includes('right')) {
      widget.style.right = '20px';
    } else {
      widget.style.left = '20px';
    }
    
    // Add new position class
    widget.classList.add(`position-${widgetConfig.position}`);
    
    console.log('📍 Widget position updated to:', widgetConfig.position);
  }
  
  // Update widget button appearance
  const button = widget.querySelector('.iheard-widget-button');
  if (button) {
    // Update button colors
    if (widgetConfig.gradientEnabled) {
      button.style.background = `linear-gradient(${widgetConfig.gradientDirection}, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`;
    } else {
      button.style.background = widgetConfig.primaryColor;
    }
    
    console.log('🎨 Button colors updated - Gradient:', widgetConfig.gradientEnabled, 'Primary:', widgetConfig.primaryColor);
  }

  // Update chat interface appearance
  const chatInterface = widget.querySelector('.iheard-chat-interface');
  if (chatInterface) {
    if (widgetConfig.useDefaultAppearance) {
      chatInterface.classList.add('default-appearance');
      // Remove custom background when using default appearance
      chatInterface.style.background = '';
    } else {
      chatInterface.classList.remove('default-appearance');
      if (widgetConfig.chatBackgroundColor && widgetConfig.chatBackgroundColor !== 'transparent') {
        chatInterface.style.background = widgetConfig.chatBackgroundColor;
      } else {
        chatInterface.style.background = '';
      }
    }
    
    // Update glass effect
    if (widgetConfig.glassEffect) {
      chatInterface.classList.add('glass-effect');
    } else {
      chatInterface.classList.remove('glass-effect');
    }
    
    console.log('🏠 Chat background updated:', widgetConfig.chatBackgroundColor, 'Glass effect:', widgetConfig.glassEffect);
  }
  
  // Update input placeholder
  const input = widget.querySelector('.iheard-input');
  if (input && widgetConfig.inputPlaceholder) {
    input.placeholder = widgetConfig.inputPlaceholder;
    console.log('💬 Input placeholder updated to:', widgetConfig.inputPlaceholder);
  }
  
  // Update chat title
  const chatTitle = widget.querySelector('.iheard-chat-title');
  if (chatTitle) {
    // Use agentName instead of chatTitle for the main title
    const titleText = widgetConfig.agentName || widgetConfig.chatTitle || 'AI Assistant';
    chatTitle.textContent = titleText;
    console.log('🏷️ Chat title updated to:', titleText);
  }
  
  // Update button text visibility and content
  const buttonText = widget.querySelector('.button-text');
  if (buttonText) {
    if (widgetConfig.showButtonText && widgetConfig.buttonText) {
      buttonText.textContent = widgetConfig.buttonText;
      buttonText.style.display = '';
      console.log('🔘 Button text updated to:', widgetConfig.buttonText);
    } else {
      buttonText.style.display = 'none';
      console.log('🔘 Button text hidden');
    }
  }
  
  // Update welcome message (if displayed in UI)
  const welcomeMsg = widget.querySelector('.iheard-welcome-message');
  if (welcomeMsg && widgetConfig.welcomeMessage) {
    welcomeMsg.textContent = widgetConfig.welcomeMessage;
    console.log('👋 Welcome message updated to:', widgetConfig.welcomeMessage);
  }
  
  // Update avatar (if displayed in UI)
  const avatarContainer = widget.querySelector('.iheard-chat-avatar');
  if (avatarContainer) {
    // Clear existing avatar content
    avatarContainer.innerHTML = '';
    
    // Create gradient wrapper
    const gradientWrapper = document.createElement('div');
    gradientWrapper.className = 'iheard-chat-avatar-wrapper';
    
    if (widgetConfig.avatar || widgetConfig.avatarUrl) {
      const avatarUrl = widgetConfig.avatar || widgetConfig.avatarUrl;
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = widgetConfig.agentName;
      img.onerror = () => {
        // Fallback to placeholder if image fails to load
        img.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'iheard-chat-avatar-placeholder';
        placeholder.textContent = widgetConfig.agentName.charAt(0).toUpperCase();
        gradientWrapper.appendChild(placeholder);
      };
      gradientWrapper.appendChild(img);
      console.log('👤 Avatar updated to:', avatarUrl);
    } else {
      // Use placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'iheard-chat-avatar-placeholder';
      placeholder.textContent = widgetConfig.agentName.charAt(0).toUpperCase();
      gradientWrapper.appendChild(placeholder);
      console.log('👤 Avatar set to placeholder:', widgetConfig.agentName.charAt(0));
    }
    
    avatarContainer.appendChild(gradientWrapper);
  }
  
  // Update call button, user message bubble, and send button colors
  const callButton = widget.querySelector('.iheard-call-btn');
  const sendButton = widget.querySelector('.iheard-action-btn');
  
  if (callButton) {
    // Update call button to use primary color instead of green gradient
    if (widgetConfig.gradientEnabled) {
      callButton.style.background = `linear-gradient(45deg, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`;
    } else {
      callButton.style.background = widgetConfig.primaryColor;
    }
    console.log('📞 Call button color updated to:', widgetConfig.primaryColor);
  }
  
  if (sendButton) {
    // Update send button background to use primary color, keep icon white
    if (widgetConfig.gradientEnabled) {
      sendButton.style.background = `linear-gradient(135deg, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`;
    } else {
      sendButton.style.background = widgetConfig.primaryColor;
    }
    sendButton.style.color = 'white'; // Always keep icon white
    console.log('📤 Send button background updated to:', widgetConfig.primaryColor);
  }
  
  // Update user message bubbles to use primary color
  const userMessages = widget.querySelectorAll('.user-message .message-content');
  userMessages.forEach(messageContent => {
    if (widgetConfig.gradientEnabled) {
      messageContent.style.background = `linear-gradient(135deg, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`;
    } else {
      messageContent.style.background = widgetConfig.primaryColor;
    }
  });
  
  // Create dynamic style for future user messages
  let userMessageStyle = document.getElementById('iheard-dynamic-user-message-style');
  if (!userMessageStyle) {
    userMessageStyle = document.createElement('style');
    userMessageStyle.id = 'iheard-dynamic-user-message-style';
    document.head.appendChild(userMessageStyle);
  }
  
  const userMessageBackground = widgetConfig.gradientEnabled 
    ? `linear-gradient(135deg, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`
    : widgetConfig.primaryColor;
    
  userMessageStyle.textContent = `
    .user-message .message-content {
      background: ${userMessageBackground} !important;
    }
  `;
  
  console.log('💬 User message bubble colors updated to:', userMessageBackground);
  
  // Update widget style classes
  if (widget && widgetConfig.widgetStyle) {
    // Remove old widget style classes
    widget.className = widget.className.replace(/widget-style-\S+/g, '').trim();
    // Add new widget style class
    widget.classList.add(`widget-style-${widgetConfig.widgetStyle}`);
    console.log('🎭 Widget style updated to:', widgetConfig.widgetStyle);
  }
  
  // Update enabled/disabled state visibility
  if (widgetConfig.isEnabled === false) {
    widget.style.display = 'none';
    console.log('🚫 Widget hidden - disabled');
  } else {
    widget.style.display = '';
    console.log('✅ Widget shown - enabled');
  }
  
  // Update active state (affects functionality but not visibility)
  if (widgetConfig.isActive) {
    widget.classList.add('active');
    console.log('🟢 Widget marked as active');
  } else {
    widget.classList.remove('active');
    console.log('⚪ Widget marked as inactive');
  }
  
  // Update voice/chat enabled states (affects button visibility)
  const voiceButton = widget.querySelector('.iheard-voice-button, .iheard-call-button');
  const chatButton = widget.querySelector('.iheard-chat-button, .iheard-widget-button');
  
  if (voiceButton) {
    if (widgetConfig.voiceEnabled) {
      voiceButton.style.display = '';
      console.log('🎤 Voice button shown');
    } else {
      voiceButton.style.display = 'none';
      console.log('🎤 Voice button hidden');
    }
  }
  
  if (chatButton) {
    if (widgetConfig.chatEnabled) {
      chatButton.style.display = '';
      console.log('💬 Chat button shown');
    } else {
      chatButton.style.display = 'none';
      console.log('💬 Chat button hidden');
    }
  }
  
  console.log('✨ All widget appearance updates completed');
}