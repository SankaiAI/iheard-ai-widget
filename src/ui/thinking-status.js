/**
 * Real-time thinking status UI component for Sales Intelligence
 * Shows the AI's reasoning process in real-time
 */

/**
 * Create and show thinking status component
 * @param {HTMLElement} container - Container to add the status to
 * @returns {HTMLElement} Status component element
 */
export function createThinkingStatusComponent(container) {
    // Remove any existing thinking status
    removeThinkingStatus();

    const statusComponent = document.createElement('div');
    statusComponent.className = 'iheard-thinking-status';
    statusComponent.innerHTML = `
        <div class="thinking-header">
            <div class="thinking-icon">
                <div class="thinking-spinner"></div>
            </div>
            <span class="thinking-title">AI is thinking...</span>
            <div class="thinking-progress">
                <div class="thinking-progress-bar">
                    <div class="thinking-progress-fill"></div>
                </div>
                <span class="thinking-percentage">0%</span>
            </div>
        </div>
        <div class="thinking-status-list">
            <div class="status-item active">
                <span class="status-text">Initializing...</span>
                <span class="status-timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
            </div>
        </div>
    `;

    // Add CSS styles
    addThinkingStatusStyles();

    container.appendChild(statusComponent);
    return statusComponent;
}

/**
 * Update thinking status with real-time progress
 * @param {Object} statusUpdate - Status update from WebSocket
 */
export function updateThinkingStatus(statusUpdate) {
    // Skip connection_established and final_response messages
    if (statusUpdate.type === 'connection_established' || statusUpdate.type === 'final_response') {
        console.log(`🔌 WebSocket ${statusUpdate.type} message received`);
        return;
    }

    // Only process thinking_status messages
    if (statusUpdate.type !== 'thinking_status') {
        return;
    }

    let statusComponent = document.querySelector('.iheard-thinking-status');
    if (!statusComponent) {
        console.warn('❌ Thinking status component not found! Creating it...');
        // Try to create the component if it doesn't exist
        const messagesContainer = document.querySelector('.iheard-chat-messages');
        if (messagesContainer) {
            createThinkingStatusComponent(messagesContainer);
        } else {
            console.error('❌ Messages container not found!');
            return;
        }
        // Try again after creating
        statusComponent = document.querySelector('.iheard-thinking-status');
        if (!statusComponent) {
            console.error('❌ Failed to create thinking status component');
            return;
        }
    }

    console.log('🧠 Updating thinking status UI:', statusUpdate);

    // Update progress bar
    const progressFill = statusComponent.querySelector('.thinking-progress-fill');
    const progressPercentage = statusComponent.querySelector('.thinking-percentage');
    
    if (statusUpdate.progress !== undefined) {
        const progress = Math.min(100, Math.max(0, statusUpdate.progress));
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressPercentage) {
            progressPercentage.textContent = `${progress}%`;
        }
    }

    // Add new status item if we have a status message
    if (statusUpdate.status_message) {
        addStatusItem(statusComponent, statusUpdate.status_message);
    }
}

/**
 * Remove emojis from status message
 * @param {string} message - Message to clean
 * @returns {string} Message without emojis
 */
function removeEmojisFromMessage(message) {
    if (!message) return message;
    
    // Remove all emoji characters using Unicode ranges
    return message.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F0FF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]/gu, '').trim();
}

/**
 * Add a new status item to the scrollable list
 * @param {HTMLElement} statusComponent - The thinking status component
 * @param {string} statusMessage - The status message to add
 */
