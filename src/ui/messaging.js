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
  currentAgentId
} from '../core/state.js';
import { widgetConfig } from '../core/config.js';
import { 
  getTextAgentUrl,
  sendMessageToAgent,
  getFallbackResponse,
  generateSessionId
} from '../api/index.js';

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
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log('👤 User message added:', message);
}

/**
 * Add structured agent response with UI components (product cards, etc.)
 * @param {Object} response - Structured response from agent
 */
export function addStructuredAgentResponse(response) {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  // Create message container
  const messageElement = document.createElement('div');
  messageElement.className = 'iheard-message assistant-message structured-response';

  // Add text content if present
  if (response.content) {
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = response.content;
    messageElement.appendChild(messageContent);
  }

  // Add UI components based on response type
  if (response.type === 'product_recommendations' && response.products?.length > 0) {
    const productCards = createProductCards(response.products, response.ui_components?.[0]);
    messageElement.appendChild(productCards);
  }

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log('🤖 Structured agent response added:', response.type);
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
  const layoutClass = uiConfig.layout || 'grid';
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
 * Add agent message to chat with streaming support
 * @param {string} message - Agent message text
 * @param {boolean} isFinal - Whether this is the final message
 */
export function addAgentMessage(message, isFinal = true) {
  removeWelcomeMessage();
  
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

  // Update content
  const messageContent = currentAssistantMessage.querySelector('.message-content');
  messageContent.textContent = message;

  if (isFinal) {
    // Finalize the message
    currentAssistantMessage.classList.remove('streaming');
    currentAssistantMessage.classList.add('final');
    setCurrentAssistantMessage(null);
  }

  // Auto-scroll
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log('🤖 Agent message added:', message, 'Final:', isFinal);
}

/**
 * Show typing indicator
 * @returns {HTMLElement} Typing indicator element
 */
export function showTypingIndicator() {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return null;

  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'iheard-typing-indicator';
  typingIndicator.innerHTML = `
    <div class="message-content">
      <span>AI is thinking</span>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;

  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return typingIndicator;
}

/**
 * Hide typing indicator
 * @param {HTMLElement} indicator - Typing indicator element to remove
 */
export function hideTypingIndicator(indicator) {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
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
 * Send text message to agent
 * @param {string} message - Message to send
 */
export async function sendTextMessage(message) {
  if (isConnecting) {
    console.log('⏳ Already processing a message, please wait...');
    return;
  }

  setConnecting(true);

  // Show typing indicator
  const typingIndicator = showTypingIndicator();

  try {
    // Use the centralized API function
    const sessionId = generateSessionId();
    
    // Build user context for store-specific product search
    const userContext = getUserContext();
    
    const response = await sendMessageToAgent(message, sessionId, userContext);
    
    // Hide typing indicator
    hideTypingIndicator(typingIndicator);
    
    // Check if we have a structured response (product recommendations)
    if (response.type === 'product_recommendations' && response.products?.length > 0) {
      addStructuredAgentResponse(response);
    } else {
      // Standard text response
      addAgentMessage(response.response || response.message || response.content || 'I received your message!');
    }

  } catch (error) {
    console.error('❌ Failed to connect to text agent:', error);
    
    // Hide typing indicator on error
    hideTypingIndicator(typingIndicator);
    
    // Use centralized fallback response
    const fallbackResponse = getFallbackResponse(message);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    addAgentMessage(fallbackResponse);
  }

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