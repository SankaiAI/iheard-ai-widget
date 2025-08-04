/**
 * Transcription display and management for iHeardAI Widget
 * Handles real-time transcription display in chat
 */

import { removeWelcomeMessage } from './messaging.js';

// Transcription state
let transcriptionEnabled = false;
let currentUserTranscription = null;
let currentAssistantTranscription = null;
let interimTranscriptions = new Map();
let lastUserTranscriptionId = null;
let lastAssistantTranscriptionId = null;

/**
 * Toggle transcription display on/off
 * @returns {boolean} New transcription state
 */
export function toggleTranscription() {
  transcriptionEnabled = !transcriptionEnabled;
  console.log(`📝 Transcription ${transcriptionEnabled ? 'enabled' : 'disabled'}`);
  
  // Update CC button appearance
  const ccButton = document.querySelector('.iheard-cc-btn');
  if (ccButton) {
    ccButton.classList.toggle('active', transcriptionEnabled);
    ccButton.title = transcriptionEnabled ? 'Disable closed captions' : 'Enable closed captions';
  }
  
  // Refresh voice mode UI to show/hide transcription reminder
  refreshVoiceModeUI();
  
  return transcriptionEnabled;
}

/**
 * Refresh voice mode UI to update transcription reminder visibility
 */
function refreshVoiceModeUI() {
  // Trigger a UI update if in voice mode
  const inputWrapper = document.querySelector('.iheard-chat-input');
  if (inputWrapper && inputWrapper.classList.contains('showing-waves')) {
    // Import and call updateWaveAnimation from voice module
    import('../voice/audio-detection.js').then(module => {
      // Call updateWaveAnimation to refresh the UI
      module.updateWaveAnimation();
    });
  }
}

/**
 * Check if transcription is enabled
 * @returns {boolean} Transcription enabled state
 */
export function isTranscriptionEnabled() {
  return transcriptionEnabled;
}

/**
 * Display user transcription message (streaming)
 * @param {string} text - Transcription text
 * @param {boolean} isFinal - Whether this is final transcription
 * @param {string} transcriptionId - Unique ID for this transcription
 */
