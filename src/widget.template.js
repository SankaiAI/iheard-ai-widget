// iHeardAI Voice Agent Widget Template
// Version: 1.0.0
// CDN: https://iheard-ai-widget.pages.dev/widget.js

(function() {
  'use strict';

  console.log('🚀 iHeardAI Voice Agent Widget Loading...');

  // Supabase configuration - will be replaced by build script
  const SUPABASE_URL = 'SUPABASE_URL_PLACEHOLDER';
  const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY_PLACEHOLDER';

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
    const scripts = document.querySelectorAll('script[src*="widget.js"]');
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

  // Fetch configuration directly from Supabase
  async function fetchConfiguration(identifier, silent = false) {
    try {
      if (!silent) {
        console.log('🔍 Fetching configuration from Supabase for agent ID:', identifier);
      }
      
      // Query Supabase directly using REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/VoiceAgentConfig?id=eq.${identifier}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      if (!silent) {
        console.log('📡 Supabase Response status:', response.status);
        console.log('📡 Supabase Response ok:', response.ok);
      }
      
      if (response.ok) {
        const data = await response.json();
        
        if (!silent) {
          console.log('📦 Supabase Response data:', data);
        }
        
        // Check if we got data and agent is active/enabled
        if (data && data.length > 0) {
          const config = data[0];
          
          // Check if agent is active and enabled
          if (!config.isActive || !config.isEnabled) {
            if (!silent) {
              console.warn('⚠️ Agent is not active or enabled:', { isActive: config.isActive, isEnabled: config.isEnabled });
            }
            return;
          }
          
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
            gradientColor2: normalizeColor(config.gradientColor2 || config.gradientColor2),
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

  // ... rest of the widget code (same as widget.js)
  // (This is a template, so we don't need the full implementation here)
})(); 