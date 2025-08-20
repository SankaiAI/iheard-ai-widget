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
      overflow-x: hidden; /* Prevent horizontal scroll */
      padding: 10px;
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
      animation: slideInVertical 0.3s ease-out; /* Use vertical animation instead */
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
      background: #4f46e5; /* Same as AI badge background */
      color: white;
      border-bottom-right-radius: 6px;
    }

    /* Assistant Messages - Remove bubble styling, make transparent with white text and larger font */
    .assistant-message .message-content {
      background: transparent;
      color: white;
      border: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* Default appearance assistant messages - Also transparent with white text */
    .default-appearance .assistant-message .message-content {
      background: transparent;
      color: white;
      backdrop-filter: none;
      border: none;
      box-shadow: none;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
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
      border-bottom: none;
      background: transparent;
    }

    /* Formatted message content styling */
    .message-content p {
      margin: 0 0 10px 0;
      line-height: 1.4;
    }

    .message-content p:last-child {
      margin-bottom: 0;
    }

    .message-content strong {
      font-weight: 600;
      color: inherit;
    }

    .message-content strong.emoji-header {
      display: block;
      font-weight: 700;
      margin: 12px 0 6px 0;
      font-size: 1.05em;
    }

    .message-content ul {
      margin: 8px 0 12px 20px;
      padding: 0;
      list-style-type: disc;
    }

    .message-content li {
      margin: 4px 0;
      line-height: 1.4;
    }

    .message-content br {
      display: block;
      margin: 4px 0;
      content: "";
    }

    /* Typewriter streaming effect for assistant messages */
    .assistant-message.streaming .message-content {
      overflow: hidden;
    }

    .assistant-message.streaming .message-content .typewriter-text {
      border-right: 2px solid white;
      animation: typewriter-cursor 1s infinite;
    }

    @keyframes typewriter-cursor {
      0%, 50% { border-color: white; }
      51%, 100% { border-color: transparent; }
    }

    /* Enhanced formatting for white text */
    .assistant-message .message-content strong {
      color: #fbbf24;
      font-weight: 700;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }

    .assistant-message .message-content strong.emoji-header {
      color: #fbbf24;
      font-weight: 700;
      font-size: 1.1em;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }

    /* Animated thinking dots indicator */
    .iheard-thinking-dots {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 0;
      margin: 16px 0;
    }

    .thinking-dots-container {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .thinking-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: white;
      opacity: 0.4;
      animation: thinking-dot-bounce 1.4s infinite ease-in-out both;
      box-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
    }

    .thinking-dot:nth-child(1) {
      animation-delay: -0.32s;
    }

    .thinking-dot:nth-child(2) {
      animation-delay: -0.16s;
    }

    .thinking-dot:nth-child(3) {
      animation-delay: 0s;
    }

    @keyframes thinking-dot-bounce {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.4;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
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

    /* Assistant transcription messages - transparent like normal assistant messages with white text */
    .iheard-message.transcription-message.assistant-message .message-content {
      background: transparent;
      color: white;
      border: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* Default appearance transcription messages - also transparent with white text */
    .iheard-message.transcription-message.assistant-message.default-appearance .message-content {
      background: transparent;
      color: white;
      backdrop-filter: none;
      border: none;
      box-shadow: none;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
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
      background: #4f46e5; /* Same as AI badge background */
      color: white;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .iheard-action-btn:hover {
      transform: translateY(-50%) scale(1.05);
      opacity: 0.9;
    }

    .iheard-action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: translateY(-50%);
    }

    .iheard-action-btn svg {
      width: 18px;
      height: 18px;
      color: white !important;
      stroke: white !important;
      fill: white !important;
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
      padding: 0;
      background: transparent;
      border-radius: 12px;
      border: none;
      width: 100%;
      overflow: hidden;
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
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      padding: 0 0 8px 0;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
      width: 100%;
      max-width: 100%;
    }

    .product-cards.carousel::-webkit-scrollbar {
      height: 6px;
    }

    .product-cards.carousel::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 3px;
    }

    .product-cards.carousel::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }

    .product-cards.carousel::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    .product-cards.carousel .product-card {
      flex: 0 0 160px;
      scroll-snap-align: start;
      max-width: 160px;
      min-width: 160px;
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
      max-height: 120px;
      overflow: hidden;
      opacity: 1;
      transform: translateY(0);
      transition: all 0.3s ease;
      position: relative;
    }

    /* Allow horizontal scrolling for carousel even when collapsed */
    .product-cards.carousel.collapsed {
      overflow-x: auto;
      overflow-y: hidden;
    }

    .product-cards.collapsed::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(transparent, rgba(255, 255, 255, 0.05));
      pointer-events: none;
      border-bottom: 2px solid rgba(255, 255, 255, 0.3);
    }

    .product-cards.expanded {
      max-height: 1000px;
      overflow: visible;
      opacity: 1;
      transform: translateY(0);
      transition: all 0.3s ease;
    }

    /* Maintain horizontal scrolling for carousel even when expanded */
    .product-cards.carousel.expanded {
      overflow-x: auto;
      overflow-y: hidden;
    }

    .product-cards.expanded::after {
      display: none;
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
      
      /* Mobile carousel support */
      .product-cards.carousel {
        gap: 8px;
        -webkit-overflow-scrolling: touch;
      }
      
      .product-cards.carousel .product-card {
        flex: 0 0 140px;
        min-width: 140px;
        max-width: 140px;
      }
      
      /* Ensure scrolling works on mobile for both collapsed and expanded */
      .product-cards.carousel.collapsed,
      .product-cards.carousel.expanded {
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
      }
    }

    /* Message Animations - Use vertical instead of horizontal to prevent scrollbar */
    @keyframes slideInVertical {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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
      background: transparent;
      border: none;
    }

    .default-appearance .products-count {
      color: rgba(255, 255, 255, 0.9);
    }

    /* End Chat Button Styles */
    .iheard-end-chat-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 20px 0 10px 0;
      padding: 0;
    }

    .iheard-end-chat-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      background: #4f46e5; /* Same as widget bubble color */
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
      animation: endChatSlideIn 0.3s ease-out;
    }

    .iheard-end-chat-btn:hover:not(:disabled) {
      background: #4338ca;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    }

    .iheard-end-chat-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .iheard-end-chat-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    .iheard-end-chat-btn.confirmation-mode {
      background: #dc2626 !important; /* Red background for confirmation */
      animation: pulse 2s infinite;
    }

    .iheard-end-chat-btn.confirmation-mode:hover:not(:disabled) {
      background: #b91c1c !important; /* Darker red on hover */
    }

    /* End Chat Alert Message */
    .iheard-end-chat-alert {
      margin-top: 12px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      animation: alertSlideIn 0.3s ease-out;
    }

    .iheard-end-chat-alert .alert-text {
      color: #dc2626;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .iheard-end-chat-alert .alert-actions {
      display: flex;
      justify-content: center;
    }

    .iheard-end-chat-alert .cancel-btn {
      padding: 6px 16px;
      background: rgba(107, 114, 128, 0.8);
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .iheard-end-chat-alert .cancel-btn:hover {
      background: rgba(107, 114, 128, 1);
      transform: translateY(-1px);
    }

    /* Default appearance styles for alert */
    .default-appearance .iheard-end-chat-alert {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .default-appearance .iheard-end-chat-alert .alert-text {
      color: rgba(255, 255, 255, 0.9);
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      }
      50% {
        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
      }
    }

    @keyframes alertSlideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* System Message Styles */
    .iheard-message.system-message {
      align-self: center;
      max-width: 90%;
      margin: 12px auto;
    }

    .system-message .message-content {
      background: rgba(59, 130, 246, 0.1);
      color: #1e40af;
      border: 1px solid rgba(59, 130, 246, 0.2);
      text-align: center;
      font-size: 13px;
      padding: 10px 16px;
      border-radius: 20px;
    }

    .default-appearance .system-message .message-content {
      background: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    @keyframes endChatSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Agent Processing State Styles */
    .iheard-chat-input.agent-processing {
      opacity: 0.8;
    }

    .iheard-chat-input.agent-processing .iheard-input {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(156, 163, 175, 0.1) !important;
    }

    .iheard-chat-input.agent-processing .iheard-input:disabled {
      color: rgba(107, 114, 128, 0.8);
    }

    .default-appearance .iheard-chat-input.agent-processing .iheard-input {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    .default-appearance .iheard-chat-input.agent-processing .iheard-input:disabled {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Action Button State Styles */
    .iheard-action-btn.processing {
      background: #6b7280 !important;
      cursor: not-allowed;
      animation: none;
    }

    .iheard-action-btn.pause {
      background: #dc2626 !important;
      animation: gentlePulse 2s infinite;
      cursor: pointer;
    }

    .iheard-action-btn.pause:hover {
      background: #b91c1c !important;
      transform: translateY(-50%) scale(1.1);
    }

    .iheard-action-btn.send {
      background: #4f46e5 !important;
      cursor: pointer;
    }

    .iheard-action-btn.send:hover {
      background: #3730a3 !important;
    }

    /* Processing Spinner Animation */
    .processing-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Gentle Pulse Animation for Pause Button */
    @keyframes gentlePulse {
      0%, 100% {
        transform: translateY(-50%) scale(1);
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      }
      50% {
        transform: translateY(-50%) scale(1.05);
        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
      }
    }

    /* Can Interrupt State */
    .iheard-chat-input.can-interrupt {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .default-appearance .iheard-chat-input.can-interrupt {
      background: rgba(245, 158, 11, 0.05);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    /* Pause Indicator Styles */
    .iheard-pause-indicator {
      align-self: center;
      max-width: 90%;
      margin: 8px auto;
      animation: slideIn 0.3s ease;
    }

    .pause-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
      border: 1px solid rgba(245, 158, 11, 0.3);
      text-align: center;
      font-size: 13px;
      padding: 10px 16px;
      border-radius: 20px;
      font-weight: 500;
    }

    .default-appearance .pause-message {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .pause-message svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
}