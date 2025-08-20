/**
 * Global state management for iHeardAI Widget
 * Manages widget state, initialization, and global variables
 */

import { widgetConfig } from './config.js';

/**
 * Widget initialization state
 */
export let isInitialized = false;
export let isOpen = false;
export let isConnecting = false;

/**
 * Voice and LiveKit state
 */
export let livekitLoaded = false;
export let isVoiceConnected = false;
export let livekitRoom = null;
export let localParticipant = null;
export let voiceActivityDetector = null;
export let isUserSpeaking = false;
export let currentApiKey = null;
export let currentAgentId = null;
export let currentServerUrl = null;
export let currentCustomerId = null;

/**
 * UI state
 */
export let currentUserMessage = null;
export let currentAssistantMessage = null;
export let lastTranscriptionReceived = false;

/**
 * Agent processing state - prevents interruptions during responses
 */
export let isAgentProcessing = false;
export let isAgentThinking = false;
export let isAgentResponding = false;
export let canInterrupt = false;
export let pauseRequested = false;

/**
 * Polling and intervals
 */
export let configPollingInterval = null;

/**
 * Update initialization state
 */
export function setInitialized(value) {
  isInitialized = value;
}

export function setOpen(value) {
  isOpen = value;
}

export function setConnecting(value) {
  isConnecting = value;
}

/**
 * Update LiveKit state
 */
export function setLivekitLoaded(value) {
  livekitLoaded = value;
}

export function setVoiceConnected(value) {
  isVoiceConnected = value;
}

export function setLivekitRoom(room) {
  livekitRoom = room;
}

export function setLocalParticipant(participant) {
  localParticipant = participant;
}

export function setVoiceActivityDetector(detector) {
  voiceActivityDetector = detector;
}

export function setUserSpeaking(value) {
  isUserSpeaking = value;
}

/**
 * Update API credentials
 */
export function setApiCredentials(apiKey, agentId, serverUrl) {
  currentApiKey = apiKey;
  currentAgentId = agentId;
  currentServerUrl = serverUrl;
}

export function setCurrentCustomerId(customerId) {
  currentCustomerId = customerId;
  console.log('👤 Current customer ID updated:', customerId);
}

/**
 * Update UI state
 */
export function setCurrentUserMessage(message) {
  currentUserMessage = message;
}

export function setCurrentAssistantMessage(message) {
  currentAssistantMessage = message;
}

export function setCurrentAgentId(agentId) {
  currentAgentId = agentId;
  console.log('🆔 Current agent ID updated:', agentId);
}

export function setLastTranscriptionReceived(value) {
  lastTranscriptionReceived = value;
}

/**
 * Update agent processing state
 */
export function setAgentProcessing(value) {
  isAgentProcessing = value;
  updateInputState();
}

export function setAgentThinking(value) {
  isAgentThinking = value;
  updateInputState();
}

export function setAgentResponding(value) {
  isAgentResponding = value;
  updateInputState();
}

export function setCanInterrupt(value) {
  canInterrupt = value;
  updateInputState();
}

export function setPauseRequested(value) {
  pauseRequested = value;
  updateInputState();
}

/**
 * Update input and button states based on agent processing status
 */
function updateInputState() {
  const input = document.querySelector('.iheard-input');
  const actionBtn = document.querySelector('.iheard-action-btn');
  const inputArea = document.querySelector('.iheard-chat-input');
  
  if (!input || !actionBtn) return;
  
  // Determine current state
  let currentState = 'ready';
  
  if (isAgentThinking || isAgentProcessing) {
    currentState = 'processing';
  } else if (isAgentResponding) {
    currentState = 'responding';
  }
  
  // Keep input always visible and enabled
  input.disabled = false;
  input.placeholder = widgetConfig?.inputPlaceholder || 'Type your message...';
  
  // Update button state - pause button appears immediately when agent starts processing
  updateActionButtonState(currentState);
  
  // No styling changes to input area background - keep it clean
}

/**
 * Update action button based on current state
 */
