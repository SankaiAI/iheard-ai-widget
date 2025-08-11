/**
 * Base CSS styles for iHeardAI Widget
 * Core layout, positioning, and container styles
 */

export function createBaseStyles() {
  return `
    /* iHeardAI Widget Styles - Modern Design inspired by screenshot */
    .iheard-widget-container {
      position: fixed !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Helvetica Neue", Arial, sans-serif !important;
      pointer-events: none !important;
      opacity: 0 !important;
      transition: opacity 0.3s ease !important;
    }

    /* Show widget only after configuration is loaded */
    .iheard-widget-container.configured {
      opacity: 1 !important;
    }

    .iheard-widget-container * {
      box-sizing: border-box !important;
      pointer-events: auto !important;
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

    /* Chat interface positioning */
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
  `;
}