/**
 * Messaging and chat UI management for iHeardAI Widget
 * Handles message display, user interactions, and chat functionality
 */

import { 
  currentUserMessage,
  currentAssistantMessage,
  isConnecting,
  setCurrentUserMessage,
  setCurrentAssistantMessage,
  setConnecting,
  currentApiKey,
  currentAgentId,
  currentCustomerId,
  isAgentProcessing,
  pauseRequested,
  setAgentProcessing,
  setAgentThinking,
  setAgentResponding,
  setCanInterrupt,
  setPauseRequested
} from '../core/state.js';
import { widgetConfig } from '../core/config.js';
import { 
  getTextAgentUrl,
  sendMessageToAgent,
  getFallbackResponse,
  generateSessionId
} from '../api/index.js';
import { 
  sendMessageWithThinkingStatus,
  cleanupThinkingWebSocket 
} from '../api/websocket.js';
import { 
  createThinkingStatusComponent,
  updateThinkingStatus,
  completeThinkingStatus,
  removeThinkingStatus 
} from './thinking-status.js';
import { chatHistory } from '../api/chat-history.js';

/**
 * Format message text for proper HTML display with line breaks and styling
 * @param {string} message - Raw message text from agent
 * @returns {string} HTML formatted message
 */
function formatMessageForDisplay(message) {
  if (!message) return '';
  
  // Escape basic HTML to prevent XSS but allow our formatting
  let formatted = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Convert markdown-style formatting to HTML
  formatted = formatted
    // Bold text **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Convert double line breaks to paragraph breaks
    .replace(/\n\s*\n/g, '</p><p>')
    
    // Convert single line breaks to <br>
    .replace(/\n/g, '<br>')
    
    // Convert bullet points (• or -) to proper list items
    .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
    
    // Wrap consecutive list items in <ul>
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    
    // Fix multiple consecutive <ul> tags
    .replace(/<\/ul>\s*<ul>/g, '')
    
    // Convert emoji headers (💰, ✨, etc.)
    .replace(/^([💰✨🔥💡⚡🎯🛍️🌟💎🚀]\s*[^:]*:)/gm, '<strong class="emoji-header">$1</strong>')
    
    // Wrap everything in paragraphs if not already wrapped
    .replace(/^(?!<[pu])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>')
    
    // Clean up empty paragraphs and fix formatting
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>\s*(<strong|<ul)/g, '$1')
    .replace(/(<\/ul>|<\/strong>)\s*<\/p>/g, '$1');
  
  // Ensure we start with a paragraph if we don't start with a formatted element
  if (!formatted.startsWith('<p>') && !formatted.startsWith('<ul>') && !formatted.startsWith('<strong>')) {
    formatted = '<p>' + formatted;
  }
  
  // Ensure we end properly
  if (!formatted.endsWith('</p>') && !formatted.endsWith('</ul>') && !formatted.endsWith('</strong>')) {
    formatted = formatted + '</p>';
  }
  
  return formatted;
}

/**
 * Get user context for API requests
 * @returns {Object} User context object
 */
function getUserContext() {
  const context = {};
  
  // Use extracted agent credentials from URL parameters
  if (currentApiKey) {
    context.agent_key = currentApiKey;
  }
  
  if (currentAgentId) {
    context.agent_id = currentAgentId;
  }
  
  // Add customer ID for conversation history
  if (currentCustomerId) {
    context.user_id = currentCustomerId;
  }
  
  // Check if user context is provided in global config (for local testing)
  if (window.iHeardConfig) {
    if (window.iHeardConfig.userId) {
      context.user_id = window.iHeardConfig.userId;
    }
    
    if (window.iHeardConfig.agentKey) {
      context.agent_key = window.iHeardConfig.agentKey;
    }
    
    if (window.iHeardConfig.storeId) {
      context.store_id = window.iHeardConfig.storeId;
    }
  }
  
  // Check URL parameters for testing
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('userId')) {
    context.user_id = urlParams.get('userId');
  }
  
  if (urlParams.get('agentKey')) {
    context.agent_key = urlParams.get('agentKey');
  }
  
  if (urlParams.get('storeId')) {
    context.store_id = urlParams.get('storeId');
  }
  
  // Also check for store ID in the user message (for testing)
  // This is a temporary solution for testing with store IDs mentioned in messages
  const storeIdMatch = window.location.href.match(/store[_\s]+([a-zA-Z0-9]+)/i);
  if (storeIdMatch) {
    context.store_id = storeIdMatch[1];
  }
  
  // Add metadata
  context.metadata = {
    widget_version: '1.0.0',
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  };
  
  console.log('🔍 User context:', context);
  return context;
}

/**
 * Add user message to chat
 * @param {string} message - User message text
 */
export function addUserMessage(message) {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  const messageElement = document.createElement('div');
  messageElement.className = 'iheard-message user-message';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = message;

  messageElement.appendChild(messageContent);
  
  // Add message normally to the bottom (chronological order)
  messagesContainer.appendChild(messageElement);
  
  // Show thinking dots after user message
  showThinkingDots();
  
  // Scroll to bottom to show the new message
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    console.log('📍 Scrolled to bottom for new user message');
  });
  
  console.log('👤 User message added:', message);
  
  // Save to chat history
  saveMessageToHistory(message, 'user');
  
  // Start/restart end chat timer
  startEndChatTimer();
}

/**
 * Add structured agent response with UI components (product cards, etc.)
 * @param {Object} response - Structured response from agent
 */
