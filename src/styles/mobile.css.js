/**
 * Mobile and responsive styles for iHeardAI Widget
 * Media queries and mobile-specific layouts
 */

export function createMobileStyles() {
  return `
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
        z-index: 999999 !important;
        display: block !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
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
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        border-radius: 0 !important;
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
        box-sizing: border-box !important;
      }
      
      /* Override ALL desktop positioning rules that might interfere */
      .iheard-widget-container.position-bottom-left .iheard-chat-interface,
      .iheard-widget-container.position-top-left .iheard-chat-interface,
      .iheard-widget-container.position-center-left .iheard-chat-interface,
      .iheard-widget-container.position-top-right .iheard-chat-interface,
      .iheard-widget-container.position-center-right .iheard-chat-interface,
      .iheard-chat-interface {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 0 !important;
        transform: none !important;
        margin: 0 !important;
        max-width: none !important;
        max-height: none !important;
        min-height: none !important;
      }
      
      /* Header adjustments for mobile - full screen */
      .iheard-chat-header {
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 0 !important;
        height: auto !important;
        min-height: 70px !important;
        padding: 10px !important;
        padding-top: 10px !important;
      }
      
      .iheard-chat-header.default-appearance {
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .iheard-chat-header-rect {
        margin: 5px !important;
        width: calc(100% - 10px) !important;
        padding: 12px 20px !important;
      }
      
      /* Messages container mobile adjustments */
      .iheard-chat-messages-container {
        background: transparent !important;
      }
      
      .iheard-chat-messages {
        padding: 15px !important;
        padding-bottom: 15px !important;
        background: transparent !important;
      }
      
      .iheard-chat-messages.default-appearance {
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(10px) !important;
      }
      
      /* Input area mobile adjustments - full screen */
      .iheard-chat-input {
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(10px) !important;
        padding: 15px 15px 0px 15px !important;
        border: none !important;
        border-radius: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }

      .iheard-input-row {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }
      
      .iheard-chat-input.default-appearance {
        background: rgba(0, 0, 0, 0.15) !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .iheard-input {
        font-size: 16px !important; /* Prevent zoom on iOS */
      }
      
      .iheard-branding {
        padding: 0 !important;
      }
      
      /* Hide widget button when chat is open on mobile */
      .iheard-widget-button.chat-open {
        display: none !important;
      }
      
      /* Additional selectors for hiding widget button when chat is open */
      .iheard-widget-container:has(.iheard-chat-interface.iheard-chat-open) .iheard-widget-button {
        display: none !important;
      }
      
      /* Fallback for browsers that don't support :has() */
      .iheard-chat-interface.iheard-chat-open + .iheard-widget-button {
        display: none !important;
      }
      
      /* Mobile landscape adjustments */
      @media (orientation: landscape) and (max-height: 500px) {
        .iheard-chat-header {
          min-height: 60px !important;
          padding: 8px !important;
        }
        
        .iheard-chat-header-rect {
          padding: 10px 16px !important;
        }
        
        .iheard-chat-messages {
          padding: 12px !important;
        }
        
        .iheard-chat-input {
          padding: 12px 12px 0px 12px !important;
          gap: 6px !important;
        }
        
        .iheard-branding {
          padding: 0 !important;
        }
      }
    }

    /* Tablet adjustments */
    @media (min-width: 481px) and (max-width: 768px) {
      .iheard-chat-interface {
        width: 460px;
        height: 650px;
      }
      
      .iheard-widget-button .button-text {
        display: inline !important;
      }
    }

    /* Large screen adjustments */
    @media (min-width: 1200px) {
      .iheard-chat-interface {
        width: 450px;
        height: 650px;
      }
    }

    /* High DPI screens */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .iheard-widget-button {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      .iheard-chat-interface {
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .iheard-chat-interface:not(.default-appearance) {
        background: #1e293b;
      }
      
      .iheard-chat-content-container:not(.default-appearance) {
        background: #1e293b;
      }
      
      .iheard-chat-header:not(.default-appearance) {
        background: #334155;
      }
      
      .assistant-message .message-content {
        background: #334155 !important;
        color: #f1f5f9 !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      
      .iheard-input:not(.default-appearance) {
        background: #334155 !important;
        color: #f1f5f9 !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }
      
      .iheard-chat-input:not(.default-appearance) {
        border-top-color: rgba(255, 255, 255, 0.1) !important;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .iheard-eye-logo::before {
        animation: none !important;
      }
      
      .iheard-status-indicator.connecting,
      .iheard-status-indicator.connected {
        animation: none !important;
      }
      
      .typing-dot {
        animation: none !important;
      }
    }
  `;
}