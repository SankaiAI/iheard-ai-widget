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
    
    // Widget appearance - Updated to match Shopify widget's modern design
    position: 'bottom-right',
    buttonText: 'Ask AI Assistant',
    chatTitle: 'AI Sales Assistant',
    inputPlaceholder: 'Ask me anything about our products...',
    primaryColor: '#ee5cee',
    gradientEnabled: false,
    gradientColor1: '#ee5cee',
    gradientColor2: '#31d1d1',
    gradientDirection: 'to right',
    glassEffect: true,
    widgetStyle: 'eye-animation',
    showButtonText: true,
    chatBackgroundColor: 'transparent',
    useDefaultAppearance: true,
    
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
    
    // Poll every 2 seconds for development (adjust for production)
    configPollingInterval = setInterval(() => {
      if (currentAgentId) {
        console.log('🔄 Polling for configuration updates...');
        fetchConfiguration(currentAgentId, true); // true = silent update
      }
    }, 2000); // 2 seconds
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
      const response = await fetch(`https://iheard-ai-widget.pages.dev/api/config?agentId=${identifier}`, {
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
            
            // Check if appearance-related settings changed
            const appearanceChanged = 
              widgetConfig.useDefaultAppearance !== (config.useDefaultAppearance ?? widgetConfig.useDefaultAppearance) ||
              widgetConfig.chatBackgroundColor !== (config.chatBackgroundColor || widgetConfig.chatBackgroundColor) ||
              widgetConfig.glassEffect !== (config.glassEffect ?? widgetConfig.glassEffect);
            
            if (appearanceChanged) {
              console.log('🎨 Appearance settings changed, reinitializing widget...');
              // Remove existing widget and reinitialize
              const existingWidget = document.getElementById('iheard-ai-widget');
              if (existingWidget) {
                existingWidget.remove();
              }
              isInitialized = false;
              initializeWidget();
            } else {
              updateWidgetFromConfig();
            }
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
      /* iHeardAI Widget Styles - Modern Design inspired by screenshot */
      .iheard-widget-container {
        position: fixed;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      }

      /* Position variants */
      .iheard-widget-container.position-bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .iheard-widget-container.position-bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .iheard-widget-container.position-top-right {
        top: 20px;
        right: 20px;
      }

      .iheard-widget-container.position-top-left {
        top: 20px;
        left: 20px;
      }

      .iheard-widget-container.position-center-right {
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
      }

      .iheard-widget-container.position-center-left {
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
      }

      .iheard-widget-button {
        background: var(--primary-color, #ee5cee);
        border: none;
        border-radius: 50px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        outline: none;
        user-select: none;
      }

      .iheard-widget-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .iheard-widget-button .button-text {
        white-space: nowrap;
      }

      @media (max-width: 480px) {
        .iheard-widget-button .button-text {
          display: none !important;
        }
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
        bottom: 70px;
        right: 0;
        width: 420px;
        height: 600px;
        border-radius: 25px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: none;
        overflow: hidden;
        max-height: 600px;
        min-height: 600px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
        background: #ffffff;
      }

      /* Override fixed height constraints on mobile */
      @media (max-width: 480px) {
        .iheard-chat-interface {
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          max-height: none !important;
          min-height: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }

      /* Default appearance styles */
      .iheard-chat-interface.default-appearance {
        background: rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(20px);
      }

      .iheard-chat-interface.iheard-chat-open {
        display: grid !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      /* Position adjustments for chat interface */
      .iheard-widget-container.position-bottom-left .iheard-chat-interface,
      .iheard-widget-container.position-top-left .iheard-chat-interface,
      .iheard-widget-container.position-center-left .iheard-chat-interface {
        right: auto;
        left: 0;
      }

      .iheard-widget-container.position-top-right .iheard-chat-interface,
      .iheard-widget-container.position-top-left .iheard-chat-interface {
        bottom: auto;
        top: 70px;
      }

      .iheard-widget-container.position-center-right .iheard-chat-interface,
      .iheard-widget-container.position-center-left .iheard-chat-interface {
        bottom: auto;
        top: 50%;
        transform: translateY(-50%);
      }

      .iheard-chat-content-container {
        width: 100%;
        height: 100%;
        border-radius: 25px;
        display: grid;
        grid-template-rows: 70px 1fr auto;
        grid-template-areas: 
          "header"
          "messages"
          "input";
        overflow: hidden;
        background: #ffffff;
      }

      /* Default appearance styles */
      .iheard-chat-content-container.default-appearance {
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(20px);
      }

      .iheard-chat-header {
        background: #ffffff;
        border: none;
        color: white;
        padding: 0;
        z-index: 10;
        height: 70px;
        box-sizing: border-box;
        grid-area: header !important;
        border-radius: 25px 25px 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: visible;
      }

      /* Default appearance styles */
      .iheard-chat-header.default-appearance {
        background: rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
      }

      .iheard-chat-header-rect {
        background: rgba(0, 0, 0, 0.6) !important;
        border-radius: 25px;
        padding: 10px 38px;
        margin: 15px 10px 10px 10px;
        width: calc(100% - 20px);
        height: auto;
        max-width: 420px;
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        position: relative;
        overflow: visible;
        min-height: 50px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .iheard-chat-header-rect:hover {
        background: rgba(0, 0, 0, 0.9) !important;
      }

      .iheard-chat-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        flex: 1;
        padding: 0;
      }

      .iheard-chat-title-group {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: -15px;
      }

      .iheard-chat-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .iheard-chat-avatar img {
        transition: transform 0.2s ease;
      }

      .iheard-chat-avatar img:hover {
        transform: scale(1.05);
      }

      .iheard-chat-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: white;
      }

      .iheard-chat-header-buttons {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .iheard-call-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-right: -15px;
      }

      .iheard-call-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: white;
      }

      .iheard-status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: relative;
      }

      .iheard-status-indicator.connecting {
        background: orange;
        animation: pulse 2s infinite;
      }

      .iheard-status-indicator.connected {
        background: #4CAF50;
      }

      .iheard-status-indicator.failed {
        background: #f44336;
      }

      @keyframes pulse {
        0% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.7);
        }
        
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 10px rgba(255, 165, 0, 0);
        }
        
        100% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(255, 165, 0, 0);
        }
      }

      .iheard-status-text {
        font-weight: 500;
        white-space: nowrap;
      }

      .iheard-call-btn {
        background: rgba(74, 144, 226, 0.9);
        border: none;
        color: white;
        cursor: pointer;
        padding: 9px 16px;
        border-radius: 22px;
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .iheard-call-btn:hover {
        background: rgba(74, 144, 226, 1);
        transform: translateY(-1px);
      }

      .iheard-call-btn svg {
        width: 14px;
        height: 14px;
      }

      .iheard-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .iheard-close-btn svg {
        width: 16px;
        height: 16px;
      }

      .iheard-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .iheard-chat-messages-container {
        grid-area: messages !important;
        overflow: hidden;
        background: transparent;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        position: relative;
        z-index: 2;
      }

      .iheard-chat-messages {
        padding: 0 15px 20px 15px;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        gap: 0 !important;
        scroll-behavior: smooth;
        height: 100% !important;
        box-sizing: border-box !important;
        background: #ffffff;
      }

      /* Default appearance styles */
      .iheard-chat-messages.default-appearance {
        background: rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
      }

      .iheard-chat-messages.welcome-active {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        height: 100% !important;
        min-height: 0 !important;
        padding-top: 0 !important;
      }

      /* Custom scrollbar styling */
      .iheard-chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .iheard-chat-messages::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
      }

      .iheard-chat-messages::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      .iheard-chat-messages::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      /* Default appearance scrollbar styling */
      .iheard-chat-messages.default-appearance::-webkit-scrollbar-track {
        background: transparent;
      }

      .iheard-chat-messages.default-appearance::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.4);
      }

      .iheard-chat-messages.default-appearance::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.6);
      }

      .iheard-chat-messages {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
      }

      .iheard-chat-messages.default-appearance {
        scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
      }
      }

      .iheard-message {
        max-width: 85% !important;
        width: fit-content;
        overflow: visible !important;
        display: block !important;
        box-sizing: border-box !important;
        margin-bottom: 16px !important;
        margin-top: 0 !important;
        padding: 12px 16px;
        border-radius: 20px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        hyphens: auto;
        max-width: 100% !important;
        white-space: normal !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        position: relative;
        backdrop-filter: blur(10px);
        box-sizing: border-box !important;
        overflow: visible !important;
        animation: messageSlideIn 0.3s ease-out;
      }

      .iheard-message:last-child {
        margin-bottom: 8px !important;
      }

      .iheard-message.user-message {
        align-self: flex-end;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px !important;
      }

      .iheard-message.assistant-message {
        align-self: flex-start;
        display: flex;
        justify-content: flex-start;
        margin-bottom: 12px !important;
      }

      .iheard-message.user-message .message-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 8px;
        margin-left: auto;
        margin-right: 8px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        position: relative;
      }

      .iheard-message.user-message .message-content::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: -8px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-left: 8px solid #764ba2;
        border-bottom: 0;
        border-right: 0;
      }

      .iheard-message.assistant-message .message-content {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        color: #2c3e50;
        border-bottom-left-radius: 8px;
        margin-left: 8px;
        margin-right: auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        position: relative;
      }

      .iheard-message.assistant-message .message-content::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -8px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-right: 8px solid #c3cfe2;
        border-bottom: 0;
        border-left: 0;
      }

      .iheard-message.user-message .message-content.dark-mode {
        background: linear-gradient(135deg, #4a90e2 0%, #6c5ce7 100%);
        box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
      }

      .iheard-message.assistant-message .message-content.dark-mode {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .iheard-message.assistant-message .message-content.dark-mode::after {
        border-right-color: rgba(255, 255, 255, 0.08);
      }

      .iheard-message .message-content:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }

      .iheard-message.user-message .message-content:hover {
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
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
        padding: 12px 16px;
        border-radius: 20px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        color: #2c3e50;
        border-bottom-left-radius: 8px;
        margin-left: 8px;
        margin-right: auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        position: relative;
        animation: messageSlideIn 0.3s ease-out;
        max-width: 85% !important;
        width: fit-content;
        align-self: flex-start;
        display: block !important;
        box-sizing: border-box !important;
        margin-bottom: 16px !important;
        margin-top: 0 !important;
      }

      .iheard-typing-indicator.dark-mode {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .iheard-typing-indicator::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -8px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-right: 8px solid #c3cfe2;
        border-bottom: 0;
        border-left: 0;
      }

      .iheard-typing-indicator.dark-mode::after {
        border-right-color: rgba(255, 255, 255, 0.08);
      }

      .iheard-loading-dots {
        display: inline-flex;
        gap: 4px;
      }

      .iheard-loading-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--primary-color, #ee5cee);
        animation: loading-bounce 1.4s ease-in-out infinite both;
      }

      .iheard-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .iheard-loading-dots span:nth-child(2) { animation-delay: -0.16s; }

      @keyframes loading-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      .iheard-chat-input-container {
        grid-area: input !important;
        padding: 15px 15px 8px 15px;
        border-radius: 0 0 25px 25px;
        background: #ffffff;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      /* Default appearance styles */
      .iheard-chat-input-container.default-appearance {
        background: rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
      }

      .iheard-powered-by {
        text-align: center;
        font-size: 9px;
        color: rgba(0, 0, 0, 0.6);
        padding: 0;
        margin-top: 2px;
        font-weight: 400;
        background: transparent;
        border: none;
        line-height: 1;
      }

      .iheard-powered-by.default-appearance {
        color: rgba(255, 255, 255, 0.6);
        background: transparent;
      }

      .iheard-chat-input {
        border-top: none;
        position: relative;
        display: flex;
        align-items: center;
        z-index: 5;
        height: 50px !important;
        box-sizing: border-box !important;
        border-radius: 25px;
        padding: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(5px);
        overflow: hidden;
      }

      .iheard-chat-input.default-appearance {
        background: rgba(255, 255, 255, 0.1);
      }

      .iheard-input {
        flex: 1;
        padding: 6px 55px 6px 20px;
        border: none;
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        transition: all 0.2s;
        background: transparent;
        color: #333;
        z-index: 1;
        height: 36px;
        box-sizing: border-box;
      }

      .iheard-input.default-appearance {
        background: transparent;
        color: white;
      }

      .iheard-input.default-appearance::placeholder {
        color: rgba(255, 255, 255, 0.7);
      }

      .iheard-chat-input:hover {
        background: rgba(0, 0, 0, 0.3);
        transition: background 0.2s ease;
      }

      .iheard-chat-input.default-appearance:hover {
        background: rgba(0, 0, 0, 0.3);
      }

      .iheard-chat-input:focus-within {
        background: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 0 3px rgba(238, 92, 238, 0.1);
      }

      .iheard-chat-input.default-appearance:focus-within {
        background: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
      }

      .iheard-send-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        padding: 6px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        color: rgba(74, 144, 226, 0.9);
        transition: all 0.2s;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        width: 32px;
        height: 32px;
        z-index: 10;
        line-height: 1;
      }

      .iheard-send-btn:hover {
        transform: translateY(-50%) scale(1.05);
        background: rgba(255, 255, 255, 0.2);
        color: rgba(74, 144, 226, 1);
      }

      .iheard-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .iheard-send-btn svg {
        width: 16px;
        height: 16px;
        display: block;
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



      /* Welcome message styles */
      .iheard-welcome-message {
        max-width: 100% !important;
        width: 100% !important;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 !important;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      }

      .iheard-welcome-content {
        background: transparent;
        color: white;
        border: none;
        box-shadow: none;
        padding: 0;
        text-align: center;
        max-width: 90%;
      }

      .iheard-welcome-text {
        font-size: 16px;
        line-height: 1.5;
        margin: 0;
        opacity: 1;
        color: white;
        white-space: pre-wrap;
      }

      .iheard-welcome-text.typing {
        border-right: 2px solid white;
        animation: blink 1s infinite;
      }

      .iheard-welcome-message.fade-out {
        animation: fadeOutUp 0.8s ease-out forwards;
      }

      @keyframes blink {
        0%, 50% { border-color: transparent; }
        51%, 100% { border-color: white; }
      }

      @keyframes fadeOutUp {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -80%);
        }
      }

      /* Mobile responsiveness */
      @media (max-width: 480px) {
        body.chat-open {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Widget container - keep fixed but don't constrain children */
        .iheard-widget-container {
          position: fixed !important;
          z-index: 999999 !important;
          pointer-events: none !important;
        }
        
        /* Widget button positioning - restore pointer events */
        .iheard-widget-button {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          z-index: 999998 !important;
          pointer-events: auto !important;
        }
        
        /* Chat interface full screen */
        .iheard-chat-interface {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 999999 !important;
          display: block !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Keep the same background as desktop */
        .iheard-chat-interface {
          background: rgba(0, 0, 0, 0.1) !important;
          backdrop-filter: blur(20px) !important;
        }
        
        .iheard-chat-interface.default-appearance {
          background: rgba(0, 0, 0, 0.1) !important;
          backdrop-filter: blur(20px) !important;
        }
        
        .iheard-chat-content-container {
          position: absolute !important;
          top: 10px !important;
          left: 10px !important;
          right: 10px !important;
          bottom: 0 !important;
          border-radius: 25px 25px 0 0 !important;
          display: grid !important;
          grid-template-rows: auto 1fr auto !important;
          grid-template-areas: 
            "header"
            "messages"
            "input" !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          background: rgba(0, 0, 0, 0.1) !important;
          backdrop-filter: blur(20px) !important;
        }
        
        .iheard-chat-content-container.default-appearance {
          background: rgba(0, 0, 0, 0.1) !important;
          backdrop-filter: blur(20px) !important;
        }
        
        .iheard-chat-header {
          border-radius: 25px 25px 0 0 !important;
          height: auto !important;
          min-height: 70px !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          margin: 0 !important;
          grid-area: header !important;
          background: rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .iheard-chat-header.default-appearance {
          background: rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .iheard-chat-header-rect {
          margin: 15px 10px 10px 10px !important;
          width: calc(100% - 20px) !important;
          height: 50px !important;
          min-height: 50px !important;
        }
        
        .iheard-chat-messages-container {
          grid-area: messages !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 0 !important;
          height: 100% !important;
          width: 100% !important;
        }
        
        .iheard-chat-messages {
          height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 0 15px 20px 15px !important;
          margin: 0 !important;
          background: rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .iheard-chat-messages.default-appearance {
          background: rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .iheard-chat-input-container {
          border-radius: 0 !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
          padding: 15px 15px 25px 15px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 2px !important;
          min-height: 80px !important;
          background: rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(10px) !important;
          grid-area: input !important;
        }
        
        .iheard-chat-input-container.default-appearance {
          background: rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .iheard-chat-input {
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 24px !important;
          padding: 0 !important;
          margin-bottom: 5px !important;
          height: 50px !important;
          transition: all 0.2s ease !important;
        }
        
        .iheard-chat-input.default-appearance {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .iheard-chat-input:hover {
          background: rgba(0, 0, 0, 0.3) !important;
          transition: background 0.2s ease !important;
        }

        .iheard-chat-input.default-appearance:hover {
          background: rgba(0, 0, 0, 0.3) !important;
        }

        .iheard-chat-input:focus-within {
          background: rgba(0, 0, 0, 0.3) !important;
          box-shadow: 0 0 0 3px rgba(238, 92, 238, 0.1) !important;
        }

        .iheard-chat-input.default-appearance:focus-within {
          background: rgba(0, 0, 0, 0.3) !important;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2) !important;
        }
        
        .iheard-input {
          font-size: 16px !important;
          height: 38px !important;
          padding: 6px 55px 6px 20px !important;
        }
        
        .iheard-powered-by {
          font-size: 9px !important;
          margin-top: 2px !important;
          line-height: 1 !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          color: rgba(255, 255, 255, 0.6) !important;
        }
        
        .iheard-powered-by.default-appearance {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        
        .iheard-message .message-content {
          padding: 10px 14px !important;
          border-radius: 18px !important;
        }
        
        .iheard-message.user-message .message-content,
        .iheard-message.assistant-message .message-content {
          max-width: 85% !important;
        }
        
        /* Hide widget button when chat is open on mobile */
        .iheard-widget-container:has(.iheard-chat-interface.iheard-chat-open) .iheard-widget-button {
          display: none !important;
        }
        
        /* Fallback for browsers that don't support :has() */
        .iheard-chat-interface.iheard-chat-open + .iheard-widget-button,
        .iheard-widget-button.chat-open {
          display: none !important;
        }
        
        /* Ensure proper touch scrolling on mobile */
        .iheard-chat-messages {
          -webkit-overflow-scrolling: touch !important;
        }
        
        /* Mobile safe area adjustments */
        @supports (padding: max(0px)) {
          .iheard-chat-input-container {
            padding-bottom: max(env(safe-area-inset-bottom), 25px) !important;
          }
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
              button.style.border = 'none';
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

    // Chat header with pill-shaped container
    const header = document.createElement('div');
    header.className = 'iheard-chat-header';
    
    const headerRect = document.createElement('div');
    headerRect.className = 'iheard-chat-header-rect';
    
    headerRect.innerHTML = `
      <div class="iheard-chat-header-content">
        <div class="iheard-chat-title-group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="cursor: pointer; color: white;">
            <path d="M6 9l6 6 6-6"/>
          </svg>
          <div class="iheard-chat-avatar">
            ${widgetConfig.avatar ? `<img src="${widgetConfig.avatar}" alt="${widgetConfig.agentName}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">` : `<div style="width: 36px; height: 36px; border-radius: 50%; background: white; color: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">${widgetConfig.agentName.charAt(0).toUpperCase()}</div>`}
          </div>
          <h3>${widgetConfig.agentName}</h3>
        </div>
        <div class="iheard-call-section">
          <button class="iheard-call-btn" title="Voice call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Call
          </button>
        </div>
      </div>
    `;
    
    header.appendChild(headerRect);

    // Chat content container for grid layout
    const contentContainer = document.createElement('div');
    contentContainer.className = 'iheard-chat-content-container';

    // Chat messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'iheard-chat-messages-container';

    const messages = document.createElement('div');
    messages.className = 'iheard-chat-messages';

    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'iheard-welcome-message';
    const welcomeContent = document.createElement('div');
    welcomeContent.className = 'iheard-welcome-content';
    const welcomeText = document.createElement('p');
    welcomeText.className = 'iheard-welcome-text';
    welcomeText.textContent = '';
    welcomeContent.appendChild(welcomeText);
    welcomeMessage.appendChild(welcomeContent);
    messages.appendChild(welcomeMessage);

    // Start typing animation after a short delay
    setTimeout(() => {
      typeWelcomeMessage(welcomeText, widgetConfig.welcomeMessage);
    }, 500);

    messagesContainer.appendChild(messages);

    // Chat input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'iheard-chat-input-container';
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'iheard-chat-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'iheard-input';
    input.placeholder = widgetConfig.inputPlaceholder;
    
    const sendBtn = document.createElement('button');
    sendBtn.className = 'iheard-send-btn';
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22,2 15,22 11,13 2,9 22,2"></polygon></svg>';
    sendBtn.title = 'Send message';

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(sendBtn);
    inputContainer.appendChild(inputWrapper);

    // Add "Powered by" text
    const poweredBy = document.createElement('div');
    poweredBy.className = 'iheard-powered-by';
    poweredBy.textContent = 'Powered by iHeard.ai';
    inputContainer.appendChild(poweredBy);

    // Assemble content container
    contentContainer.appendChild(header);
    contentContainer.appendChild(messagesContainer);
    contentContainer.appendChild(inputContainer);

    // Assemble chat interface
    chatInterface.appendChild(contentContainer);

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

    // Apply default configuration settings
    updateWidgetFromConfig();

    isInitialized = true;
    console.log('✅ iHeardAI Widget initialized successfully');
  }

  // Setup event listeners
  function setupEventListeners(widget) {
    const button = widget.querySelector('.iheard-widget-button');
    const headerRect = widget.querySelector('.iheard-chat-header-rect');
    const callBtn = widget.querySelector('.iheard-call-btn');
    const sendBtn = widget.querySelector('.iheard-send-btn');
    const input = widget.querySelector('.iheard-input');
    const chatInterface = widget.querySelector('.iheard-chat-interface');

    // Toggle chat
    button.addEventListener('click', () => {
      if (!widgetConfig.isEnabled) return;
      
      isOpen = !isOpen;
      chatInterface.style.display = isOpen ? 'grid' : 'none';
      chatInterface.classList.toggle('iheard-chat-open', isOpen);
      
      // Handle mobile body scroll prevention and full screen mode
      if (window.innerWidth <= 480) {
        if (isOpen) {
          document.body.classList.add('chat-open');
          button.classList.add('chat-open');
          // Let CSS handle mobile positioning - minimal JS override
          chatInterface.style.position = 'fixed';
          chatInterface.style.top = '0';
          chatInterface.style.left = '0';
          chatInterface.style.right = '0';
          chatInterface.style.bottom = '0';
          chatInterface.style.zIndex = '999999';
        } else {
          document.body.classList.remove('chat-open');
          button.classList.remove('chat-open');
          // Reset chat interface positioning for desktop
          chatInterface.style.position = '';
          chatInterface.style.top = '';
          chatInterface.style.left = '';
          chatInterface.style.right = '';
          chatInterface.style.bottom = '';
          chatInterface.style.width = '';
          chatInterface.style.height = '';
          chatInterface.style.removeProperty('height');
          chatInterface.style.margin = '';
          chatInterface.style.padding = '';
          chatInterface.style.background = '';
          chatInterface.style.backdropFilter = '';
          chatInterface.style.borderRadius = '';
          chatInterface.style.display = '';
          chatInterface.style.overflow = '';
          chatInterface.style.zIndex = '';
        }
      }
      
      if (isOpen) {
        // Small delay to ensure layout is complete before focusing
        setTimeout(() => {
          input.focus();
        }, 100);
      }
    });

    // Close chat when clicking on header pill (except call button)
    headerRect.addEventListener('click', (e) => {
      // Don't close if clicking on the call button
      if (e.target.closest('.iheard-call-btn')) {
        return;
      }
      
      isOpen = false;
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
        chatInterface.style.removeProperty('height');
        chatInterface.style.margin = '';
        chatInterface.style.padding = '';
        chatInterface.style.background = '';
        chatInterface.style.backdropFilter = '';
        chatInterface.style.borderRadius = '';
        chatInterface.style.display = '';
        chatInterface.style.overflow = '';
        chatInterface.style.zIndex = '';
      }
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


  }

  // Add user message
  function addUserMessage(text) {
    const messagesContainer = document.querySelector('.iheard-chat-messages');
    const message = document.createElement('div');
    message.className = 'iheard-message user-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = text;
    
    message.appendChild(messageContent);
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add agent message
  function addAgentMessage(text) {
    const messagesContainer = document.querySelector('.iheard-chat-messages');
    const message = document.createElement('div');
    message.className = 'iheard-message assistant-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = text;
    
    message.appendChild(messageContent);
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const messagesContainer = document.querySelector('.iheard-chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'iheard-typing-indicator';
    indicator.innerHTML = `
      <div class="iheard-loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
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

  // Type welcome message with animation
  function typeWelcomeMessage(element, message) {
    let index = 0;
    element.classList.add('typing');
    
    function typeChar() {
      if (index < message.length) {
        element.textContent += message[index];
        index++;
        setTimeout(typeChar, 50); // 50ms delay between characters
      } else {
        // Typing complete, wait a moment then fade out
        element.classList.remove('typing');
        setTimeout(() => {
          const welcomeMessage = element.closest('.iheard-welcome-message');
          if (welcomeMessage) {
            welcomeMessage.classList.add('fade-out');
            setTimeout(() => {
              welcomeMessage.remove();
            }, 800);
          }
        }, 2000); // Wait 2 seconds after typing completes
      }
    }
    
    typeChar();
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
      // Apply CSS classes based on useDefaultAppearance setting
      if (widgetConfig.useDefaultAppearance) {
        chatInterface.classList.add('default-appearance');
        // Remove any inline background style to let CSS handle the default appearance
        chatInterface.style.removeProperty('background');
      } else {
        chatInterface.classList.remove('default-appearance');
        // Apply the custom background color from the database
        chatInterface.style.background = widgetConfig.chatBackgroundColor;
      }
      
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

      // Apply CSS classes to child elements
      const contentContainer = chatInterface.querySelector('.iheard-chat-content-container');
      const header = chatInterface.querySelector('.iheard-chat-header');
      const messagesContainer = chatInterface.querySelector('.iheard-chat-messages');
      const inputContainer = chatInterface.querySelector('.iheard-chat-input-container');
      const input = chatInterface.querySelector('.iheard-input');
      const poweredBy = chatInterface.querySelector('.iheard-powered-by');
      const welcomeContent = chatInterface.querySelector('.iheard-welcome-content');
      
      if (widgetConfig.useDefaultAppearance) {
        contentContainer?.classList.add('default-appearance');
        header?.classList.add('default-appearance');
        messagesContainer?.classList.add('default-appearance');
        inputContainer?.classList.add('default-appearance');
        input?.classList.add('default-appearance');
        poweredBy?.classList.add('default-appearance');
        welcomeContent?.classList.add('default-appearance');
      } else {
        contentContainer?.classList.remove('default-appearance');
        header?.classList.remove('default-appearance');
        messagesContainer?.classList.remove('default-appearance');
        inputContainer?.classList.remove('default-appearance');
        input?.classList.remove('default-appearance');
        poweredBy?.classList.remove('default-appearance');
        welcomeContent?.classList.remove('default-appearance');
      }
    }

    // Update header
    const header = widget.querySelector('.iheard-chat-header');
    if (header) {
      const agentName = header.querySelector('h3');
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

  // Handle window resize and orientation changes for mobile responsiveness
  window.addEventListener('resize', () => {
    if (isInitialized && isOpen) {
      const chatInterface = document.querySelector('.iheard-chat-interface');
      if (chatInterface) {
        // Check if we've moved between mobile and desktop
        if (window.innerWidth <= 480) {
          // Ensure mobile full screen mode
          document.body.classList.add('chat-open');
          const button = document.querySelector('.iheard-widget-button');
          if (button) button.classList.add('chat-open');
          chatInterface.style.position = 'fixed';
          chatInterface.style.top = '0';
          chatInterface.style.left = '0';
          chatInterface.style.right = '0';
          chatInterface.style.bottom = '0';
          chatInterface.style.zIndex = '999999';
        } else {
          // Reset to desktop mode
          document.body.classList.remove('chat-open');
          const button = document.querySelector('.iheard-widget-button');
          if (button) button.classList.remove('chat-open');
          chatInterface.style.position = '';
          chatInterface.style.top = '';
          chatInterface.style.left = '';
          chatInterface.style.right = '';
          chatInterface.style.bottom = '';
          chatInterface.style.width = '';
          chatInterface.style.height = '';
          chatInterface.style.removeProperty('height');
          chatInterface.style.margin = '';
          chatInterface.style.padding = '';
          chatInterface.style.background = '';
          chatInterface.style.backdropFilter = '';
          chatInterface.style.borderRadius = '';
          chatInterface.style.display = '';
          chatInterface.style.overflow = '';
          chatInterface.style.zIndex = '';
        }
      }
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
          chatInterface.style.display = 'grid'; // Changed to grid for modern design
          chatInterface.classList.add('iheard-chat-open');
          
          // Handle mobile full screen mode
          if (window.innerWidth <= 480) {
            document.body.classList.add('chat-open');
            const button = document.querySelector('.iheard-widget-button');
            if (button) button.classList.add('chat-open');
            chatInterface.style.position = 'fixed';
            chatInterface.style.top = '0';
            chatInterface.style.left = '0';
            chatInterface.style.right = '0';
            chatInterface.style.bottom = '0';
            chatInterface.style.zIndex = '999999';
          }
        }
      }
    },
    close: () => {
      if (isInitialized) {
        isOpen = false;
        const chatInterface = document.querySelector('.iheard-chat-interface');
        if (chatInterface) {
          chatInterface.style.display = 'none';
          chatInterface.classList.remove('iheard-chat-open');
          
          // Handle mobile reset
          if (window.innerWidth <= 480) {
            document.body.classList.remove('chat-open');
            const button = document.querySelector('.iheard-widget-button');
            if (button) button.classList.remove('chat-open');
            chatInterface.style.position = '';
            chatInterface.style.top = '';
            chatInterface.style.left = '';
            chatInterface.style.right = '';
            chatInterface.style.bottom = '';
            chatInterface.style.width = '';
            chatInterface.style.height = '';
            chatInterface.style.removeProperty('height');
            chatInterface.style.margin = '';
            chatInterface.style.padding = '';
            chatInterface.style.background = '';
            chatInterface.style.backdropFilter = '';
            chatInterface.style.borderRadius = '';
            chatInterface.style.display = '';
            chatInterface.style.overflow = '';
            chatInterface.style.zIndex = '';
          }
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