export function addStructuredAgentResponse(response) {
  removeWelcomeMessage();
  removeThinkingDots(); // Remove thinking dots when agent responds
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  // Create message container
  const messageElement = document.createElement('div');
  messageElement.className = 'iheard-message assistant-message structured-response';

  // Add text content if present
  if (response.content) {
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatMessageForDisplay(response.content);
    messageElement.appendChild(messageContent);
  }

  // Add UI components based on response type
  if (response.type === 'product_recommendations' && response.products?.length > 0) {
    const productCards = createProductCards(response.products, response.ui_components?.[0]);
    messageElement.appendChild(productCards);
  }

  messagesContainer.appendChild(messageElement);
  
  // DO NOT auto-scroll for agent responses - let user control scroll position
  // Agent responses appear below without disrupting the scroll position
  
  console.log('🤖 Structured agent response added:', response.type);
  
  // Save structured response to chat history
  if (response.content || (response.products && response.products.length > 0)) {
    // Save the complete structured response as JSON in the message content
    const structuredMessage = {
      type: 'structured_response',
      content: response.content,
      response_type: response.type,
      products: response.products,
      ui_components: response.ui_components
    };
    
    // Save as JSON string so we can restore the full structure
    saveMessageToHistory(JSON.stringify(structuredMessage), 'assistant');
    
    // Also update activity with products viewed
    if (response.products && response.products.length > 0) {
      const productIds = response.products.map(p => p.id).filter(Boolean);
      if (productIds.length > 0) {
        chatHistory.updateActivity(productIds).catch(error => {
          console.warn('Failed to update activity with viewed products:', error);
        });
      }
    }
  }
}

/**
 * Create product cards UI component
 * @param {Array} products - Array of product data
 * @param {Object} uiConfig - UI configuration for the cards
 * @returns {HTMLElement} Product cards container
 */
function createProductCards(products, uiConfig = {}) {
  const container = document.createElement('div');
  container.className = 'iheard-product-cards-container';

  const header = document.createElement('div');
  header.className = 'product-cards-header';
  header.innerHTML = `
    <span class="products-count">${products.length} Products Found</span>
    ${uiConfig.show_comparison && products.length > 1 ? '<button class="compare-btn">Compare</button>' : ''}
  `;
  container.appendChild(header);

  // Create collapsible wrapper
  const collapsibleWrapper = document.createElement('div');
  collapsibleWrapper.className = 'product-cards-collapsible';
  
  // Create expand/collapse button
  const expandButton = document.createElement('button');
  expandButton.className = 'product-cards-expand-btn';
  expandButton.innerHTML = `
    <span class="expand-text">View All Products</span>
    <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  `;
  
  // Create cards container (initially hidden)
  const cardsContainer = document.createElement('div');
  // Use carousel layout for more than 2 products, otherwise use grid
  const layoutClass = products.length > 2 ? 'carousel' : (uiConfig.layout || 'grid');
  const singleProductClass = products.length === 1 ? 'single-product' : '';
  cardsContainer.className = `product-cards ${layoutClass} ${singleProductClass} collapsed`.trim();

  products.forEach(product => {
    const card = createProductCard(product);
    cardsContainer.appendChild(card);
  });

  // Add click handler for expand/collapse
  expandButton.addEventListener('click', () => {
    const isCollapsed = cardsContainer.classList.contains('collapsed');
    
    if (isCollapsed) {
      cardsContainer.classList.remove('collapsed');
      cardsContainer.classList.add('expanded');
      expandButton.querySelector('.expand-text').textContent = 'Show Less';
      expandButton.querySelector('.expand-icon').style.transform = 'rotate(180deg)';
    } else {
      cardsContainer.classList.add('collapsed');
      cardsContainer.classList.remove('expanded');
      expandButton.querySelector('.expand-text').textContent = 'View All Products';
      expandButton.querySelector('.expand-icon').style.transform = 'rotate(0deg)';
    }
  });

  collapsibleWrapper.appendChild(expandButton);
  collapsibleWrapper.appendChild(cardsContainer);
  container.appendChild(collapsibleWrapper);
  
  return container;
}

