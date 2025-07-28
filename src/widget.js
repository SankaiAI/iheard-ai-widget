// iHeardAI Voice Agent Widget
// Version: 1.0.0
// CDN: https://cdn.iheard.ai/widget.js

(function() {
  'use strict';

  console.log('🚀 iHeardAI Voice Agent Widget Loading...');

  // Widget configuration - no hardcoded credentials needed
  // Credentials are handled securely by Cloudflare Pages Functions

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
    chatBackgroundColor: '#ffffff',
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
  let currentAgentId = null;
  let configPollingInterval = null;

  // Get configuration from URL parameters or data attributes
  function getInitialConfig() {
    // Try to get parameters from the script tag that loaded this widget
    let apiKey = null;
    let agentId = null;
    
    // Find the script tag that loaded this widget
    const scripts = document.querySelectorAll('script[src*="widget"]');
    for (const script of scripts) {
      const scriptUrl = new URL(script.src, window.location.origin);
      if (!apiKey) apiKey = scriptUrl.searchParams.get('apiKey');
      if (!agentId) agentId = scriptUrl.searchParams.get('agentId');
    }
    
    // Fallback to page URL parameters if not found in script
    if (!apiKey || !agentId) {
      const urlParams = new URLSearchParams(window.location.search);
      if (!apiKey) apiKey = urlParams.get('apiKey');
      if (!agentId) agentId = urlParams.get('agentId');
    }
    
    console.log('🔍 getInitialConfig called');
    console.log('🔍 Script tags found:', scripts.length);
    console.log('🔍 URL params:', { apiKey, agentId });
    console.log('🔍 Current URL:', window.location.href);
    
    // Store agent ID for polling
    currentAgentId = agentId;
    console.log('🔍 Stored currentAgentId:', currentAgentId);
    
    // If we have an API key, fetch configuration from API
    if (apiKey || agentId) {
      console.log('🔍 Calling fetchConfiguration with:', apiKey || agentId);
      fetchConfiguration(apiKey || agentId);
      // Start polling for configuration updates
      startConfigPolling();
    } else {
      console.log('🔍 No API key or agent ID, using default configuration');
      // Use default configuration
      initializeWidget();
    }
  }

  // Start polling for configuration updates
  function startConfigPolling() {
    if (!currentAgentId) return;
    
    // Clear existing interval
    if (configPollingInterval) {
      clearInterval(configPollingInterval);
    }
    
    // Poll every 5 seconds for development (adjust for production)
    configPollingInterval = setInterval(() => {
      if (currentAgentId) {
        console.log('🔄 Polling for configuration updates...');
        fetchConfiguration(currentAgentId, true); // true = silent update
      }
    }, 5000); // 5 seconds
  }

  // Stop polling
  function stopConfigPolling() {
    if (configPollingInterval) {
      clearInterval(configPollingInterval);
      configPollingInterval = null;
    }
  }

  // Fetch configuration from secure Cloudflare Pages API
  async function fetchConfiguration(identifier, silent = false) {
    try {
      if (!silent) {
        console.log('🔍 Fetching configuration from secure API for agent ID:', identifier);
      }
      
      // Query our secure Cloudflare Pages API endpoint
      const response = await fetch(`/api/config?agentId=${identifier}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!silent) {
        console.log('📡 Supabase Response status:', response.status);
        console.log('📡 Supabase Response ok:', response.ok);
      }
      
      if (response.ok) {
        const data = await response.json();
        
        if (!silent) {
          console.log('📦 API Response data:', data);
        }
        
        // Check if we got data
        if (data && data.config) {
          const config = data.config;
          
          // Map Supabase VoiceAgentConfig fields to widget config
          widgetConfig = {
            ...widgetConfig,
            // Agent settings from Supabase
            agentName: config.agentName || widgetConfig.agentName,
            avatar: config.avatarUrl || widgetConfig.avatar,
            personality: config.personality || widgetConfig.personality,
            welcomeMessage: config.welcomeMessage || widgetConfig.welcomeMessage,
            voiceType: config.voiceType || widgetConfig.voiceType,
            language: config.language || widgetConfig.language,
            responseStyle: config.responseStyle || widgetConfig.responseStyle,
            voiceEnabled: config.voiceEnabled ?? widgetConfig.voiceEnabled,
            chatEnabled: config.chatEnabled ?? widgetConfig.chatEnabled,
            
            // Widget appearance from Supabase
            position: config.position || widgetConfig.position,
            buttonText: config.buttonText || widgetConfig.buttonText,
            chatTitle: config.chatTitle || widgetConfig.chatTitle,
            inputPlaceholder: config.inputPlaceholder || widgetConfig.inputPlaceholder,
            primaryColor: normalizeColor(config.primaryColor || widgetConfig.primaryColor),
            gradientEnabled: config.gradientEnabled ?? widgetConfig.gradientEnabled,
            gradientColor1: normalizeColor(config.gradientColor1 || widgetConfig.gradientColor1),
            gradientColor2: normalizeColor(config.gradientColor2 || widgetConfig.gradientColor2),
            gradientDirection: config.gradientDirection || widgetConfig.gradientDirection,
            glassEffect: config.glassEffect ?? widgetConfig.glassEffect,
            widgetStyle: config.widgetStyle || widgetConfig.widgetStyle,
            showButtonText: config.showButtonText ?? widgetConfig.showButtonText,
            chatBackgroundColor: normalizeColor(config.chatBackgroundColor || widgetConfig.chatBackgroundColor),
            useDefaultAppearance: config.useDefaultAppearance ?? widgetConfig.useDefaultAppearance,
            
            // Widget state from Supabase
            isActive: config.isActive ?? widgetConfig.isActive,
            isEnabled: config.isEnabled ?? widgetConfig.isEnabled
          };
          
          if (!silent) {
            console.log('✅ Widget configuration loaded from Supabase:', widgetConfig);
            console.log('📍 Position from Supabase:', widgetConfig.position);
          } else {
            console.log('🔄 Configuration updated from Supabase');
            console.log('📍 Position from Supabase:', widgetConfig.position);
          }
          
          // Update widget if already initialized
          if (isInitialized) {
            console.log('🎨 Updating widget appearance...');
            updateWidgetFromConfig();
          }
        } else {
          if (!silent) {
            console.warn('⚠️ No configuration found for agent ID:', identifier);
            console.log('Using default configuration');
          }
        }
      } else {
        if (!silent) {
          console.warn('⚠️ Failed to load configuration from Supabase, status:', response.status);
          console.warn('⚠️ Response text:', await response.text());
          console.log('Using default configuration');
        }
      }
    } catch (error) {
      if (!silent) {
        console.warn('⚠️ Error loading configuration from Supabase:', error);
        console.log('Using default configuration');
      }
    } finally {
      if (!isInitialized) {
        initializeWidget();
      }
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
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.1);
        display: none;
        flex-direction: column;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: widgetSlideIn 0.3s ease-out;
      }

      @keyframes widgetSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .iheard-chat-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        position: relative;
      }

      .iheard-chat-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        pointer-events: none;
      }

      .iheard-chat-header .agent-info {
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        z-index: 1;
      }

      .iheard-chat-header .agent-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: #333;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 2px solid rgba(255,255,255,0.2);
      }

      .iheard-chat-header .agent-name {
        font-weight: 600;
        font-size: 16px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      .iheard-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        font-size: 20px;
        line-height: 1;
        transition: all 0.2s;
        position: relative;
        z-index: 1;
      }

      .iheard-close-btn:hover {
        background: rgba(255,255,255,0.1);
        transform: scale(1.1);
      }

      .iheard-call-btn {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        position: relative;
        z-index: 1;
      }

      .iheard-call-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }

      .iheard-call-btn svg {
        width: 14px;
        height: 14px;
      }

      .iheard-chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: #6b7280;
        position: relative;
      }

      .iheard-chat-messages::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(107, 114, 128, 0.9) 0%, rgba(75, 85, 99, 0.9) 100%);
        pointer-events: none;
      }

      .iheard-message {
        padding: 16px;
        border-radius: 16px;
        max-width: 85%;
        word-wrap: break-word;
        position: relative;
        z-index: 1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .iheard-agent-message {
        background: white;
        border: 1px solid rgba(255,255,255,0.2);
        align-self: flex-start;
        animation: messageSlideIn 0.3s ease-out;
      }

      .iheard-user-message {
        background: var(--primary-color, #ee5cee);
        color: white;
        align-self: flex-end;
        margin-left: auto;
        animation: messageSlideIn 0.3s ease-out;
      }

      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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
        padding: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex;
        gap: 12px;
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(10px);
        position: relative;
        z-index: 1;
      }

      .iheard-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid rgba(209, 213, 219, 0.5);
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        transition: all 0.2s;
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(5px);
      }

      .iheard-input:focus {
        border-color: var(--primary-color, #ee5cee);
        box-shadow: 0 0 0 3px rgba(238, 92, 238, 0.1);
        background: white;
      }

      .iheard-send-btn {
        padding: 12px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        color: white;
        transition: all 0.2s;
        background: var(--primary-color, #ee5cee);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(238, 92, 238, 0.3);
        min-width: 44px;
        height: 44px;
      }

      .iheard-send-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(238, 92, 238, 0.4);
      }

      .iheard-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .iheard-send-btn svg {
        width: 18px;
        height: 18px;
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

      .iheard-powered-by {
        text-align: center;
        padding: 12px 20px;
        color: white;
        font-size: 12px;
        font-weight: 500;
        background: rgba(0,0,0,0.1);
        border-top: 1px solid rgba(255,255,255,0.1);
        position: relative;
        z-index: 1;
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
        <span class="agent-name">${widgetConfig.agentName}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; position: relative; z-index: 1;">
        <button class="iheard-call-btn" title="Voice call">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Call
        </button>
        <button class="iheard-close-btn" title="Close chat">×</button>
      </div>
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
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22,2 15,22 11,13 2,9 22,2"></polygon></svg>';
    sendBtn.title = 'Send message';
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

    // Powered by footer
    const poweredBy = document.createElement('div');
    poweredBy.className = 'iheard-powered-by';
    poweredBy.textContent = 'Powered by iHeard.ai';

    // Assemble chat interface
    chatInterface.appendChild(header);
    chatInterface.appendChild(messagesContainer);
    chatInterface.appendChild(inputContainer);
    chatInterface.appendChild(poweredBy);

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

  // Helper function to convert color names to hex
  function normalizeColor(color) {
    if (!color) return '#ffffff';
    
    // If it's already a hex color, return as is
    if (color.startsWith('#')) return color;
    
    // Convert common color names to hex
    const colorMap = {
      'white': '#ffffff',
      'black': '#000000',
      'red': '#ff0000',
      'green': '#00ff00',
      'blue': '#0000ff',
      'yellow': '#ffff00',
      'cyan': '#00ffff',
      'magenta': '#ff00ff',
      'gray': '#808080',
      'grey': '#808080',
      'orange': '#ffa500',
      'purple': '#800080',
      'pink': '#ffc0cb',
      'brown': '#a52a2a',
      'lime': '#00ff00',
      'navy': '#000080',
      'teal': '#008080',
      'silver': '#c0c0c0',
      'gold': '#ffd700'
    };
    
    return colorMap[color.toLowerCase()] || '#ffffff';
  }

  // Update widget appearance from current config
  function updateWidgetFromConfig() {
    const widget = document.getElementById('iheard-ai-widget');
    if (!widget) {
      console.error('❌ Widget element not found!');
      return;
    }
    
    console.log('🎯 Found widget element:', widget);
    console.log('🎯 Current widget styles:', {
      position: widget.style.position,
      bottom: widget.style.bottom,
      top: widget.style.top,
      left: widget.style.left,
      right: widget.style.right
    });

    // Update main widget container position
    console.log('🎯 Updating widget position to:', widgetConfig.position);
    
    if (widgetConfig.position.includes('bottom')) {
      widget.style.setProperty('bottom', '20px', 'important');
      widget.style.setProperty('top', 'auto', 'important');
      console.log('📍 Set bottom: 20px, top: auto (with !important)');
    } else {
      widget.style.setProperty('top', '20px', 'important');
      widget.style.setProperty('bottom', 'auto', 'important');
      console.log('📍 Set top: 20px, bottom: auto (with !important)');
    }
    
    if (widgetConfig.position.includes('right')) {
      widget.style.setProperty('right', '20px', 'important');
      widget.style.setProperty('left', 'auto', 'important');
      console.log('📍 Set right: 20px, left: auto (with !important)');
    } else {
      widget.style.setProperty('left', '20px', 'important');
      widget.style.setProperty('right', 'auto', 'important');
      console.log('📍 Set left: 20px, right: auto (with !important)');
    }
    
    // Log the final styles after setting them
    console.log('🎯 Final widget styles:', {
      position: widget.style.position,
      bottom: widget.style.bottom,
      top: widget.style.top,
      left: widget.style.left,
      right: widget.style.right
    });

    // Update button
    const button = widget.querySelector('.iheard-widget-button');
    if (button) {
      if (widgetConfig.gradientEnabled) {
        button.style.background = `linear-gradient(${widgetConfig.gradientDirection}, ${widgetConfig.gradientColor1}, ${widgetConfig.gradientColor2})`;
      } else {
        button.style.background = widgetConfig.primaryColor;
      }
      
      if (widgetConfig.showButtonText) {
        const textSpan = button.querySelector('span');
        if (textSpan) {
          textSpan.textContent = widgetConfig.buttonText;
        }
      }
    }

    // Update chat interface
    const chatInterface = widget.querySelector('.iheard-chat-interface');
    if (chatInterface) {
      chatInterface.style.background = widgetConfig.chatBackgroundColor;
      
      // Update position
      if (widgetConfig.position.includes('bottom')) {
        chatInterface.style.bottom = '70px';
        chatInterface.style.top = 'auto';
      } else {
        chatInterface.style.top = '70px';
        chatInterface.style.bottom = 'auto';
      }
      
      if (widgetConfig.position.includes('right')) {
        chatInterface.style.right = '0';
        chatInterface.style.left = 'auto';
      } else {
        chatInterface.style.left = '0';
        chatInterface.style.right = 'auto';
      }
    }

    // Update header
    const header = widget.querySelector('.iheard-chat-header');
    if (header) {
      header.style.background = widgetConfig.primaryColor;
      
      const agentName = header.querySelector('.agent-name');
      if (agentName) {
        agentName.textContent = widgetConfig.agentName;
      }
    }

    // Update input placeholder
    const input = widget.querySelector('.iheard-input');
    if (input) {
      input.placeholder = widgetConfig.inputPlaceholder;
    }

    console.log('🎨 Widget appearance updated from configuration');
  }

  // Update configuration
  function updateConfig(newConfig) {
    const oldConfig = { ...widgetConfig };
    
    // Normalize color values
    if (newConfig.chatBackgroundColor) {
      newConfig.chatBackgroundColor = normalizeColor(newConfig.chatBackgroundColor);
    }
    if (newConfig.primaryColor) {
      newConfig.primaryColor = normalizeColor(newConfig.primaryColor);
    }
    if (newConfig.gradientColor1) {
      newConfig.gradientColor1 = normalizeColor(newConfig.gradientColor1);
    }
    if (newConfig.gradientColor2) {
      newConfig.gradientColor2 = normalizeColor(newConfig.gradientColor2);
    }
    
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
    refreshConfig: () => {
      if (currentAgentId) {
        console.log('🔄 Manual config refresh triggered');
        fetchConfiguration(currentAgentId, false);
      } else {
        console.warn('⚠️ No agent ID available for refresh');
      }
    },
    destroy: () => {
      // Stop polling
      stopConfigPolling();
      
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
      currentAgentId = null;
      console.log('🗑️ Widget destroyed');
    }
  };

})(); 