function addStatusItem(statusComponent, statusMessage) {
    const statusList = statusComponent.querySelector('.thinking-status-list');
    if (!statusList) return;

    // Mark previous active items as completed
    const previousItems = statusList.querySelectorAll('.status-item.active');
    previousItems.forEach(item => {
        item.classList.remove('active');
        item.classList.add('completed');
    });

    // Get all existing items to check if we need to fade out old ones
    const allItems = statusList.querySelectorAll('.status-item');
    
    // If we have 3 or more items, fade out the oldest ones
    if (allItems.length >= 3) {
        const itemsToFadeOut = Array.from(allItems).slice(0, allItems.length - 2);
        itemsToFadeOut.forEach(item => {
            item.classList.add('fade-out');
            // Remove the item after animation completes
            setTimeout(() => {
                if (item.parentNode) {
                    item.remove();
                }
            }, 500);
        });
    }

    // Create new status item
    const statusItem = document.createElement('div');
    statusItem.className = 'status-item active';
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'});
    const cleanMessage = removeEmojisFromMessage(statusMessage);
    
    statusItem.innerHTML = `
        <span class="status-text">${cleanMessage}</span>
        <span class="status-timestamp">${currentTime}</span>
    `;

    // Add the new item
    statusList.appendChild(statusItem);
}

/**
 * Complete thinking status (when final response arrives)
 */
export function completeThinkingStatus() {
    const statusComponent = document.querySelector('.iheard-thinking-status');
    if (!statusComponent) return;

    // Add final status item
    addStatusItem(statusComponent, 'Recommendation ready!');

    // Update main title
    const thinkingTitle = statusComponent.querySelector('.thinking-title');
    if (thinkingTitle) {
        thinkingTitle.textContent = 'Complete!';
    }

    // Stop spinner
    const spinner = statusComponent.querySelector('.thinking-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }

    // Complete progress bar
    const progressFill = statusComponent.querySelector('.thinking-progress-fill');
    const progressPercentage = statusComponent.querySelector('.thinking-percentage');
    if (progressFill) {
        progressFill.style.width = '100%';
    }
    if (progressPercentage) {
        progressPercentage.textContent = '100%';
    }

    // Fade out after a moment
    setTimeout(() => {
        removeThinkingStatus();
    }, 3000);
}

/**
 * Remove thinking status component
 */
export function removeThinkingStatus() {
    const existingStatus = document.querySelector('.iheard-thinking-status');
    if (existingStatus) {
        existingStatus.remove();
    }
}

/**
 * Add CSS styles for thinking status component
 */
function addThinkingStatusStyles() {
    const styleId = 'iheard-thinking-status-styles';
    if (document.getElementById(styleId)) return;

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
        .iheard-thinking-status {
            background: rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 16px;
            margin: 12px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s ease-out;
        }

        .thinking-header {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .thinking-icon {
            flex-shrink: 0;
        }

        .thinking-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top: 2px solid rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .thinking-title {
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            flex: 1;
            min-width: 200px;
        }

        .thinking-progress {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .thinking-progress-bar {
            width: 80px;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
        }

        .thinking-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
            border-radius: 3px;
            transition: width 0.3s ease;
            width: 0%;
        }

        .thinking-percentage {
            font-size: 12px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            min-width: 30px;
        }

        .thinking-status-list {
            margin-top: 12px;
            height: 80px;
            overflow: hidden;
            position: relative;
            padding-top: 8px;
        }

        .thinking-status-list::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), transparent);
            pointer-events: none;
            z-index: 1;
        }

        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-radius: 4px;
            transition: all 0.5s ease;
            animation: slideInItem 0.3s ease-out;
            transform: translateY(0);
            opacity: 1;
        }

        .status-item.active {
            background: rgba(59, 130, 246, 0.1);
        }

        .status-item.completed {
            opacity: 0.6;
        }

        .status-item.fade-out {
            animation: fadeOutUp 0.5s ease-out forwards;
        }

        .status-text {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.85);
            flex: 1;
            margin-right: 8px;
        }

        .status-timestamp {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            font-family: monospace;
            white-space: nowrap;
        }

        @keyframes slideInItem {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeOutUp {
            0% {
                opacity: 1;
                transform: translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateY(-30px);
            }
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes slideIn {
            0% {
                opacity: 0;
                transform: translateY(-10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
            .iheard-thinking-status {
                padding: 12px;
            }
            
            .thinking-steps {
                gap: 6px;
            }
            
            .thinking-step {
                padding: 6px 8px;
            }
            
            .step-text {
                font-size: 13px;
            }
        }
    `;

    document.head.appendChild(styles);
}