/**
 * Create individual product card
 * @param {Object} product - Product data
 * @returns {HTMLElement} Product card element
 */
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = `product-card ${!product.is_available ? 'out-of-stock' : ''}`;
  card.dataset.productId = product.id;

  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image_url}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2Ii8+PHBhdGggZD0iTTIwIDEwdjIwbTEwLTEwSDEwIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg=='" />
    </div>
    
    <div class="product-info">
      <h4 class="product-name">${product.name}</h4>
      
      
      <div class="product-pricing">
        ${product.original_price ? `<span class="original-price">$${product.original_price}</span>` : ''}
        <span class="current-price">$${product.price}</span>
        <span class="currency">${product.currency}</span>
      </div>
      
      <div class="product-availability">
        <span class="availability-status ${product.is_available ? 'in-stock' : 'out-of-stock'}">
          ${product.availability}
        </span>
        <span class="shipping-info">${product.shipping_info}</span>
      </div>
      
      <div class="product-actions">
        <button class="btn-primary add-to-cart" ${!product.is_available ? 'disabled' : ''}>
          ${product.is_available ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button class="btn-secondary view-details">View Details</button>
      </div>
    </div>
  `;

  // Add click handlers
  const addToCartBtn = card.querySelector('.add-to-cart');
  const viewDetailsBtn = card.querySelector('.view-details');

  if (addToCartBtn && product.is_available) {
    addToCartBtn.addEventListener('click', () => handleAddToCart(product));
  }

  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener('click', () => handleViewDetails(product));
  }

  return card;
}


/**
 * Handle add to cart action
 * @param {Object} product - Product data
 */
function handleAddToCart(product) {
  console.log('🛒 Add to cart clicked:', product.name);
  
  // Here you would integrate with the actual e-commerce platform
  if (product.product_url) {
    window.open(product.product_url, '_blank');
  } else {
    // Show success message or trigger cart action
    showNotification(`Added ${product.name} to cart!`, 'success');
  }
}

/**
 * Handle view details action
 * @param {Object} product - Product data
 */
function handleViewDetails(product) {
  console.log('👁️ View details clicked:', product.name);
  
  if (product.product_url) {
    window.open(product.product_url, '_blank');
  } else {
    // Show product details in widget or open product page
    showProductDetails(product);
  }
}

/**
 * Show notification message
 * @param {string} message - Notification text
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
  // Create temporary notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1000000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Show product details (could be expanded into a modal)
 * @param {Object} product - Product data
 */
function showProductDetails(product) {
  // For now, just send a message asking for more details
  const input = document.querySelector('.iheard-input');
  if (input) {
    input.value = `Tell me more about ${product.name}`;
    // Trigger send message
    const sendBtn = document.querySelector('.iheard-action-btn');
    if (sendBtn) {
      sendBtn.click();
    }
  }
}

/**
 * Add agent message to chat with streaming typewriter effect
 * @param {string} message - Agent message text
 * @param {boolean} isFinal - Whether this is the final message
 */
export function addAgentMessage(message, isFinal = true) {
  removeWelcomeMessage();
  removeThinkingDots(); // Remove thinking dots when agent responds
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  if (!currentAssistantMessage) {
    // Create new assistant message
    setCurrentAssistantMessage(document.createElement('div'));
    currentAssistantMessage.className = 'iheard-message assistant-message streaming';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    currentAssistantMessage.appendChild(messageContent);

    messagesContainer.appendChild(currentAssistantMessage);
  }

  // Update content with typewriter effect
  const messageContent = currentAssistantMessage.querySelector('.message-content');
  
  if (isFinal) {
    // Keep responding state during typewriter effect if message is long enough
    const shouldShowPauseDuringTypewriter = message.length > 50; // Show pause for longer messages
    
    if (shouldShowPauseDuringTypewriter) {
      console.log('📝 Long message - keeping pause button active during typewriter effect');
      // For final messages, show the typewriter effect with pause capability
      startTypewriterEffect(messageContent, formatMessageForDisplay(message), () => {
        // Callback when typewriter completes
        finalizeBotMessage();
      });
    } else {
      console.log('📝 Short message - completing immediately');
      // Short messages complete immediately
      messageContent.innerHTML = formatMessageForDisplay(message);
      finalizeBotMessage();
    }
  } else {
    // For streaming messages, update immediately
    messageContent.innerHTML = formatMessageForDisplay(message);
  }

  function finalizeBotMessage() {
    // Finalize the message
    if (currentAssistantMessage) {
      currentAssistantMessage.classList.remove('streaming');
      currentAssistantMessage.classList.add('final');
      setCurrentAssistantMessage(null);
    }
    
    // Reset all agent states when message is complete
    setAgentProcessing(false);
    setAgentThinking(false);
    setAgentResponding(false);
    setCanInterrupt(false);
    setPauseRequested(false);
    console.log('✅ Agent message finalized - all states reset');
  }

  // DO NOT auto-scroll for agent messages - user controls scroll position
  // Agent messages appear below the current view without moving the scroll

  console.log('🤖 Agent message added:', message, 'Final:', isFinal);
  
  // Save to chat history only when message is final
  if (isFinal) {
    saveMessageToHistory(message, 'assistant');
  }
}

/**
 * Create typewriter effect for agent messages
 * @param {HTMLElement} container - The message content container
 * @param {string} htmlContent - The formatted HTML content to type out
 * @param {Function} onComplete - Callback function when typewriter completes
 */
function startTypewriterEffect(container, htmlContent, onComplete = null) {
  // Create a temporary element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Extract just the text content for typewriter effect
  const fullText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clear the container and add typewriter wrapper
  container.innerHTML = '<span class="typewriter-text"></span>';
  const typewriterSpan = container.querySelector('.typewriter-text');
  
  let currentIndex = 0;
  const typingSpeed = 15; // milliseconds per character
  let isInterrupted = false;
  
  function typeNextCharacter() {
    // Check if the user has paused/interrupted
    if (pauseRequested || isInterrupted) {
      console.log('⏸️ Typewriter effect interrupted');
      container.innerHTML = htmlContent; // Show full content immediately
      if (onComplete) onComplete();
      return;
    }
    
    if (currentIndex < fullText.length) {
      typewriterSpan.textContent += fullText.charAt(currentIndex);
      currentIndex++;
      setTimeout(typeNextCharacter, typingSpeed);
    } else {
      // Typewriter complete, show formatted HTML
      setTimeout(() => {
        container.innerHTML = htmlContent;
        if (onComplete) onComplete();
      }, 500);
    }
  }
  
  // Store interruption function for external access
  container._interruptTypewriter = () => {
    isInterrupted = true;
  };
  
  // Start typing
  typeNextCharacter();
}

/**
 * Show animated thinking dots below the user's message
 */
export function showThinkingDots() {
  // Remove any existing thinking dots
  removeThinkingDots();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  const thinkingDotsElement = document.createElement('div');
  thinkingDotsElement.className = 'iheard-thinking-dots';
  thinkingDotsElement.innerHTML = `
    <div class="thinking-dots-container">
      <div class="thinking-dot"></div>
      <div class="thinking-dot"></div>
      <div class="thinking-dot"></div>
    </div>
  `;

  messagesContainer.appendChild(thinkingDotsElement);
  
  console.log('💭 Thinking dots added');
}

/**
 * Remove thinking dots
 */
export function removeThinkingDots() {
  const existingDots = document.querySelector('.iheard-thinking-dots');
  if (existingDots) {
    existingDots.remove();
  }
}



/**
 * Create and show animated welcome message
 * @param {string} message - Welcome message text
 * @param {HTMLElement} container - Container element
 */
export function showWelcomeMessage(message, container) {
  if (!message || !container) return;
  
  // Remove any existing welcome message
  removeWelcomeMessage();
  
  // Create welcome message element
  const welcomeElement = document.createElement('div');
  welcomeElement.className = 'iheard-welcome-message';
  
  // Add default appearance class if needed
  const chatContainer = document.querySelector('.iheard-chat-container');
  if (chatContainer && chatContainer.classList.contains('default-appearance')) {
    welcomeElement.classList.add('default-appearance');
  }
  
  // Create text content container
  const textContainer = document.createElement('span');
  textContainer.className = 'welcome-text';
  
  // Create cursor element
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  
  welcomeElement.appendChild(textContainer);
  welcomeElement.appendChild(cursor);
  container.appendChild(welcomeElement);
  
  // Start typing animation
  typeWriterEffect(textContainer, message, cursor, welcomeElement);
}

/**
 * Typewriter effect for welcome message
 * @param {HTMLElement} textContainer - Container for text
 * @param {string} fullText - Full text to type
 * @param {HTMLElement} cursor - Cursor element
 * @param {HTMLElement} welcomeElement - Welcome message element
 */
function typeWriterEffect(textContainer, fullText, cursor, welcomeElement) {
  let currentIndex = 0;
  const typingSpeed = 50; // milliseconds per character
  const fadeDelay = 2000; // delay before fade out starts
  
  welcomeElement.classList.add('typing');
  
  function typeNextCharacter() {
    // Check if welcome message still exists (might be removed by user interaction)
    if (!welcomeElement.parentNode) {
      return;
    }
    
    if (currentIndex < fullText.length) {
      textContainer.textContent += fullText.charAt(currentIndex);
      currentIndex++;
      setTimeout(typeNextCharacter, typingSpeed);
    } else {
      // Typing complete - remove cursor and start fade out
      cursor.style.display = 'none';
      
      setTimeout(() => {
        if (welcomeElement.parentNode) {
          welcomeElement.classList.add('fade-out');
          
          // Remove element after fade animation
          setTimeout(() => {
            removeWelcomeMessage();
          }, 1000); // Match CSS animation duration
        }
      }, fadeDelay);
    }
  }
  
  // Start typing with initial delay
  setTimeout(typeNextCharacter, 500);
}

/**
 * Remove welcome message when chat starts
 */
export function removeWelcomeMessage() {
  const welcomeMessage = document.querySelector('.iheard-welcome-message');
  if (welcomeMessage && welcomeMessage.parentNode) {
    welcomeMessage.parentNode.removeChild(welcomeMessage);
  }
  
  // Also remove old style welcome message for compatibility
  const oldWelcomeMessage = document.querySelector('.welcome-message');
  if (oldWelcomeMessage && oldWelcomeMessage.parentNode) {
    oldWelcomeMessage.parentNode.removeChild(oldWelcomeMessage);
  }
}

/**
 * Check if a message is likely asking for products
 * @param {string} message - User message
 * @returns {boolean} True if likely a product query
 */
function isLikelyProductQuery(message) {
  const text = message.toLowerCase();
  
  // Product-related keywords
  const productKeywords = [
    'find', 'search', 'looking for', 'need', 'want', 'buy', 'purchase', 'shop', 
    'show me', 'get me', 'recommend', 'suggestion', 'available', 'have any',
    'pillow', 'light', 'lamp', 'furniture', 'decoration', 'gift', 'item', 'product',
    'cheap', 'expensive', 'budget', 'under', 'price', 'cost', 'sale', 'discount'
  ];
  
  // General conversation keywords that are NOT product queries
  const generalKeywords = [
    'hello', 'hi', 'hey', 'thanks', 'thank you', 'goodbye', 'bye',
    'what time', 'where is', 'how are you', 'weather', 'news',
    'what day', 'when is', 'what\'s up', 'how\'s it going'
  ];
  
  // Check for general conversation first
  if (generalKeywords.some(keyword => text.includes(keyword))) {
    return false;
  }
  
  // Check for product keywords
  return productKeywords.some(keyword => text.includes(keyword));
}

/**
 * Send text message to agent with real-time thinking status
 * @param {string} message - Message to send
 */
export async function sendTextMessage(message) {
  if (isConnecting || isAgentProcessing) {
    console.log('⏳ Already processing a message, please wait...');
    return;
  }

  setConnecting(true);
  setAgentProcessing(true);
  setAgentThinking(true);

  // Get messages container for thinking status
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) {
    console.error('❌ Messages container not found for thinking status');
    return;
  }
  
  // Check if this looks like a product-related query (simple heuristic)
  const isProductQuery = isLikelyProductQuery(message);
  console.log('🔍 Is product query:', isProductQuery, 'Message:', message);
  
  let thinkingStatus = null;
  if (isProductQuery) {
    console.log('🧠 Creating thinking status component for product query...');
    // Only create thinking status for product-related queries
    thinkingStatus = createThinkingStatusComponent(messagesContainer);
    console.log('✅ Thinking status component created:', !!thinkingStatus);
  }

  try {
    // Generate session ID and build user context
    const sessionId = generateSessionId();
    const userContext = getUserContext();
    
    console.log('🧠 Starting Sales Intelligence with real-time thinking...');

    // Try WebSocket first for real-time thinking status
    try {
      const response = await sendMessageWithThinkingStatus(
        message, 
        sessionId, 
        userContext,
        (statusUpdate) => {
          // Only show status updates if we have a thinking status component
          if (thinkingStatus) {
            console.log('📨 Received status update for UI:', statusUpdate);
            updateThinkingStatus(statusUpdate);
          }
        }
      );

      // Complete thinking status (only if it was created)
      if (thinkingStatus) {
        completeThinkingStatus();
      }
      
      // Transition from thinking to responding
      setAgentThinking(false);
      setAgentResponding(true);
      setCanInterrupt(true); // Enable interrupt immediately
      console.log('🎛️ Interrupt capability enabled immediately - pause button should be clickable');
      
      // Process the final response
      console.log('🎯 Processing final response:', response);
      console.log('🎯 Response type:', response?.response_type || response?.type);
      console.log('🎯 Products found:', response?.products?.length || 0, response?.products);
      
      if (response && (response.response_type === 'sales_recommendation' || response.type === 'product_recommendations') && response.products?.length > 0) {
        console.log('✅ Showing structured product response with cards');
        // Create structured response for product cards
        const structuredResponse = {
          type: 'product_recommendations',
          content: response.message,
          products: response.products,
          ui_components: response.ui_components || [{
            type: 'product_cards',
            layout: 'grid',
            max_display: 4,
            show_comparison: false,
            reasoning_visible: true
          }]
        };
        addStructuredAgentResponse(structuredResponse);
      } else {
        console.log('📝 Showing text-only response');
        // Extract the actual message content
        const messageContent = response?.message || response?.response || response?.content;
        addAgentMessage(messageContent || 'I received your message!');
      }

    } catch (wsError) {
      console.warn('⚠️ WebSocket failed, falling back to HTTP:', wsError);
      
      // Fallback to regular HTTP API
      if (thinkingStatus) {
        removeThinkingStatus();
      }
      
      const response = await sendMessageToAgent(message, sessionId, userContext);
      
      // Check if we have a structured response (product recommendations)
      if (response.type === 'product_recommendations' && response.products?.length > 0) {
        addStructuredAgentResponse(response);
      } else {
        // Standard text response
        addAgentMessage(response.response || response.message || response.content || 'I received your message!');
      }
    }

  } catch (error) {
    console.error('❌ Failed to connect to text agent:', error);
    
    // Clean up status components
    if (thinkingStatus) {
      removeThinkingStatus();
    }
    
    // Use centralized fallback response
    const fallbackResponse = getFallbackResponse(message);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    addAgentMessage(fallbackResponse);
  }

  // Only reset connecting state here - other states reset when message completes
  setConnecting(false);
}




/**
 * Clear all messages from chat
 */
export function clearMessages() {
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
    
    // Re-add animated welcome message if configured and chat is open
    if (widgetConfig.welcomeMessage) {
      const chatInterface = document.querySelector('.iheard-chat-interface');
      const isVisible = chatInterface && chatInterface.style.display !== 'none';
      
      if (isVisible) {
        showWelcomeMessage(widgetConfig.welcomeMessage, messagesContainer);
      }
    }
  }
  
  // Reset streaming message references
  setCurrentUserMessage(null);
  setCurrentAssistantMessage(null);
}

/**
 * Get message count
 * @returns {number} Number of messages in chat
 */
export function getMessageCount() {
  const messages = document.querySelectorAll('.iheard-message:not(.welcome-message):not(.iheard-welcome-message)');
  return messages.length;
}

/**
 * Export messages as text
 * @returns {string} Chat transcript
 */
export function exportChatTranscript() {
  const messages = document.querySelectorAll('.iheard-message');
  const transcript = [];
  
  messages.forEach(message => {
    const content = message.querySelector('.message-content')?.textContent;
    const isUser = message.classList.contains('user-message');
    const speaker = isUser ? 'User' : 'Assistant';
    
    if (content) {
      transcript.push(`${speaker}: ${content}`);
    }
  });
  
  return transcript.join('\n');
}

/**
 * Restore chat history from server when widget initializes
 * @param {HTMLElement} messagesContainer - Messages container element
 * @returns {Promise<boolean>} True if history was loaded, false otherwise
 */
export async function restoreChatHistory(messagesContainer) {
  try {
    // Initialize chat history service with current widget configuration
    const customerId = chatHistory.initialize({
      agentKey: currentApiKey,
      baseUrl: getTextAgentUrl()
    });
    
    console.log(`🔄 Loading chat history for customer: ${customerId}`);
    
    // Load conversation history
    const historyData = await chatHistory.load();
    
    if (!historyData || !historyData.messages || historyData.messages.length === 0) {
      console.log('📭 No chat history found or session expired');
      return false;
    }
    
    console.log(`📚 Restoring ${historyData.messages.length} messages from chat history`);
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'chat-history-loading';
    loadingIndicator.innerHTML = '<span>🔄 Restoring conversation...</span>';
    loadingIndicator.style.cssText = `
      padding: 12px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      background: rgba(0,0,0,0.05);
      border-radius: 8px;
      margin: 8px;
    `;
    messagesContainer.appendChild(loadingIndicator);
    
    // Restore messages with a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove loading indicator
    loadingIndicator.remove();
    
    // Add timestamp indicator for restored conversation
    if (historyData.messages.length > 0) {
      const firstMessage = historyData.messages[0];
      const timestamp = new Date(firstMessage.timestamp);
      const timeIndicator = document.createElement('div');
      timeIndicator.className = 'chat-history-timestamp';
      timeIndicator.innerHTML = `<span>💬 Continuing conversation from ${timestamp.toLocaleTimeString()}</span>`;
      timeIndicator.style.cssText = `
        padding: 8px 12px;
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
        background: rgba(139, 69, 19, 0.1);
        border-radius: 6px;
        margin: 8px;
        border: 1px solid rgba(139, 69, 19, 0.2);
      `;
      messagesContainer.appendChild(timeIndicator);
    }
    
    // Restore each message
    for (const message of historyData.messages) {
      if (message.role === 'user') {
        // Add user message (don't save again - already persisted)
        addUserMessageToUI(message.content);
      } else if (message.role === 'assistant') {
        // Add agent message (don't save again - already persisted)
        addAgentMessageToUI(message.content);
      }
      
      // Small delay between messages for smoother restoration
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Chat history restored successfully');
    
    // Scroll to bottom to show the most recent messages
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      console.log('📍 Scrolled to bottom after restoring chat history');
    }, 200);
    
    // Store customer preferences for future use
    if (historyData.customer_preferences) {
      console.log('👤 Customer preferences restored:', historyData.customer_preferences);
      // You could store these preferences in widget state if needed
    }
    
    return true;
    
  } catch (error) {
    console.warn('❌ Failed to restore chat history:', error);
    return false;
  }
}

/**
 * Add user message to UI without saving (for history restoration)
 * @param {string} message - Message content
 */
function addUserMessageToUI(message) {
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  const messageElement = document.createElement('div');
  messageElement.className = 'iheard-message user-message';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = message;

  messageElement.appendChild(messageContent);
  messagesContainer.appendChild(messageElement);
}

/**
 * Add agent message to UI without saving (for history restoration)  
 * @param {string} message - Message content (could be JSON for structured responses)
 */
function addAgentMessageToUI(message) {
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  // Try to parse message as JSON to see if it's a structured response
  let structuredData = null;
  try {
    const parsed = JSON.parse(message);
    if (parsed.type === 'structured_response') {
      structuredData = parsed;
    }
  } catch (e) {
    // Not JSON, treat as regular text message
  }

  if (structuredData) {
    // Restore structured response with product cards
    restoreStructuredResponse(structuredData, messagesContainer);
  } else {
    // Regular text message
    const messageElement = document.createElement('div');
    messageElement.className = 'iheard-message assistant-message';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatMessageForDisplay(message);

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
  }
}

/**
 * Restore structured response with products from chat history
 * @param {Object} structuredData - Parsed structured response data
 * @param {HTMLElement} messagesContainer - Messages container
 */
function restoreStructuredResponse(structuredData, messagesContainer) {
  // Create message container
  const messageElement = document.createElement('div');
  messageElement.className = 'iheard-message assistant-message structured-response';

  // Add text content if present
  if (structuredData.content) {
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatMessageForDisplay(structuredData.content);
    messageElement.appendChild(messageContent);
  }

  // Add product cards if present
  if (structuredData.response_type === 'product_recommendations' && structuredData.products?.length > 0) {
    const productCards = createProductCards(structuredData.products, structuredData.ui_components?.[0]);
    messageElement.appendChild(productCards);
  }

  messagesContainer.appendChild(messageElement);
  console.log('🔄 Restored structured response with', structuredData.products?.length || 0, 'products');
}

/**
 * Local session message storage and analytics tracking
 */
let sessionMessages = [];
let sessionStartTime = Date.now();
let lastPeriodicSave = Date.now();
let sessionAnalyticsSent = false;

/**
 * Save message with hybrid approach: immediate analytics + batched content
 * @param {string} message - Message content  
 * @param {string} role - Message role ('user' or 'assistant')
 */
function saveMessageToHistory(message, role = 'user') {
  if (!currentApiKey) return;
  
  // Store message locally for batching
  const messageData = {
    role,
    content: message,
    timestamp: new Date().toISOString(),
    session_id: getCurrentSessionId()
  };
  
  sessionMessages.push(messageData);
  console.log(`💾 Message queued (${sessionMessages.length} total):`, role, message.substring(0, 50) + '...');
  
  // Send session analytics immediately (lightweight)
  updateSessionAnalytics();
  
  // Batch save messages periodically (every 5 messages or 2 minutes)
  const shouldPeriodicSave = (
    sessionMessages.length % 5 === 0 || // Every 5 messages
    (Date.now() - lastPeriodicSave) > 120000 // Every 2 minutes
  );
  
  if (shouldPeriodicSave) {
    saveMessagesBatch();
  }
}

/**
 * Get current session ID for message tracking
 */
function getCurrentSessionId() {
  // Try to get from current context or generate one
  if (currentCustomerId) {
    return `cs_${currentCustomerId}_${sessionStartTime}`;
  }
  return `session_${sessionStartTime}`;
}

/**
 * Update session analytics immediately (lightweight data for real-time tracking)
 */
function updateSessionAnalytics() {
  if (!currentApiKey) return;
  
  const sessionId = getCurrentSessionId();
  const analyticsData = {
    session_id: sessionId,
    message_count: sessionMessages.length,
    last_activity: new Date().toISOString(),
    customer_id: currentCustomerId || 'anonymous',
    agent_id: currentAgentId || 'text-agent'
  };
  
  // Send lightweight analytics data immediately
  fetch(`${getTextAgentUrl()}/api/session/analytics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentApiKey}`
    },
    body: JSON.stringify(analyticsData)
  }).then(response => {
    if (response.ok) {
      console.log(`📊 Session analytics updated: ${sessionMessages.length} messages`);
    } else {
      console.warn('⚠️ Failed to update session analytics:', response.status);
    }
  }).catch(error => {
    console.warn('⚠️ Analytics update error:', error);
  });
}

/**
 * Save accumulated messages to database in batches
 */
function saveMessagesBatch() {
  if (!currentApiKey || sessionMessages.length === 0) return;
  
  const messagesToSave = [...sessionMessages]; // Copy array
  sessionMessages.length = 0; // Clear the queue
  lastPeriodicSave = Date.now();
  
  console.log(`💾 Saving batch of ${messagesToSave.length} messages...`);
  
  // Send batch of messages to database
  fetch(`${getTextAgentUrl()}/api/chat/messages/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentApiKey}`
    },
    body: JSON.stringify({
      messages: messagesToSave,
      customer_id: currentCustomerId || 'anonymous',
      agent_id: currentAgentId || 'text-agent'
    })
  }).then(response => {
    if (response.ok) {
      console.log(`✅ Batch saved successfully: ${messagesToSave.length} messages`);
    } else {
      console.warn('⚠️ Failed to save message batch:', response.status);
      // Re-add messages to queue on failure
      sessionMessages.unshift(...messagesToSave);
    }
  }).catch(error => {
    console.error('❌ Batch save error:', error);
    // Re-add messages to queue on error
    sessionMessages.unshift(...messagesToSave);
  });
}

/**
 * Save all session messages to database (called on session end)
 */
async function saveSessionToDatabase() {
  if (!currentApiKey || sessionMessages.length === 0) {
    console.log('💾 No messages to save or missing API key');
    return true;
  }
  
  console.log(`💾 Saving ${sessionMessages.length} messages to database...`);
  
  try {
    // Save all remaining messages in one final batch
    if (sessionMessages.length > 0) {
      await saveMessagesBatch();
    }
    
    console.log('✅ All session messages saved to database successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to save session messages to database:', error);
    return false;
  }
}

/**
 * Get current session message count
 */
function getSessionMessageCount() {
  return sessionMessages.length;
}

// Export the helpers for use in other modules if needed
export { saveMessageToHistory, saveSessionToDatabase, getSessionMessageCount };

/**
 * End Chat Button Management
 * Shows/hides end chat button based on user activity
 */
let endChatTimer = null;
let endChatButton = null;
const END_CHAT_TIMEOUT = 10000; // 10 seconds

/**
 * Start or restart the end chat inactivity timer
 */
export function startEndChatTimer() {
  // Clear existing timer
  clearEndChatTimer();
  
  // Start new timer
  endChatTimer = setTimeout(() => {
    showEndChatButton();
  }, END_CHAT_TIMEOUT);
}

/**
 * Clear the end chat timer and hide button
 */
export function clearEndChatTimer() {
  if (endChatTimer) {
    clearTimeout(endChatTimer);
    endChatTimer = null;
  }
  hideEndChatButton();
}

/**
 * Show the end chat button
 */
function showEndChatButton() {
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer || endChatButton) return; // Don't create multiple buttons
  
  // Check if there are any messages before showing the button
  const messageCount = getMessageCount();
  if (messageCount === 0) return;
  
  endChatButton = document.createElement('div');
  endChatButton.className = 'iheard-end-chat-container';
  endChatButton.innerHTML = `
    <button class="iheard-end-chat-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
      End Chat
    </button>
  `;
  
  // Add click handler
  const button = endChatButton.querySelector('.iheard-end-chat-btn');
  button.addEventListener('click', handleEndChat);
  
  messagesContainer.appendChild(endChatButton);
  
  // Scroll to show the button
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
  
  console.log('📞 End chat button displayed after inactivity');
}

/**
 * Hide the end chat button
 */
function hideEndChatButton() {
  if (endChatButton && endChatButton.parentNode) {
    endChatButton.parentNode.removeChild(endChatButton);
    endChatButton = null;
    console.log('📞 End chat button hidden');
  }
}

/**
 * Handle end chat button click
 */
async function handleEndChat() {
  try {
    console.log('📞 End chat requested by user');
    
    const button = endChatButton.querySelector('.iheard-end-chat-btn');
    
    // Check if we're already in confirmation state
    if (button.classList.contains('confirmation-mode')) {
      // User clicked confirm - proceed with archiving
      button.disabled = true;
      button.textContent = 'Ending Chat...';
      button.style.background = '#6b7280'; // Gray while processing
      
      // Save any remaining messages and archive the session
      await saveSessionToDatabase();
      const success = await archiveCurrentSession();
      
      if (success) {
        // Show success message
        addSystemMessage('Chat session ended successfully. Thank you for using our service!');
        
        // Clear the chat after a delay
        setTimeout(() => {
          clearMessages();
        }, 3000);
        
        // Close the widget
        setTimeout(() => {
          const chatInterface = document.querySelector('.iheard-chat-interface');
          if (chatInterface) {
            chatInterface.style.display = 'none';
          }
        }, 5000);
      } else {
        // Show error and reset button
        addSystemMessage('Failed to end chat session. Please try again.');
        resetEndChatButton();
      }
    } else {
      // First click - show confirmation
      showEndChatConfirmation();
    }
  } catch (error) {
    console.error('❌ Error ending chat:', error);
    addSystemMessage('An error occurred while ending the chat. Please try again.');
    resetEndChatButton();
  }
}

/**
 * Show inline confirmation for ending chat
 */
function showEndChatConfirmation() {
  const button = endChatButton.querySelector('.iheard-end-chat-btn');
  
  // Update button to confirmation state
  button.classList.add('confirmation-mode');
  button.style.background = '#dc2626'; // Red background
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 12l2 2 4-4"/>
    </svg>
    Confirm End Chat
  `;
  
  // Update container to show warning message
  const alertMessage = document.createElement('div');
  alertMessage.className = 'iheard-end-chat-alert';
  alertMessage.innerHTML = `
    <div class="alert-text">⚠️ This will archive your conversation and end the chat session.</div>
    <div class="alert-actions">
      <button class="cancel-btn">Cancel</button>
    </div>
  `;
  
  endChatButton.appendChild(alertMessage);
  
  // Add cancel button handler
  const cancelBtn = alertMessage.querySelector('.cancel-btn');
  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetEndChatButton();
  });
  
  // Auto-reset after 10 seconds if no action
  setTimeout(() => {
    if (button.classList.contains('confirmation-mode')) {
      resetEndChatButton();
    }
  }, 10000);
}

