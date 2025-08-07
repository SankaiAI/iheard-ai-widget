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
            <span class="thinking-text">🤔 AI is thinking...</span>
            <div class="thinking-progress">
                <div class="thinking-progress-bar">
                    <div class="thinking-progress-fill"></div>
                </div>
                <span class="thinking-percentage">0%</span>
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

    // Update the main thinking text with current status
    const thinkingText = statusComponent.querySelector('.thinking-text');
    if (statusUpdate.status_message) {
        thinkingText.textContent = statusUpdate.status_message;
    }

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
}

/**
 * Complete thinking status (when final response arrives)
 */
export function completeThinkingStatus() {
    const statusComponent = document.querySelector('.iheard-thinking-status');
    if (!statusComponent) return;

    // Mark all steps as completed
    const allSteps = statusComponent.querySelectorAll('.thinking-step');
    allSteps.forEach(step => {
        step.classList.remove('active', 'pending');
        step.classList.add('completed');
        const indicator = step.querySelector('.step-indicator');
        indicator.innerHTML = '✓';
    });

    // Update main status
    const thinkingText = statusComponent.querySelector('.thinking-text');
    thinkingText.textContent = 'Recommendation ready!';

    // Fade out after a moment
    setTimeout(() => {
        removeThinkingStatus();
    }, 2000);
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
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 1px solid #cbd5e0;
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
            border: 2px solid #e2e8f0;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .thinking-text {
            font-weight: 600;
            color: #374151;
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
            background: #e2e8f0;
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
            color: #6b7280;
            min-width: 30px;
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