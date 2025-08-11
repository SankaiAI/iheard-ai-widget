/**
 * Chat History Service
 * Handles persistent customer conversation history with cloud storage
 */

import { generateCustomerId } from '../core/customer-id.js';
import { getTextAgentUrl } from './text-agent.js';

/**
 * Chat History Service Class
 */
export class ChatHistoryService {
    constructor(baseUrl = null, agentKey = null) {
        // Use the same base URL as text-agent API
        this.baseUrl = baseUrl || this.getTextAgentUrl();
        console.log(`🔗 ChatHistoryService initialized with baseUrl: ${this.baseUrl}`);
        this.agentKey = agentKey || window.iHeardConfig?.agentKey || null;
        this.customerId = null;
        this.messageQueue = []; // Queue for offline messages
        this.isOnline = navigator.onLine;
        this.rateLimitDelay = 1000; // 1 second between saves
        this.lastSaveTime = 0;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingMessages();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    
    /**
     * Get text agent URL using the same logic as the main text agent API
     * @returns {string} Text agent URL
     */
    getTextAgentUrl() {
        try {
            return getTextAgentUrl();
        } catch (error) {
            console.warn('Failed to get text agent URL, using fallback:', error);
            return 'https://text-agent-server-production.up.railway.app';
        }
    }
    
    /**
     * Initialize the service and get customer ID
     */
    initialize() {
        if (!this.customerId) {
            this.customerId = generateCustomerId();
            console.log(`💾 Chat history initialized for customer: ${this.customerId}`);
        }
        
        if (!this.agentKey) {
            console.warn('⚠️ Chat history service initialized without agent key');
        } else {
            console.log(`🔑 Chat history service using agent key: ${this.agentKey.substring(0, 8)}...`);
        }
        
        console.log(`🌐 Chat history service API URL: ${this.baseUrl}`);
        
        return this.customerId;
    }
    
    /**
     * Load conversation history from the server
     * @returns {Promise<Object|null>} History data or null if not found
     */
    async loadHistory() {
        if (!this.agentKey || !this.customerId) {
            console.warn('Cannot load history: missing agent key or customer ID');
            return null;
        }
        
        try {
            const url = `${this.baseUrl}/api/v1/chat/history/${encodeURIComponent(this.agentKey)}/${encodeURIComponent(this.customerId)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add timeout
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('No previous conversation history found');
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.session_valid) {
                console.log(`Loaded ${data.messages.length} messages from chat history`);
                return {
                    messages: data.messages || [],
                    customer_preferences: data.customer_preferences || {},
                    session_valid: data.session_valid
                };
            } else {
                console.log('No valid session found or session expired');
                return null;
            }
            
        } catch (error) {
            console.warn('Failed to load chat history:', error);
            return null;
        }
    }
    
    /**
     * Save a message to the server
     * @param {string} message - Message content
     * @param {string} role - Message role ('user' or 'assistant')
     * @param {Array} productsReferenced - Array of product IDs mentioned
     * @param {string} timestamp - Message timestamp (optional)
     * @returns {Promise<boolean>} Success status
     */
    async saveMessage(message, role = 'user', productsReferenced = [], timestamp = null) {
        if (!this.agentKey || !this.customerId) {
            console.warn('Cannot save message: missing agent key or customer ID');
            return false;
        }
        
        // Rate limiting
        const now = Date.now();
        if (now - this.lastSaveTime < this.rateLimitDelay) {
            console.log('Rate limiting: queueing message for later save');
            this.queueMessage({ message, role, productsReferenced, timestamp });
            return true;
        }
        
        const messageData = {
            agent_key: this.agentKey,
            customer_id: this.customerId,
            message: message,
            role: role,
            products_referenced: productsReferenced,
            timestamp: timestamp || new Date().toISOString()
        };
        
        console.log('📤 Sending message data to chat history API:', messageData);
        
        if (!this.isOnline) {
            console.log('Offline: queueing message for later save');
            this.queueMessage(messageData);
            return true;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            this.lastSaveTime = now;
            
            console.log('💾 Chat history save response:', result);
            
            if (result.success) {
                console.log(`Message saved to chat history: ${role} - ${message.substring(0, 50)}...`);
                return true;
            } else {
                console.error('❌ Chat history save failed with response:', result);
                throw new Error(result.error || 'Save failed');
            }
            
        } catch (error) {
            console.warn('Failed to save message to chat history:', error);
            // Queue for retry
            this.queueMessage(messageData);
            return false;
        }
    }
    
    /**
     * Update session activity (products viewed, preferences learned)
     * @param {Array} productsViewed - Array of product IDs viewed
     * @param {Object} preferences - Customer preferences to update
     * @returns {Promise<boolean>} Success status
     */
    async updateActivity(productsViewed = null, preferences = null) {
        if (!this.agentKey || !this.customerId || (!productsViewed && !preferences)) {
            return false;
        }
        
        const activityData = {
            agent_key: this.agentKey,
            customer_id: this.customerId,
            products_viewed: productsViewed,
            preferences: preferences
        };
        
        if (!this.isOnline) {
            console.log('Offline: skipping activity update');
            return false;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/chat/session/activity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityData),
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Session activity updated');
                return true;
            } else {
                throw new Error(result.error || 'Activity update failed');
            }
            
        } catch (error) {
            console.warn('Failed to update session activity:', error);
            return false;
        }
    }
    
    /**
     * Queue message for later sending
     * @param {Object} messageData - Message data to queue
     */
    queueMessage(messageData) {
        this.messageQueue.push({
            ...messageData,
            queued_at: Date.now()
        });
        
        // Limit queue size to prevent memory issues
        if (this.messageQueue.length > 50) {
            this.messageQueue = this.messageQueue.slice(-25); // Keep last 25
        }
    }
    
    /**
     * Process pending messages when back online
     */
    async processPendingMessages() {
        if (!this.isOnline || this.messageQueue.length === 0) {
            return;
        }
        
        console.log(`Processing ${this.messageQueue.length} queued messages`);
        
        const messages = [...this.messageQueue];
        this.messageQueue = [];
        
        for (const messageData of messages) {
            try {
                // Remove queued_at timestamp before sending
                const { queued_at, ...cleanData } = messageData;
                
                const response = await fetch(`${this.baseUrl}/api/v1/chat/message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cleanData),
                    signal: AbortSignal.timeout(5000)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const result = await response.json();
                if (result.success) {
                    console.log('Queued message sent successfully');
                } else {
                    throw new Error(result.error);
                }
                
                // Small delay between messages
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.warn('Failed to send queued message:', error);
                // Re-queue failed message
                this.messageQueue.push(messageData);
            }
        }
    }
    
    /**
     * Update configuration (agent key, base URL)
     * @param {Object} config - Configuration updates
     */
    updateConfig(config) {
        if (config.agentKey) {
            this.agentKey = config.agentKey;
        }
        if (config.baseUrl) {
            this.baseUrl = config.baseUrl;
        }
        
        console.log('Chat history service config updated');
    }
    
    /**
     * Get service status for debugging
     * @returns {Object} Service status
     */
    getStatus() {
        return {
            initialized: !!this.customerId,
            customerId: this.customerId,
            agentKey: this.agentKey ? `${this.agentKey.substring(0, 8)}...` : null,
            isOnline: this.isOnline,
            queuedMessages: this.messageQueue.length,
            baseUrl: this.baseUrl
        };
    }
}

