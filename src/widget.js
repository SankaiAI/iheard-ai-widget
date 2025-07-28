// iHeardAI Voice Agent Widget
// Version: 1.0.0
// CDN: https://cdn.iheard.ai/widget.js

(function() {
  'use strict';

  console.log('🚀 iHeardAI Voice Agent Widget Loading...');

  // Widget configuration with defaults
  let widgetConfig = {
    // Agent settings
    agentName: 'AI Assistant',
    avatar: '',
    personality: 'Helpful and professional e-commerce assistant',
    welcomeMessage: 'Hello! I\'m here to help you find the perfect products and answer any questions you might have.',
    voiceType: 'natural',
    language: 'en-US',
    responseStyle: 'conversational',
    voiceEnabled: true,
    chatEnabled: true,
    
    // Widget appearance
    position: 'bottom-right',
    buttonText: 'Ask AI Assistant',
    chatTitle: 'AI Sales Assistant',
    inputPlaceholder: 'Ask me anything...',
    primaryColor: '#ee5cee',
    gradientEnabled: false,
    gradientColor1: '#ee5cee',
    gradientColor2: '#31d1d1',
    gradientDirection: 'to right',
    glassEffect: false,
    widgetStyle: 'eye-animation',
    showButtonText: true,
    chatBackgroundColor: 'white',
    useDefaultAppearance: false,
    
    // Widget state
    isActive: true,
    isEnabled: true
  };

  // Widget state
  let isOpen = false;
  let isInitialized = false;
  let isConnecting = false;
  let messages = [];
  let currentSession = null;

  // Get configuration from URL parameters or data attributes
  function getInitialConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get('apiKey');
    const agentId = urlParams.get('agentId');
    
    // If we have an API key, fetch configuration from API
    if (apiKey || agentId) {
      fetchConfiguration(apiKey || agentId);
    } else {
      // Use default configuration
      initializeWidget();
    }
  }

  // Fetch configuration from API
  async function fetchConfiguration(identifier) {
    try {
      const response = await fetch(`/api/voice-agent/config/${identifier}`);
      if (response.ok) {
        const data = await response.json();
        widgetConfig = { ...widgetConfig, ...data.config };
        console.log('✅ Widget configuration loaded:', widgetConfig);
      } else {
        console.warn('⚠️ Failed to load configuration, using defaults');
      }
    } catch (error) {
      console.warn('⚠️ Error loading configuration:', error);
    } finally {
      initializeWidget();
    }
  }

  // Create widget CSS
  function createWidgetCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .iheard-widget-container {
        position: fixed;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      }

      .iheard-widget-button {
        cursor: pointer;
        border-radius: 25px;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        color: white;
        border: none;
        outline: none;
        user-select: none;
      }

      .iheard-widget-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }

      .iheard-widget-button:active {
        transform: translateY(0);
      }

      .iheard-eye-logo {
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .iheard-eye-logo::before {
        content: '';
        width: 8px;
        height: 8px;
        background: #333;
        border-radius: 50%;
        position: absolute;
        animation: eyeBlink 3s infinite;
      }

      @keyframes eyeBlink {
        0%, 90%, 100% { transform: scaleY(1); }
        95% { transform: scaleY(0.1); }
      }

      .iheard-chat-interface {
        position: absolute;
        width: 350px;
        height: 500px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        display: none;
        flex-direction: column;
        overflow: hidden;
        background: white;
        border: 1px solid #e5e7eb;
      }

      .iheard-chat-header {
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
      }

      .iheard-chat-header .agent-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .iheard-chat-header .agent-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: #333;
        font-weight: bold;
      }

      .iheard-chat-header .agent-name {
        font-weight: 600;
        font-size: 16px;
      }

      .iheard-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        font-size: 18px;
        line-height: 1;
        transition: background-color 0.2s;
      }

      .iheard-close-btn:hover {
        background: rgba(255,255,255,0.1);
      }

      .iheard-chat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f9fafb;
      }

      .iheard-message {
        padding: 12px;
        border-radius: 12px;
        max-width: 80%;
        word-wrap: break-word;
      }

      .iheard-agent-message {
        background: white;
        border: 1px solid #e5e7eb;
        align-self: flex-start;
      }

      .iheard-user-message {
        background: var(--primary-color, #ee5cee);
        color: white;
        align-self: flex-end;
        margin-left: auto;
      }

      .iheard-typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        align-self: flex-start;
        max-width: 80%;
      }

      .iheard-typing-dot {
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 50%;
        animation: typing 1.4s infinite;
      }

      .iheard-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .iheard-typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }

      .iheard-chat-input {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
        background: white;
      }

      .iheard-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .iheard-input:focus {
        border-color: var(--primary-color, #ee5cee);
      }

      .iheard-send-btn {
        padding: 8px 12px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: white;
        transition: opacity 0.2s;
      }

      .iheard-send-btn:hover {
        opacity: 0.9;
      }

      .iheard-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .iheard-voice-btn {
        padding: 8px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        background: var(--primary-color, #ee5cee);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .iheard-voice-btn:hover {
        transform: scale(1.1);
      }

      .iheard-voice-btn.recording {
        background: #ef4444;
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .iheard-widget-hidden {
        display: none !important;
      }

      /* Responsive design */
      @media (max-width: 480px) {
        .iheard-chat-interface {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          position: fixed;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
        }
      }
    `;
    return style;
  }

  // Create widget HTML
  function createWidgetHTML() {
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

    // Create button
    const button = document.createElement('div');
    button.className = 'iheard-widget-button';
    
    // Set button styling
    if (widgetConfig.gradientEnabled) {
      button.style.background = `linear-gradient(${widgetConfig.gradientDirection}, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`;
    } else {
      button.style.background = widgetConfig.primaryColor;
    }
    
    if (widgetConfig.glassEffect) {
      button.style.backdropFilter = 'blur(12px)';
      button.style.border = '1px solid rgba(255,255,255,0.18)';
    }

    // Add icon
    if (widgetConfig.widgetStyle === 'eye-animation') {
      button.innerHTML = '<div class="iheard-eye-logo"></div>';
    } else {
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }

    // Add button text
    if (widgetConfig.showButtonText) {
      button.innerHTML += `<span>${widgetConfig.buttonText}</span>`;
    }

    // Create chat interface
    const chatInterface = document.createElement('div');
    chatInterface.className = 'iheard-chat-interface';
    chatInterface.style.background = widgetConfig.chatBackgroundColor;

    // Set chat position
    if (widgetConfig.position.includes('bottom')) {
      chatInterface.style.bottom = '70px';
    } else {
      chatInterface.style.top = '70px';
    }
    
    if (widgetConfig.position.includes('right')) {
      chatInterface.style.right = '0';
    } else {
      chatInterface.style.left = '0';
    }

    // Chat header
    const header = document.createElement('div');
    header.className = 'iheard-chat-header';
    header.style.background = widgetConfig.primaryColor;
    
    header.innerHTML = `
      <div class="agent-info">
        <div class="agent-avatar">
          ${widgetConfig.avatar ? `<img src="${widgetConfig.avatar}" alt="${widgetConfig.agentName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : widgetConfig.agentName.charAt(0).toUpperCase()}
        </div>
        <span class="agent-name">${widgetConfig.chatTitle}</span>
      </div>
      <button class="iheard-close-btn" title="Close chat">×</button>
    `;

    // Chat messages
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'iheard-chat-messages';

    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'iheard-message iheard-agent-message';
    welcomeMessage.textContent = widgetConfig.welcomeMessage;
    messagesContainer.appendChild(welcomeMessage);

    // Chat input
    const inputContainer = document.createElement('div');
    inputContainer.className = 'iheard-chat-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'iheard-input';
    input.placeholder = widgetConfig.inputPlaceholder;
    
    const sendBtn = document.createElement('button');
    sendBtn.className = 'iheard-send-btn';
    sendBtn.textContent = 'Send';
    sendBtn.style.background = widgetConfig.primaryColor;

    // Voice button (if enabled)
    if (widgetConfig.voiceEnabled) {
      const voiceBtn = document.createElement('button');
      voiceBtn.className = 'iheard-voice-btn';
      voiceBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
      voiceBtn.title = 'Voice message';
      inputContainer.appendChild(voiceBtn);
    }

    inputContainer.appendChild(input);
    inputContainer.appendChild(sendBtn);

    // Assemble chat interface
    chatInterface.appendChild(header);
    chatInterface.appendChild(messagesContainer);
    chatInterface.appendChild(inputContainer);

    // Assemble widget
    container.appendChild(button);
    container.appendChild(chatInterface);

    return container;
  }

  // Initialize widget
  function initializeWidget() {
    if (isInitialized) return;

    // Add CSS
    const existingCSS = document.getElementById('iheard-widget-css');
    if (!existingCSS) {
      const css = createWidgetCSS();
      css.id = 'iheard-widget-css';
      document.head.appendChild(css);
    }

    // Create and append widget
    const widget = createWidgetHTML();
    document.body.appendChild(widget);

    // Add event listeners
    setupEventListeners(widget);

    isInitialized = true;
    console.log('✅ iHeardAI Widget initialized successfully');
  }

  // Setup event listeners
  function setupEventListeners(widget) {
    const button = widget.querySelector('.iheard-widget-button');
    const closeBtn = widget.querySelector('.iheard-close-btn');
    const sendBtn = widget.querySelector('.iheard-send-btn');
    const input = widget.querySelector('.iheard-input');
    const chatInterface = widget.querySelector('.iheard-chat-interface');
    const voiceBtn = widget.querySelector('.iheard-voice-btn');

    // Toggle chat
    button.addEventListener('click', () => {
      if (!widgetConfig.isEnabled) return;
      
      isOpen = !isOpen;
      chatInterface.style.display = isOpen ? 'flex' : 'none';
      
      if (isOpen) {
        input.focus();
      }
    });

    // Close chat
    closeBtn.addEventListener('click', () => {
      isOpen = false;
      chatInterface.style.display = 'none';
    });

    // Send message
    function sendMessage() {
      const message = input.value.trim();
      if (!message || isConnecting) return;

      addUserMessage(message);
      input.value = '';
      
      // Simulate AI response (replace with real API call)
      simulateAIResponse(message);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Voice button
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (isConnecting) return;
        
        if (widgetConfig.voiceEnabled) {
          // TODO: Implement voice recording
          console.log('🎤 Voice recording not implemented yet');
          alert('Voice recording will be implemented in the next phase!');
        }
      });
    }
  }

  // Add user message
  function addUserMessage(text) {
    const messagesContainer = document.querySelector('.iheard-chat-messages');
    const message = document.createElement('div');
    message.className = 'iheard-message iheard-user-message';
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add agent message
  function addAgentMessage(text) {
    const messagesContainer = document.querySelector('.iheard-chat-messages');
    const message = document.createElement('div');
    message.className = 'iheard-message iheard-agent-message';
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const messagesContainer = document.querySelector('.iheard-chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'iheard-typing-indicator';
    indicator.innerHTML = `
      <div class="iheard-typing-dot"></div>
      <div class="iheard-typing-dot"></div>
      <div class="iheard-typing-dot"></div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return indicator;
  }

  // Simulate AI response (replace with real API call)
  function simulateAIResponse(userMessage) {
    isConnecting = true;
    const sendBtn = document.querySelector('.iheard-send-btn');
    if (sendBtn) sendBtn.disabled = true;

    const typingIndicator = showTypingIndicator();

    // Simulate API delay
    setTimeout(() => {
      // Remove typing indicator
      if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
      }

      // Generate response based on user message
      let response = '';
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = `Hello! I'm ${widgetConfig.agentName}. How can I help you today?`;
      } else if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
        response = `I'd be happy to help you find products! What type of items are you looking for?`;
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        response = `I can help you with pricing information. Could you tell me which product you're interested in?`;
      } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
        response = `Our shipping options include standard delivery (3-5 days) and express delivery (1-2 days). What would you like to know?`;
      } else if (lowerMessage.includes('thank')) {
        response = `You're welcome! Is there anything else I can help you with?`;
      } else {
        response = `Thanks for your message: "${userMessage}". I'm here to help you with product recommendations, pricing, shipping, and any other questions you might have. What would you like to know?`;
      }

      addAgentMessage(response);
      
      isConnecting = false;
      if (sendBtn) sendBtn.disabled = false;
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  }

  // Update configuration
  function updateConfig(newConfig) {
    const oldConfig = { ...widgetConfig };
    widgetConfig = { ...widgetConfig, ...newConfig };
    
    console.log('🔄 Widget config updated:', widgetConfig);

    // Reinitialize if appearance changed
    const appearanceChanged = 
      oldConfig.position !== widgetConfig.position ||
      oldConfig.primaryColor !== widgetConfig.primaryColor ||
      oldConfig.gradientEnabled !== widgetConfig.gradientEnabled ||
      oldConfig.gradientColor1 !== widgetConfig.gradientColor1 ||
      oldConfig.gradientColor2 !== widgetConfig.gradientColor2 ||
      oldConfig.gradientDirection !== widgetConfig.gradientDirection ||
      oldConfig.glassEffect !== widgetConfig.glassEffect ||
      oldConfig.widgetStyle !== widgetConfig.widgetStyle ||
      oldConfig.showButtonText !== widgetConfig.showButtonText ||
      oldConfig.buttonText !== widgetConfig.buttonText ||
      oldConfig.chatBackgroundColor !== widgetConfig.chatBackgroundColor ||
      oldConfig.agentName !== widgetConfig.agentName ||
      oldConfig.avatar !== widgetConfig.avatar ||
      oldConfig.chatTitle !== widgetConfig.chatTitle ||
      oldConfig.welcomeMessage !== widgetConfig.welcomeMessage ||
      oldConfig.inputPlaceholder !== widgetConfig.inputPlaceholder;

    if (appearanceChanged && isInitialized) {
      const existingWidget = document.getElementById('iheard-ai-widget');
      if (existingWidget) {
        existingWidget.remove();
      }
      isInitialized = false;
      initializeWidget();
    }
  }

  // Listen for configuration updates from parent
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CONFIG_UPDATE') {
      updateConfig(event.data.config);
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', getInitialConfig);
  } else {
    getInitialConfig();
  }

  // Expose widget API
  window.iHeardAIWidget = {
    updateConfig,
    open: () => {
      if (isInitialized) {
        isOpen = true;
        const chatInterface = document.querySelector('.iheard-chat-interface');
        if (chatInterface) {
          chatInterface.style.display = 'flex';
        }
      }
    },
    close: () => {
      if (isInitialized) {
        isOpen = false;
        const chatInterface = document.querySelector('.iheard-chat-interface');
        if (chatInterface) {
          chatInterface.style.display = 'none';
        }
      }
    },
    sendMessage: (message) => {
      if (isInitialized && message) {
        addUserMessage(message);
        simulateAIResponse(message);
      }
    },
    getConfig: () => widgetConfig,
    isOpen: () => isOpen,
    isInitialized: () => isInitialized,
    destroy: () => {
      // Remove widget completely from DOM
      const existingWidget = document.getElementById('iheard-ai-widget');
      if (existingWidget) {
        existingWidget.remove();
      }
      const existingCSS = document.getElementById('iheard-widget-css');
      if (existingCSS) {
        existingCSS.remove();
      }
      isInitialized = false;
      isOpen = false;
      console.log('🗑️ Widget destroyed');
    }
  };

})(); 