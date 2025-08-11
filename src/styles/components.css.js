/**
 * Component-specific CSS styles for iHeardAI Widget
 * Button, header, messages, and UI component styles
 */

export function createComponentStyles() {
  return `
    /* Widget Button */
    .iheard-widget-button {
      background: #4f46e5; /* Same as AI badge background */
      border: none;
      border-radius: 50px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      outline: none;
      user-select: none;
      /* Default medium size */
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }

    /* Widget Button Size Variations */
    .widget-size-small .iheard-widget-button {
      width: 48px;
      height: 48px;
      padding: 9px 12px;
      font-size: 12px;
      gap: 6px;
    }

    .widget-size-medium .iheard-widget-button {
      width: 60px;
      height: 60px;
      padding: 12px 16px;
      font-size: 14px;
      gap: 8px;
    }

    .widget-size-large .iheard-widget-button {
      width: 72px;
      height: 72px;
      padding: 15px 20px;
      font-size: 16px;
      gap: 10px;
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

    /* Eye Logo Animation */
    .iheard-eye-logo {
      width: 28px;
      height: 28px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .iheard-eye-logo::before {
      content: '';
      width: 14px;
      height: 14px;
      background: #333;
      border-radius: 50%;
      position: absolute;
      animation: eyeBlink 2s infinite;
      transform-origin: center;
    }

    /* Eye Logo Size Variations */
    .widget-size-small .iheard-eye-logo {
      width: 22px;
      height: 22px;
    }

    .widget-size-small .iheard-eye-logo::before {
      width: 11px;
      height: 11px;
    }

    .widget-size-medium .iheard-eye-logo {
      width: 28px;
      height: 28px;
    }

    .widget-size-medium .iheard-eye-logo::before {
      width: 14px;
      height: 14px;
    }

    .widget-size-large .iheard-eye-logo {
      width: 34px;
      height: 34px;
    }

    .widget-size-large .iheard-eye-logo::before {
      width: 17px;
      height: 17px;
    }

    /* Widget Avatar Styles */
    .iheard-widget-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .iheard-widget-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .iheard-widget-avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }

    /* Avatar Size Variations */
    .widget-size-small .iheard-widget-avatar {
      width: 26px;
      height: 26px;
    }

    .widget-size-small .iheard-widget-avatar-placeholder {
      width: 26px;
      height: 26px;
      font-size: 13px;
    }

    .widget-size-medium .iheard-widget-avatar {
      width: 32px;
      height: 32px;
    }

    .widget-size-medium .iheard-widget-avatar-placeholder {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }

    .widget-size-large .iheard-widget-avatar {
      width: 38px;
      height: 38px;
    }

    .widget-size-large .iheard-widget-avatar-placeholder {
      width: 38px;
      height: 38px;
      font-size: 19px;
    }

    /* SVG Icon Size Variations */
    .widget-size-small .iheard-widget-button svg {
      width: 20px;
      height: 20px;
    }

    .widget-size-medium .iheard-widget-button svg {
      width: 24px;
      height: 24px;
    }

    .widget-size-large .iheard-widget-button svg {
      width: 28px;
      height: 28px;
    }

    /* Chat Header */
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
      display: flex;
      align-items: center;
      color: white;
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

    .iheard-header-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .iheard-header-arrow:hover {
      opacity: 1;
    }

    .iheard-header-arrow svg {
      width: 18px;
      height: 18px;
    }

    .iheard-chat-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .iheard-chat-avatar-wrapper {
      position: relative;
      padding: 3px;
      border-radius: 50%;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd, #ff7675);
      background-size: 300% 300%;
      animation: gradientShift 3s ease-in-out infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .iheard-chat-avatar img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: white;
    }

    .iheard-chat-avatar-placeholder {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    .iheard-title-container {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .iheard-chat-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd);
      background-size: 300% 300%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 4s ease-in-out infinite;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      letter-spacing: 0.3px;
    }

    .iheard-ai-agent-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }

    .ai-badge {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      animation: aiGlow 3s ease-in-out infinite;
    }

    .agent-text {
      font-size: 8px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.75);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      opacity: 0.8;
    }

    @keyframes aiGlow {
      0%, 100% { 
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transform: scale(1);
      }
      50% { 
        box-shadow: 0 3px 8px rgba(79, 70, 229, 0.4);
        transform: scale(1.02);
      }
    }

    @keyframes callButtonGradient {
      0%, 100% { 
        background-position: 0% 50%;
      }
      50% { 
        background-position: 100% 50%;
      }
    }

    .iheard-status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6b7280;
      display: inline-block;
      margin-right: 6px;
    }

    .iheard-status-indicator.connecting {
      background: #f59e0b;
      animation: pulse 1.5s ease-in-out infinite alternate;
    }

    .iheard-status-indicator.connected {
      background: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 1);
      animation: pulse-connected 2s infinite;
    }

    .iheard-status-text {
      font-weight: 500;
      white-space: nowrap;
    }

    /* Call Section */
    .iheard-call-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* CC Toggle Button */
    .iheard-cc-btn {
      background: rgba(107, 114, 128, 0.9);
      border: none;
      color: white;
      cursor: pointer;
      padding: 9px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      width: 36px;
      height: 36px;
      opacity: 0;
      transform: translateX(10px);
      pointer-events: none;
    }

    .iheard-cc-btn.visible {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }

    .iheard-cc-btn.visible:hover {
      background: rgba(107, 114, 128, 1);
      transform: translateX(0) translateY(-1px);
    }

    .iheard-cc-btn.active {
      background: rgba(59, 130, 246, 0.9);
    }

    .iheard-cc-btn.active.visible:hover {
      background: rgba(59, 130, 246, 1);
    }

    .iheard-cc-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Call Button */
    .iheard-call-btn {
      background: #4f46e5; /* Same as AI badge background */
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
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .iheard-call-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Close Button */
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
      width: 32px;
      height: 32px;
      margin-left: 8px;
    }

    .iheard-close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .iheard-close-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Chat Input Area */
    .iheard-chat-input {
      grid-area: input;
      padding: 20px;
      border: none;
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .iheard-input-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Default appearance styles for input area */
    .iheard-chat-input.default-appearance {
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
    }

    .iheard-input {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.1);
      color: #333;
      font-size: 14px;
      outline: none;
      transition: all 0.3s ease;
    }

    .iheard-input.default-appearance {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .iheard-input::placeholder {
      color: rgba(51, 51, 51, 0.6);
    }

    .iheard-input.default-appearance::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .iheard-input:focus {
      background: rgba(255, 255, 255, 0.2);
    }

    .iheard-input.default-appearance:focus {
      background: rgba(255, 255, 255, 0.25);
    }

    .iheard-branding {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .iheard-powered-by {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 400;
      letter-spacing: 0.2px;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .default-appearance .iheard-powered-by {
      color: rgba(255, 255, 255, 0.6);
    }

    .iheard-powered-by:hover {
      opacity: 1;
    }
  `;
}