/**
 * Reset end chat button to original state
 */
function resetEndChatButton() {
  if (!endChatButton) return;
  
  const button = endChatButton.querySelector('.iheard-end-chat-btn');
  const alertMessage = endChatButton.querySelector('.iheard-end-chat-alert');
  
  // Remove confirmation state
  button.classList.remove('confirmation-mode');
  button.disabled = false;
  
  // Reset button content and color
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
    End Chat
  `;
  
  // Reset color to theme color (will be applied by dynamic styles)
  button.style.background = '';
  
  // Remove alert message if present
  if (alertMessage) {
    alertMessage.remove();
  }
}

/**
 * Archive the current customer session
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function archiveCurrentSession() {
  try {
    const userContext = getUserContext();
    if (!userContext.agent_key || !userContext.user_id) {
      console.warn('⚠️ Cannot archive session - missing agent_key or user_id');
      return false;
    }
    
    // Try text-agent-server first (primary archive endpoint)
    let archiveUrl = `${getTextAgentUrl()}/api/session/archive`;
    console.log('📦 Attempting to archive session via text-agent-server:', archiveUrl);
    
    try {
      const response = await fetch(archiveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_key: userContext.agent_key,
          customer_id: userContext.user_id,
          archived_by: 'user',
          archive_reason: 'user_ended_chat'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Session archived successfully via text-agent-server:', result);
        return true;
      } else {
        console.warn('⚠️ Text-agent-server archive failed:', response.status, response.statusText);
        throw new Error(`Text agent archive failed: ${response.status}`);
      }
    } catch (textAgentError) {
      console.warn('⚠️ Text-agent-server not available, trying voice-agent-server fallback');
      
      // Fallback to voice-agent-server if text-agent-server fails
      // Determine voice-agent-server URL by trying common ports
      const textUrl = getTextAgentUrl();
      let voiceAgentUrl;
      
      if (textUrl.includes(':8080')) {
        // Standard development setup
        voiceAgentUrl = textUrl.replace(':8080', ':8001');
      } else if (textUrl.includes(':3000')) {
        // Alternative setup
        voiceAgentUrl = textUrl.replace(':3000', ':8001');
      } else if (textUrl.includes('localhost')) {
        // Generic localhost fallback
        voiceAgentUrl = 'http://localhost:8001';
      } else {
        // Production or custom setup - try port 8001
        const url = new URL(textUrl);
        voiceAgentUrl = `${url.protocol}//${url.hostname}:8001`;
      }
      
      archiveUrl = `${voiceAgentUrl}/api/session/archive`;
      console.log('📦 Attempting fallback archive via voice-agent-server:', archiveUrl);
      
      try {
        const fallbackResponse = await fetch(archiveUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_key: userContext.agent_key,
            customer_id: userContext.user_id,
            archived_by: 'user',
            archive_reason: 'user_ended_chat'
          })
        });
        
        if (fallbackResponse.ok) {
          const result = await fallbackResponse.json();
          console.log('✅ Session archived successfully via voice-agent-server fallback:', result);
          return true;
        } else {
          console.error('❌ Voice-agent-server archive also failed:', fallbackResponse.status, fallbackResponse.statusText);
          
          // Last resort: try common voice-agent ports
          const commonPorts = ['8001', '8002', '3001'];
          for (const port of commonPorts) {
            if (voiceAgentUrl.includes(`:${port}`)) continue; // Skip if already tried
            
            try {
              const lastResortUrl = `http://localhost:${port}/api/session/archive`;
              console.log(`📦 Last resort attempt on port ${port}:`, lastResortUrl);
              
              const lastResortResponse = await fetch(lastResortUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  agent_key: userContext.agent_key,
                  customer_id: userContext.user_id,
                  archived_by: 'user',
                  archive_reason: 'user_ended_chat'
                })
              });
              
              if (lastResortResponse.ok) {
                const result = await lastResortResponse.json();
                console.log(`✅ Session archived successfully via port ${port}:`, result);
                return true;
              }
            } catch (portError) {
              console.warn(`⚠️ Port ${port} also failed:`, portError.message);
            }
          }
          
          return false;
        }
      } catch (voiceAgentError) {
        console.error('❌ Voice-agent-server connection failed, trying last resort ports:', voiceAgentError);
        
        // Emergency fallback: try all common ports
        const commonPorts = ['8001', '8002', '3001'];
        for (const port of commonPorts) {
          try {
            const emergencyUrl = `http://localhost:${port}/api/session/archive`;
            console.log(`📦 Emergency attempt on port ${port}:`, emergencyUrl);
            
            const emergencyResponse = await fetch(emergencyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                agent_key: userContext.agent_key,
                customer_id: userContext.user_id,
                archived_by: 'user',
                archive_reason: 'user_ended_chat'
              })
            });
            
            if (emergencyResponse.ok) {
              const result = await emergencyResponse.json();
              console.log(`✅ Session archived successfully via emergency port ${port}:`, result);
              return true;
            }
          } catch (emergencyError) {
            console.warn(`⚠️ Emergency port ${port} failed:`, emergencyError.message);
          }
        }
        
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Error archiving session:', error);
    return false;
  }
}

/**
 * Add a system message (different from user/assistant messages)
 * @param {string} message - System message text
 */
function addSystemMessage(message) {
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  const messageElement = document.createElement('div');
  messageElement.className = 'iheard-message system-message';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = message;

  messageElement.appendChild(messageContent);
  messagesContainer.appendChild(messageElement);
  
  // Scroll to show the system message
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  console.log('🔔 System message added:', message);
}