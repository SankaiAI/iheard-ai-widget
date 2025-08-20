/**
 * WebSocket handler for real-time thinking status updates
 * Connects to text-agent-server WebSocket endpoint for Sales Intelligence streaming
 */

import { getTextAgentUrl } from '../core/environment.js';

class ThinkingStatusWebSocket {
    constructor() {
        this.ws = null;
        this.sessionId = null;
        this.isConnected = false;
        this.statusCallback = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.reconnectDelay = 1000; // 1 second
    }

    /**
     * Connect to WebSocket for real-time thinking status
     * @param {string} sessionId - Session ID for the conversation
     * @param {function} statusCallback - Callback for status updates
     */
    async connect(sessionId, statusCallback) {
        this.sessionId = sessionId;
        this.statusCallback = statusCallback;

        try {
            const textAgentUrl = getTextAgentUrl();
            const wsUrl = textAgentUrl.replace('http://', 'ws://').replace('https://', 'wss://');
            const wsEndpoint = `${wsUrl}/chat/stream/${sessionId}`;

            console.log('🔌 Connecting to thinking status WebSocket:', wsEndpoint);

            this.ws = new WebSocket(wsEndpoint);

            this.ws.onopen = () => {
                console.log('✅ Thinking status WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const statusUpdate = JSON.parse(event.data);
                    console.log('📊 Received thinking status:', statusUpdate);
                    
                    if (this.statusCallback) {
                        this.statusCallback(statusUpdate);
                    }
                } catch (error) {
                    console.error('❌ Error parsing status update:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('🔌 Thinking status WebSocket closed:', event.code, event.reason);
                this.isConnected = false;

                // Attempt to reconnect if it wasn't a normal closure
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        console.log(`🔄 Reconnecting to thinking status WebSocket (attempt ${this.reconnectAttempts})`);
                        this.connect(this.sessionId, this.statusCallback);
                    }, this.reconnectDelay * this.reconnectAttempts);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ Thinking status WebSocket error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to connect to thinking status WebSocket:', error);
        }
    }

    /**
     * Send message through WebSocket and receive real-time updates
     * @param {string} message - Message to send
     * @param {Object} userContext - User context for the request
     */
    sendMessage(message, userContext = {}) {
        console.log('🔍 WebSocket send check - isConnected:', this.isConnected, 'ws exists:', !!this.ws, 'ws.readyState:', this.ws?.readyState);
        
        if (!this.isConnected || !this.ws) {
            console.error('❌ WebSocket not connected for message sending');
            return false;
        }

        const messageData = {
            message: message,
            session_id: this.sessionId,
            user_metadata: userContext.metadata || {},
            user_id: userContext.user_id || null,
            agent_key: userContext.agent_key || null,
            store_id: userContext.store_id || null
        };

        console.log('📤 Preparing to send WebSocket message:', messageData);

        try {
            this.ws.send(JSON.stringify(messageData));
            console.log('✅ Message sent successfully through WebSocket');
            return true;
        } catch (error) {
            console.error('❌ Failed to send message through WebSocket:', error);
            return false;
        }
    }

    /**
     * Send interrupt signal to stop agent processing
     */
    sendInterrupt() {
        if (!this.ws || !this.isConnected) {
            console.warn('⚠️ Cannot send interrupt - WebSocket not connected');
            return false;
        }

        const interruptData = {
            type: 'interrupt',
            session_id: this.sessionId,
            action: 'stop_processing',
            timestamp: new Date().toISOString()
        };

        try {
            this.ws.send(JSON.stringify(interruptData));
            console.log('⏸️ Interrupt signal sent to backend');
            return true;
        } catch (error) {
            console.error('❌ Failed to send interrupt signal:', error);
            return false;
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.ws) {
            console.log('🔌 Disconnecting thinking status WebSocket');
            this.isConnected = false;
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
    }
}

// Global WebSocket instance
let thinkingWebSocket = null;

/**
 * Get or create WebSocket instance
 * @returns {ThinkingStatusWebSocket}
 */
export function getThinkingWebSocket() {
    if (!thinkingWebSocket) {
        thinkingWebSocket = new ThinkingStatusWebSocket();
    }
    return thinkingWebSocket;
}

/**
 * Send message with real-time thinking status updates
 * @param {string} message - Message to send
 * @param {string} sessionId - Session ID
 * @param {Object} userContext - User context
 * @param {function} statusCallback - Callback for status updates
 * @returns {Promise<Object>} Final response
 */
export async function sendMessageWithThinkingStatus(message, sessionId, userContext, statusCallback) {
    return new Promise(async (resolve, reject) => {
        const ws = getThinkingWebSocket();
        
        let finalResponse = null;
        let hasResolved = false;

        // Enhanced status callback that captures final response
        const enhancedStatusCallback = (statusUpdate) => {
            // Call the original status callback
            if (statusCallback) {
                statusCallback(statusUpdate);
            }

            // Check if this is the final response
            if (statusUpdate.type === 'final_response' || statusUpdate.final_response) {
                finalResponse = statusUpdate;
                console.log('🎯 Received final structured response:', finalResponse);
                if (!hasResolved) {
                    hasResolved = true;
                    resolve(finalResponse);
                }
            }
        };

        try {
            // Connect to WebSocket and wait for it to be ready
            await ws.connect(sessionId, enhancedStatusCallback);

            // Wait for WebSocket to be fully connected before sending message
            const waitForConnection = () => {
                if (ws.isConnected && ws.ws && ws.ws.readyState === WebSocket.OPEN) {
                    console.log('📤 Attempting to send message through WebSocket...');
                    // Send the message
                    const success = ws.sendMessage(message, userContext);
                    console.log('📤 WebSocket send result:', success);
                    if (!success) {
                        // Fallback to HTTP if WebSocket fails
                        console.warn('⚠️ WebSocket send failed, falling back to HTTP');
                        ws.disconnect();
                        reject(new Error('WebSocket send failed'));
                    } else {
                        console.log('✅ Message sent successfully through WebSocket');
                    }
                } else {
                    console.log('⏳ Waiting for WebSocket connection...', {
                        isConnected: ws.isConnected,
                        readyState: ws.ws?.readyState,
                        expected: WebSocket.OPEN
                    });
                    // Check again in 50ms
                    setTimeout(waitForConnection, 50);
                }
            };

            // Start waiting for connection
            setTimeout(waitForConnection, 100);

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!hasResolved) {
                    hasResolved = true;
                    ws.disconnect();
                    reject(new Error('Thinking status timeout'));
                }
            }, 30000);

        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            ws.disconnect();
            reject(error);
        }
    });
}

/**
 * Send interrupt signal to stop agent processing
 * @returns {boolean} True if interrupt was sent successfully
 */
export function sendAgentInterrupt() {
    const ws = getThinkingWebSocket();
    return ws.sendInterrupt();
}

/**
 * Clean up WebSocket connections
 */
export function cleanupThinkingWebSocket() {
    if (thinkingWebSocket) {
        thinkingWebSocket.disconnect();
        thinkingWebSocket = null;
    }
}