export function displayUserTranscription(text, isFinal = false, transcriptionId = null) {
  if (!transcriptionEnabled || !text.trim()) return;
  
  removeWelcomeMessage();
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  // Generate ID if not provided
  if (!transcriptionId) {
    transcriptionId = `user_${Date.now()}`;
  }

  // Check if this is a new speech turn (different transcription ID)
  const isNewTurn = transcriptionId !== lastUserTranscriptionId;

  if (isFinal) {
    // Remove any interim message from current turn
    if (currentUserTranscription && !isNewTurn) {
      currentUserTranscription.remove();
    }
    
    // Create final transcription message
    const message = createTranscriptionMessage(text, 'user', transcriptionId, true);
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Clear interim state for this turn
    currentUserTranscription = null;
    lastUserTranscriptionId = transcriptionId;
    
    console.log(`📝 Final user transcription: "${text}"`);
  } else {
    // For new turns, create new interim message even if one exists
    if (isNewTurn && currentUserTranscription) {
      // Previous interim becomes orphaned, let it stay as is
      currentUserTranscription = null;
    }

    if (currentUserTranscription && !isNewTurn) {
      // Update existing interim message for same turn
      const textContent = currentUserTranscription.querySelector('.transcription-text');
      if (textContent) {
        textContent.textContent = text;
      }
    } else {
      // Create new interim message for new turn or first message
      currentUserTranscription = createTranscriptionMessage(text, 'user', transcriptionId, false);
      messagesContainer.appendChild(currentUserTranscription);
      lastUserTranscriptionId = transcriptionId;
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    console.log(`📝 Interim user transcription: "${text}" (Turn: ${transcriptionId})`);
  }
}

/**
 * Display assistant transcription message (streaming)
 * @param {string} text - Transcription text
 * @param {boolean} isFinal - Whether this is final transcription
 * @param {string} transcriptionId - Unique ID for this transcription
 */
export function displayAssistantTranscription(text, isFinal = false, transcriptionId = null) {
  if (!transcriptionEnabled || !text.trim()) return;
  
  removeWelcomeMessage();
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  // Generate ID if not provided
  if (!transcriptionId) {
    transcriptionId = `assistant_${Date.now()}`;
  }

  // Check if this is a new speech turn (different transcription ID)
  const isNewTurn = transcriptionId !== lastAssistantTranscriptionId;

  if (isFinal) {
    // Remove any interim message from current turn
    if (currentAssistantTranscription && !isNewTurn) {
      currentAssistantTranscription.remove();
    }
    
    // Create final transcription message
    const message = createTranscriptionMessage(text, 'assistant', transcriptionId, true);
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Clear interim state for this turn
    currentAssistantTranscription = null;
    lastAssistantTranscriptionId = transcriptionId;
    
    console.log(`📝 Final assistant transcription: "${text}"`);
  } else {
    // For new turns, create new interim message even if one exists
    if (isNewTurn && currentAssistantTranscription) {
      // Previous interim becomes orphaned, let it stay as is
      currentAssistantTranscription = null;
    }

    if (currentAssistantTranscription && !isNewTurn) {
      // Update existing interim message for same turn
      const textContent = currentAssistantTranscription.querySelector('.transcription-text');
      if (textContent) {
        textContent.textContent = text;
      }
    } else {
      // Create new interim message for new turn or first message
      currentAssistantTranscription = createTranscriptionMessage(text, 'assistant', transcriptionId, false);
      messagesContainer.appendChild(currentAssistantTranscription);
      lastAssistantTranscriptionId = transcriptionId;
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    console.log(`📝 Interim assistant transcription: "${text}" (Turn: ${transcriptionId})`);
  }
}

/**
 * Create a transcription message element
 * @param {string} text - Message text
 * @param {string} speaker - 'user' or 'assistant'
 * @param {string} transcriptionId - Unique transcription ID
 * @param {boolean} isFinal - Whether this is final transcription
 * @returns {HTMLElement} Message element
 */
function createTranscriptionMessage(text, speaker, transcriptionId, isFinal) {
  const message = document.createElement('div');
  message.className = `iheard-message ${speaker === 'assistant' ? 'assistant-message' : 'user-message'} transcription-message ${isFinal ? 'final' : 'interim'}`;
  message.dataset.transcriptionId = transcriptionId;

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';

  // Add voice icon
  const voiceIcon = document.createElement('span');
  voiceIcon.className = 'voice-icon';
  voiceIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  `;
  voiceIcon.title = 'Voice message';

  // Add text content
  const textContent = document.createElement('span');
  textContent.className = 'transcription-text';
  textContent.textContent = text;

  messageContent.appendChild(voiceIcon);
  messageContent.appendChild(textContent);
  message.appendChild(messageContent);

  return message;
}

/**
 * Handle transcription data from LiveKit
 * @param {Object} transcriptionData - Transcription data from LiveKit
 * @param {Object} participant - LiveKit participant
 */
export function handleTranscriptionSegment(transcriptionData, participant) {
  if (!transcriptionEnabled) return;

  const transcriptionId = transcriptionData.id || `segment_${Date.now()}`;
  const isAgent = participant.identity.includes('agent') || participant.identity.includes('assistant');
  const isLocal = participant === window.livekitRoom?.localParticipant;
  
  const speaker = isAgent ? 'assistant' : 'user';
  const text = transcriptionData.text;
  const isFinal = transcriptionData.final;

  if (speaker === 'user') {
    displayUserTranscription(text, isFinal, transcriptionId);
  } else {
    displayAssistantTranscription(text, isFinal, transcriptionId);
  }
}

/**
 * Clear all interim transcriptions
 */
export function clearInterimTranscriptions() {
  if (currentUserTranscription) {
    currentUserTranscription.remove();
    currentUserTranscription = null;
  }
  
  if (currentAssistantTranscription) {
    currentAssistantTranscription.remove();
    currentAssistantTranscription = null;
  }
  
  // Reset turn tracking
  lastUserTranscriptionId = null;
  lastAssistantTranscriptionId = null;
  
  interimTranscriptions.clear();
}

/**
 * Process real-time transcription data from voice assistant
 * @param {Object} data - Transcription data from server
 */
export function processRealtimeTranscription(data) {
  if (!transcriptionEnabled || data.type !== 'transcription') return;

  console.log('📝 Processing real-time transcription:', data);

  // Handle user speech
  if (data.speaker === 'User' || data.participant_sid) {
    displayUserTranscription(data.text, data.final === true, data.id);
  }
  // Handle assistant speech
  else if (data.speaker === 'Assistant') {
    displayAssistantTranscription(data.text, data.final === true, data.id);
  }
}