/**
 * Global state management for iHeardAI Widget
 * Manages widget state, initialization, and global variables
 */

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