// iHeardAI Voice Agent Widget - Modular Version
// Version: 2.0.0
// Uses modular architecture for better maintainability

(function() {
  'use strict';

  console.log('🚀 iHeardAI Voice Agent Widget (Modular) Loading...');

  // Import all modules
  let modulesLoaded = false;
  let modulePromises = [];

  // Function to dynamically import ES6 modules
  async function loadModules() {
    try {
      // Get the base URL from the current script
      const currentScript = document.currentScript || 
        document.querySelector('script[src*="widget.min.js"]') ||
        document.querySelector('script[src*="widget.js"]') ||
        Array.from(document.scripts).find(s => s.src.includes('widget.min.js')) ||
        Array.from(document.scripts).find(s => s.src.includes('widget.js'));
      
      let baseUrl = '';
      if (currentScript && currentScript.src) {
        const scriptUrl = new URL(currentScript.src);
        // Remove query parameters and get clean base URL
        const cleanPath = scriptUrl.pathname.replace('/widget.js', '').replace('/widget.min.js', '');
        baseUrl = scriptUrl.origin + cleanPath;
        console.log('🔧 Widget script detection:', {
          currentScript: currentScript.src,
          origin: scriptUrl.origin,
          pathname: scriptUrl.pathname,
          cleanPath: cleanPath,
          baseUrl: baseUrl
        });
      } else {
        console.error('❌ Could not detect widget script URL');
        // Fallback to hardcoded Cloudflare URL
        baseUrl = 'https://iheard-ai-widget.pages.dev';
        console.log('🔧 Using fallback baseUrl:', baseUrl);
      }
      
      // Load all modules in parallel with absolute URLs
      const [
        stylesModule,
        coreModule,
        voiceModule,
        uiModule,
        apiModule,
        utilsModule
      ] = await Promise.all([
        import(`${baseUrl}/styles/index.js`),
        import(`${baseUrl}/core/index.js`),
        import(`${baseUrl}/voice/index.js`),
        import(`${baseUrl}/ui/index.js`),
        import(`${baseUrl}/api/index.js`),
        import(`${baseUrl}/utils/index.js`)
      ]);

      // Store modules globally for access
      window.iHeardModules = {
        styles: stylesModule,
        core: coreModule,
        voice: voiceModule,
        ui: uiModule,
        api: apiModule,
        utils: utilsModule
      };

      modulesLoaded = true;
      console.log('✅ All iHeardAI modules loaded successfully');
      return window.iHeardModules;

    } catch (error) {
      console.error('❌ Failed to load iHeardAI modules:', error);
      throw new Error('Module loading failed: ' + error.message);
    }
  }

  // Load LiveKit client if not already loaded
  let livekitLoaded = false;
  
  function waitForLiveKit() {
    return new Promise((resolve, reject) => {
      // Check multiple possible global names for LiveKit
      function getLiveKit() {
        return window.LiveKit || window.livekit || window.LiveKitClient || window.livekitClient || window.LivekitClient;
      }
      
      if (getLiveKit()) {
        const livekit = getLiveKit();
        window.LiveKit = livekit; // Normalize to window.LiveKit
        livekitLoaded = true;
        console.log('✅ LiveKit client found and ready');
        resolve();
        return;
      }
      
      const checkInterval = setInterval(() => {
        const livekit = getLiveKit();
        if (livekit) {
          clearInterval(checkInterval);
          window.LiveKit = livekit; // Normalize to window.LiveKit
          livekitLoaded = true;
          console.log('✅ LiveKit client loaded and ready');
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('❌ Available window objects:', Object.keys(window).filter(k => k.toLowerCase().includes('live')));
        reject(new Error('LiveKit client failed to load within timeout'));
      }, 10000);
    });
  }
  
  // Load LiveKit if not present
  if (typeof window.LiveKit === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/livekit-client@2.0.0/dist/livekit-client.umd.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ LiveKit client loaded successfully from modular widget');
    };
    script.onerror = () => {
      console.error('❌ Failed to load LiveKit client library');
    };
    document.head.appendChild(script);
  } else {
    livekitLoaded = true;
    console.log('✅ LiveKit client already available');
  }

  // Main widget initialization
  async function initializeWidget() {
    try {
      console.log('🔄 Initializing modular widget...');

      // Check if widget already exists and remove it to prevent duplicates
      const existingWidget = document.getElementById('iheard-ai-widget');
      if (existingWidget) {
        console.log('🧹 Removing existing widget to prevent duplicates');
        existingWidget.remove();
      }

      // Wait for modules to load
      const modules = await loadModules();
      
      // Wait for LiveKit
      if (!livekitLoaded) {
        await waitForLiveKit();
      }

      // Initialize core configuration
      await modules.core.initializeConfiguration();
      
      // Load agent configuration FIRST if agent ID is provided
      const agentId = modules.core.getAgentIdFromUrl();
      if (agentId) {
        console.log('🔧 Loading configuration for agent:', agentId);
        const configResult = await modules.api.loadAgentConfig(agentId);
        
        if (configResult === 'recreate') {
          // Significant changes require widget recreation
          setTimeout(() => initializeWidget(), 100);
          return;
        }
      }

      // NOW create widget HTML structure with correct configuration
      const widgetHTML = modules.ui.createWidgetHTML();
      
      // Apply styles
      const styles = modules.styles.createAllStyles();
      
      // Create and inject widget (with correct config already loaded)
      const widget = createWidgetElement(widgetHTML, styles);
      document.body.appendChild(widget);

      // Setup event listeners
      modules.ui.setupEventListeners(widget);
      modules.ui.setupWindowEventListeners();
      modules.ui.setupKeyboardEventListeners();

      // Initialize voice functionality if enabled
      if (modules.core.widgetConfig.voiceEnabled) {
        await modules.voice.initializeVoiceSystem();
      }

      // Update widget appearance with loaded configuration (final polish)
      modules.ui.updateWidgetAppearance(widget);
      
      // Show widget with smooth fade-in after configuration is applied
      // The widget itself IS the container, not a child element
      if (widget && widget.classList.contains('iheard-widget-container')) {
        widget.classList.add('configured');
        console.log('✨ Widget configuration completed - showing widget');
      }

      // Start configuration polling if needed
      if (agentId && modules.core.widgetConfig.isActive) {
        modules.api.startConfigPolling(agentId);
      }

      // Fallback: ensure widget shows after maximum 2 seconds
      setTimeout(() => {
        if (widget && widget.classList.contains('iheard-widget-container') && !widget.classList.contains('configured')) {
          widget.classList.add('configured');
          console.log('⏰ Widget shown via fallback timeout');
        }
      }, 2000);

      console.log('✅ iHeardAI Widget (Modular) initialized successfully');
      
      // Log module info
      modules.utils.logInfo('Widget initialized', {
        agentId: agentId,
        voiceEnabled: modules.core.widgetConfig.voiceEnabled,
        chatEnabled: modules.core.widgetConfig.chatEnabled,
        modulesLoaded: Object.keys(modules)
      });

    } catch (error) {
      console.error('❌ Widget initialization failed:', error);
      
      // Try to log error if modules are available
      try {
        window.iHeardModules?.utils?.logError?.('Widget initialization failed', error, 'Widget');
      } catch (logError) {
        // Ignore logging errors
      }
      
      // Show fallback UI
      showFallbackWidget(error.message);
    }
  }

  // Create widget DOM element
  function createWidgetElement(widgetElement, styles) {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Return the widget element directly since createWidgetHTML() already returns a DOM element
    return widgetElement;
  }

  // Fallback widget for when modules fail to load
  function showFallbackWidget(errorMsg) {
    console.log('🔄 Showing fallback widget...');
    
    const fallbackHTML = `
      <div class="iheard-widget-container" style="
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
      ">
        <div class="iheard-widget-button" style="
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          background: #ef4444 !important;
          color: white !important;
          border: none !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 24px !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
        ">
          ⚠️
        </div>
        <div class="error-message" style="
          position: absolute !important;
          bottom: 70px !important;
          right: 0 !important;
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          max-width: 250px !important;
          font-size: 14px !important;
          color: #374151 !important;
          display: none !important;
        ">
          <div style="font-weight: bold; margin-bottom: 8px;">Widget Error</div>
          <div>${errorMsg || 'Failed to load widget modules'}</div>
          <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            Please refresh the page or contact support.
          </div>
        </div>
      </div>
    `;

    const fallbackWidget = document.createElement('div');
    fallbackWidget.id = 'iheard-ai-widget-fallback';
    fallbackWidget.innerHTML = fallbackHTML;

    const button = fallbackWidget.querySelector('.iheard-widget-button');
    const errorMsgElement = fallbackWidget.querySelector('.error-message');

    button.addEventListener('click', () => {
      errorMsgElement.style.display = errorMsgElement.style.display === 'none' ? 'block' : 'none';
    });

    document.body.appendChild(fallbackWidget);
  }

  // Cleanup function
  function cleanup() {
    // Stop any polling
    if (window.iHeardModules?.api?.stopConfigPolling) {
      window.iHeardModules.api.stopConfigPolling();
    }

    // Disconnect voice if connected
    if (window.iHeardModules?.voice?.disconnectFromLiveKit) {
      window.iHeardModules.voice.disconnectFromLiveKit();
    }

    // Remove widget elements
    const widget = document.getElementById('iheard-ai-widget');
    const fallback = document.getElementById('iheard-ai-widget-fallback');
    
    if (widget) widget.remove();
    if (fallback) fallback.remove();

    // Clear storage if needed
    if (window.iHeardModules?.utils?.storage) {
      window.iHeardModules.utils.storage.clear();
    }

    console.log('🧹 Widget cleanup completed');
  }

  // Global functions
  window.iHeardAI = {
    init: initializeWidget,
    cleanup: cleanup,
    reload: () => {
      cleanup();
      setTimeout(initializeWidget, 100);
    },
    getModules: () => window.iHeardModules,
    getConfig: () => window.iHeardModules?.core?.widgetConfig,
    enableDebug: () => window.iHeardModules?.utils?.enableDebugMode?.(),
    disableDebug: () => window.iHeardModules?.utils?.disableDebugMode?.(),
    
    // Methods expected by frontend
    updateConfig: (newConfig) => {
      if (window.iHeardModules?.core?.updateConfig) {
        window.iHeardModules.core.updateConfig(newConfig);
        // Update UI appearance after config change
        if (window.iHeardModules?.ui?.updateWidgetAppearance) {
          const widget = document.getElementById('iheard-ai-widget');
          if (widget) {
            window.iHeardModules.ui.updateWidgetAppearance(widget);
            console.log('✅ Widget appearance updated successfully');
          } else {
            console.warn('⚠️ Widget element not found for appearance update');
          }
        }
        return true;
      }
      return false;
    },
    
    isInitialized: () => {
      return !!(window.iHeardModules && 
               window.iHeardModules.core && 
               window.iHeardModules.ui &&
               document.getElementById('iheard-ai-widget'));
    }
  };

  // Also create the expected iHeardAIWidget alias for backward compatibility
  window.iHeardAIWidget = window.iHeardAI;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // DOM is already ready
    initializeWidget();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  console.log('🎯 iHeardAI Widget (Modular) script loaded');

})();