// Create global service instance
let chatHistoryService = null;

/**
 * Get or create the global chat history service instance
 * @param {Object} config - Configuration for the service
 * @returns {ChatHistoryService} Service instance
 */
export function getChatHistoryService(config = {}) {
    if (!chatHistoryService) {
        chatHistoryService = new ChatHistoryService(config.baseUrl, config.agentKey);
    } else if (config.agentKey || config.baseUrl) {
        // Update config if provided
        chatHistoryService.updateConfig(config);
    }
    
    return chatHistoryService;
}

/**
 * Reset the global service instance (for testing)
 */
export function resetChatHistoryService() {
    chatHistoryService = null;
}

// Convenient wrapper functions
export const chatHistory = {
    /**
     * Initialize chat history service
     * @param {Object} config - Service configuration
     * @returns {string} Customer ID
     */
    initialize(config = {}) {
        const service = getChatHistoryService(config);
        return service.initialize();
    },
    
    /**
     * Load conversation history
     * @returns {Promise<Object|null>} History data
     */
    async load() {
        const service = getChatHistoryService();
        return service.loadHistory();
    },
    
    /**
     * Save user message
     * @param {string} message - Message content
     * @param {Array} products - Referenced products
     * @returns {Promise<boolean>} Success status
     */
    async saveUserMessage(message, products = []) {
        const service = getChatHistoryService();
        return service.saveMessage(message, 'user', products);
    },
    
    /**
     * Save agent message
     * @param {string} message - Message content
     * @param {Array} products - Referenced products
     * @returns {Promise<boolean>} Success status
     */
    async saveAgentMessage(message, products = []) {
        const service = getChatHistoryService();
        return service.saveMessage(message, 'assistant', products);
    },
    
    /**
     * Update customer activity
     * @param {Array} productsViewed - Products viewed
     * @param {Object} preferences - Customer preferences
     * @returns {Promise<boolean>} Success status
     */
    async updateActivity(productsViewed, preferences) {
        const service = getChatHistoryService();
        return service.updateActivity(productsViewed, preferences);
    },
    
    /**
     * Get service status
     * @returns {Object} Service status
     */
    getStatus() {
        const service = getChatHistoryService();
        return service.getStatus();
    }
};