function updateActionButtonState(state) {
  const actionBtn = document.querySelector('.iheard-action-btn');
  if (!actionBtn) return;
  
  // Clear existing state classes
  actionBtn.classList.remove('processing', 'pause', 'send');
  
  switch (state) {
    case 'processing':
      // Show pause button immediately when agent starts processing
      console.log('🔴 Setting button to PAUSE mode during processing - immediately clickable');
      actionBtn.classList.add('pause');
      actionBtn.disabled = false;
      actionBtn.title = 'Click to interrupt agent';
      actionBtn.style.pointerEvents = 'auto';
      actionBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pause-icon">
          <rect x="9" y="6" width="2" height="12"></rect>
          <rect x="13" y="6" width="2" height="12"></rect>
        </svg>
      `;
      break;
      
    case 'responding':
      // Always show pause button immediately when responding
      console.log('🔴 Setting button to PAUSE mode - always clickable');
      actionBtn.classList.add('pause');
      actionBtn.disabled = false;
      actionBtn.title = 'Click to interrupt agent';
      actionBtn.style.pointerEvents = 'auto';
      actionBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pause-icon">
          <rect x="9" y="6" width="2" height="12"></rect>
          <rect x="13" y="6" width="2" height="12"></rect>
        </svg>
      `;
      console.log('🔴 Pause button setup complete:', {
        disabled: actionBtn.disabled,
        classList: Array.from(actionBtn.classList),
        pointerEvents: actionBtn.style.pointerEvents
      });
      break;
      
    default: // ready state
      actionBtn.classList.add('send');
      actionBtn.disabled = false;
      actionBtn.title = 'Send message';
      actionBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
        </svg>
      `;
      break;
  }
}

/**
 * Update polling intervals
 */
export function setConfigPollingInterval(interval) {
  if (configPollingInterval) {
    clearInterval(configPollingInterval);
  }
  configPollingInterval = interval;
}

/**
 * Get all state values
 */
export function getState() {
  return {
    // Initialization
    isInitialized,
    isOpen,
    isConnecting,
    
    // Voice/LiveKit
    livekitLoaded,
    isVoiceConnected,
    livekitRoom,
    localParticipant,
    voiceActivityDetector,
    isUserSpeaking,
    
    // API
    currentApiKey,
    currentAgentId,
    currentServerUrl,
    currentCustomerId,
    
    // UI
    currentUserMessage,
    currentAssistantMessage,
    lastTranscriptionReceived,
    
    // Agent processing
    isAgentProcessing,
    isAgentThinking,
    isAgentResponding,
    canInterrupt,
    pauseRequested,
    
    // Polling
    configPollingInterval
  };
}

/**
 * Reset all state to initial values
 */
export function resetState() {
  // Clear intervals
  if (configPollingInterval) {
    clearInterval(configPollingInterval);
  }
  
  // Reset to initial values
  isInitialized = false;
  isOpen = false;
  isConnecting = false;
  livekitLoaded = false;
  isVoiceConnected = false;
  livekitRoom = null;
  localParticipant = null;
  voiceActivityDetector = null;
  isUserSpeaking = false;
  currentApiKey = null;
  currentAgentId = null;
  currentServerUrl = null;
  currentCustomerId = null;
  currentUserMessage = null;
  currentAssistantMessage = null;
  lastTranscriptionReceived = false;
  isAgentProcessing = false;
  isAgentThinking = false;
  isAgentResponding = false;
  canInterrupt = false;
  pauseRequested = false;
  configPollingInterval = null;
}

/**
 * Cleanup function for component unmounting
 */
export function cleanup() {
  // Clear any running intervals
  if (configPollingInterval) {
    clearInterval(configPollingInterval);
    configPollingInterval = null;
  }
  
  // Clear voice activity detector
  if (voiceActivityDetector) {
    voiceActivityDetector = null;
  }
  
  // Disconnect LiveKit if connected
  if (livekitRoom) {
    livekitRoom.disconnect().catch(console.error);
    livekitRoom = null;
  }
  
  // Clear participants
  localParticipant = null;
  
  // Reset connection states
  isVoiceConnected = false;
  isUserSpeaking = false;
  isConnecting = false;
}

/**
 * Debug function to log current state
 */
export function debugState() {
  console.log('🐛 Current Widget State:', getState());
}