/**
 * Message and chat-specific styles for iHeardAI Widget
 * Message bubbles, input areas, and chat interface styles
 */

export function createMessageStyles() {
  return `
    /* Messages Container */
    .iheard-chat-messages-container {
      grid-area: messages !important;
      overflow: hidden;
      background: transparent;
      box-sizing: border-box;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .iheard-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
      background: transparent;
    }

    /* Default appearance styles */
    .iheard-chat-messages.default-appearance {
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
    }

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

    /* Message Bubbles */
    .iheard-message {
      max-width: 85%;
      margin-bottom: 8px;
      animation: slideIn 0.3s ease-out;
      word-wrap: break-word;
      overflow-wrap: break-word;
      position: relative;
    }

    .iheard-message.user-message {
      align-self: flex-end;
      margin-left: auto;
    }

    .iheard-message.assistant-message {
      align-self: flex-start;
      margin-right: auto;
    }

    .message-content {
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    /* User Messages */
    .user-message .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 6px;
    }

    /* Assistant Messages */
    .assistant-message .message-content {
      background: #f1f5f9;
      color: #1e293b;
      border-bottom-left-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    /* Default appearance assistant messages */
    .default-appearance .assistant-message .message-content {
      background: rgba(255, 255, 255, 0.9);
      color: #1e293b;
      backdrop-filter: blur(10px);
    }

    /* Streaming Messages */
    .iheard-message.streaming .message-content {
      border-bottom: 2px solid transparent;
      animation: blink 1s infinite;
    }

    .iheard-message.streaming.user-message .message-content {
      border-bottom-color: rgba(255, 255, 255, 0.7);
    }

    .iheard-message.streaming.assistant-message .message-content {
      border-bottom-color: #667eea;
    }

    /* Transcription Messages */
    .transcription-message .speech-icon {
      margin-right: 6px;
      opacity: 0.7;
    }

    /* Welcome Message */
    .welcome-message {
      text-align: center;
      color: #6b7280;
      font-style: italic;
      margin: 20px 0;
      opacity: 0.8;
    }

    .default-appearance .welcome-message {
      color: rgba(255, 255, 255, 0.8);
    }

    /* Typing Indicator */
    .iheard-typing-indicator {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 8px;
      align-self: flex-start;
      margin-right: auto;
    }

    .iheard-typing-indicator .message-content {
      background: #f1f5f9;
      color: #6b7280;
      border-bottom-left-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .default-appearance .iheard-typing-indicator .message-content {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
    }

    .typing-dots {
      display: flex;
      gap: 4px;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s ease-in-out infinite;
    }

    .typing-dot:nth-child(1) { animation-delay: 0ms; }
    .typing-dot:nth-child(2) { animation-delay: 160ms; }
    .typing-dot:nth-child(3) { animation-delay: 320ms; }

    /* Input Area */
    .iheard-chat-input {
      grid-area: input !important;
      padding: 16px 20px 0px 20px;
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-sizing: border-box;
      border: none;
      position: relative;
      transition: all 0.3s ease;
    }

    .iheard-input-row {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .default-appearance .iheard-chat-input {
      border: none;
    }

    .iheard-input {
      flex: 1;
      border: none;
      border-radius: 25px;
      padding: 12px 50px 12px 16px;
      font-size: 14px;
      outline: none;
      background: white;
      color: #1e293b;
      transition: all 0.2s ease;
      resize: none;
      min-height: 20px;
      max-height: 100px;
      font-family: inherit;
    }

    .iheard-input.default-appearance {
      background: rgba(255, 255, 255, 0.95);
      border: none;
      backdrop-filter: blur(10px);
    }

    .iheard-input:focus {
      border: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .iheard-input.default-appearance:focus {
      border: none;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }

    /* Welcome Message Styles */
    .iheard-welcome-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: transparent;
      border-radius: 15px;
      padding: 20px 25px;
      color: #2d3748;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      z-index: 100;
      min-width: 280px;
      max-width: 400px;
      opacity: 0;
      animation: welcomeSlideIn 0.5s ease-out 0.5s forwards;
    }

    .iheard-welcome-message.default-appearance {
      background: transparent;
      color: white;
    }

    .iheard-welcome-message.typing {
      opacity: 1;
    }

    .iheard-welcome-message.fade-out {
      animation: welcomeFadeOut 1s ease-out forwards;
    }

    .iheard-welcome-message .typing-cursor {
      display: inline-block;
      width: 2px;
      height: 1.2em;
      background: currentColor;
      margin-left: 2px;
      animation: cursorBlink 1s infinite;
    }

    @keyframes welcomeSlideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) translateX(0);
      }
    }

    @keyframes welcomeFadeOut {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) translateY(0);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translateY(-30px);
      }
    }

    @keyframes cursorBlink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    /* Transcription Message Styles */
    .iheard-message.transcription-message {
      opacity: 0.95;
    }

    .iheard-message.transcription-message .message-content {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    /* User transcription messages - same as normal user messages */
    .iheard-message.transcription-message.user-message .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 6px;
    }

    /* Assistant transcription messages - same as normal assistant messages */
    .iheard-message.transcription-message.assistant-message .message-content {
      background: #f1f5f9;
      color: #1e293b;
      border-bottom-left-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    /* Default appearance transcription messages */
    .iheard-message.transcription-message.assistant-message.default-appearance .message-content {
      background: rgba(255, 255, 255, 0.9);
      color: #1e293b;
      backdrop-filter: blur(10px);
    }

    .iheard-message.transcription-message.interim {
      opacity: 0.7;
    }

    .iheard-message.transcription-message.interim .message-content {
      font-style: italic;
    }

    .iheard-message.transcription-message .voice-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.7;
    }

    .iheard-message.transcription-message .voice-icon svg {
      width: 14px;
      height: 14px;
    }

    .iheard-message.transcription-message .transcription-text {
      flex: 1;
    }

    .iheard-message.transcription-message .message-content:before {
      content: 'Voice';
      position: absolute;
      top: -2px;
      right: 8px;
      font-size: 10px;
      color: rgba(76, 175, 80, 0.8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      pointer-events: none;
    }

    .iheard-message.transcription-message.user-message .message-content:before {
      left: 8px;
      right: auto;
      color: rgba(33, 150, 243, 0.8);
    }

    .iheard-message.transcription-message.interim .message-content:before {
      content: 'Live';
      color: rgba(255, 152, 0, 0.8);
    }

    .iheard-action-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
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
      padding: 0;
    }

    .iheard-action-btn:hover {
      transform: translateY(-50%) scale(1.05);
      background: rgba(255, 255, 255, 0.2);
      color: rgba(74, 144, 226, 1);
    }

    .iheard-action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: translateY(-50%);
    }

    .iheard-action-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Voice Mode Indicators */
    .iheard-chat-input.showing-waves {
      justify-content: center;
      align-items: center;
      min-height: 80px;
    }

    .iheard-text-only {
      text-align: center;
      padding: 10px;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
    }

    .default-appearance .iheard-text-only {
      color: rgba(255, 255, 255, 0.8);
    }

    .iheard-status-text.listening {
      color: #10b981;
    }

    .iheard-status-text.user-speaking {
      color: #f59e0b;
    }

    .iheard-status-text.ai-speaking {
      color: #8b5cf6;
    }

    /* Transcription Reminder Animation */
    .iheard-transcription-reminder {
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
      margin-bottom: 8px;
      opacity: 0;
      animation: transcriptionReminderFade 4s ease-in-out infinite;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .default-appearance .iheard-transcription-reminder {
      color: rgba(255, 255, 255, 0.7);
    }

    @keyframes transcriptionReminderFade {
      0% {
        opacity: 0;
        transform: translateY(5px);
      }
      20% {
        opacity: 1;
        transform: translateY(0);
      }
      80% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-5px);
      }
    }

    /* Product Cards Styles */
    .iheard-product-cards-container {
      margin: 12px 0;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .product-cards-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .products-count {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }

    .compare-btn {
      background: rgba(59, 130, 246, 0.8);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .compare-btn:hover {
      background: rgba(59, 130, 246, 1);
      transform: translateY(-1px);
    }

    .product-cards {
      display: grid;
      gap: 12px;
    }

    .product-cards.grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 400px;
    }

    .product-cards.grid.single-product {
      grid-template-columns: 1fr;
      max-width: 200px;
    }

    .product-cards.carousel {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 8px;
    }

    .product-cards.list {
      grid-template-columns: 1fr;
    }

    /* Collapsible Product Cards */
    .product-cards-collapsible {
      position: relative;
    }

    .product-cards-expand-btn {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      transition: all 0.2s ease;
    }

    .product-cards-expand-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .product-cards-expand-btn .expand-icon {
      transition: transform 0.3s ease;
    }

    .product-cards.collapsed {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }

    .product-cards.expanded {
      max-height: 1000px;
      overflow: visible;
      opacity: 1;
      transform: translateY(0);
      transition: all 0.3s ease;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .product-card.out-of-stock {
      opacity: 0.7;
      filter: grayscale(0.3);
    }

    .product-image {
      position: relative;
      height: 120px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-image img[src*="base64"] {
      object-fit: contain;
      background: #f8f9fa;
    }


    .product-info {
      padding: 12px;
    }

    .product-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 12px 0;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }


    .product-pricing {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .original-price {
      color: #9ca3af;
      text-decoration: line-through;
      font-size: 14px;
    }

    .current-price {
      color: #1f2937;
      font-size: 16px;
      font-weight: 700;
    }

    .currency {
      color: #6b7280;
      font-size: 14px;
    }

    .product-availability {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 10px;
    }

    .availability-status.in-stock {
      color: #10b981;
      font-weight: 600;
    }

    .availability-status.out-of-stock {
      color: #ef4444;
      font-weight: 600;
    }

    .shipping-info {
      color: #6b7280;
    }

    .product-actions {
      display: flex;
      gap: 8px;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: rgba(107, 114, 128, 0.1);
      color: #374151;
      border: 1px solid rgba(107, 114, 128, 0.2);
    }

    .btn-secondary:hover {
      background: rgba(107, 114, 128, 0.15);
      transform: translateY(-1px);
    }

    /* Responsive Design for Product Cards */
    @media (max-width: 640px) {
      .product-cards.grid {
        grid-template-columns: repeat(2, 1fr);
        max-width: 100%;
        gap: 8px;
      }
      
      .product-cards.grid.single-product {
        grid-template-columns: 1fr;
        max-width: 180px;
      }
      
      .product-card {
        margin: 0;
      }
      
      .product-actions {
        flex-direction: column;
        gap: 6px;
      }
      
      .btn-primary, .btn-secondary {
        flex: none;
        padding: 6px 8px;
        font-size: 10px;
      }
    }

    /* Notification Animations */
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    /* Default appearance overrides for product cards */
    .default-appearance .iheard-product-cards-container {
      background: rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .default-appearance .products-count {
      color: rgba(255, 255, 255, 0.9);
    }
  `;
}