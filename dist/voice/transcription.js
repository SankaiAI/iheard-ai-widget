/**
 * Real-time transcription handling for iHeardAI Widget
 * Manages speech-to-text display and transcription events
 */

import { 
  currentUserMessage,
  currentAssistantMessage,
  lastTranscriptionReceived,
  setCurrentUserMessage,
  setCurrentAssistantMessage,
  setLastTranscriptionReceived
} from '../core/state.js';

// Map to store ongoing transcriptions
const ongoingTranscriptions = new Map();

/**
 * Handle room data received events for transcriptions
 * @param {Object} room - LiveKit room instance
 */
export function setupDataReceived(room) {
  const { RoomEvent } = window.LiveKit;
  
  room.on(RoomEvent.DataReceived, (payload, participant) => {
    if (participant && participant.identity.includes('agent')) {
      try {
        const message = new TextDecoder().decode(payload);
        
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'transcription') {
            setLastTranscriptionReceived(true);
            handleTranscriptionData(data);
            return;
          }
          
          if (data.type === 'agent_response') {
            console.log('🤖 Agent response received:', data.text);
            setLastTranscriptionReceived(true);
            addAgentMessage(data.text, true);
            return;
          }
          
        } catch (parseError) {
          // Not JSON, treat as plain text
        }
        
        // Handle plain text messages
        if (message.trim()) {
          setLastTranscriptionReceived(true);
          addAgentMessage(message, true);
        }
        
      } catch (error) {
        console.error('❌ Error processing data message:', error);
      }
    }
  });
}

/**
 * Handle transcription data from voice system
 * @param {Object} data - Transcription data object
 */
function handleTranscriptionData(data) {
  if (!data.speaker) return;
  
  if (data.speaker === 'User' || data.participant_sid) {
    // User transcription
    console.log('👤 User transcription:', data.text);
    console.log('🎯 Is final:', data.final);
    
    if (!data.final && !currentUserMessage && !currentAssistantMessage) {
      // Don't show partial user transcriptions if we already have content
      return;
    }
    
    displayUserTranscription(data.text, data.final === true);
    
  } else if (data.speaker === 'Assistant') {
    // Assistant transcription
    console.log('🤖 Assistant transcription:', data.text);
    console.log('🎯 Is final:', data.final);
    
    addAgentMessage(data.text, data.final === true);
  }
}

/**
 * Handle transcription events from LiveKit
 * @param {Object} transcription - Transcription object
 * @param {Object} participant - Participant object
 */
export function handleTranscription(transcription, participant) {
  const transcriptionId = transcription.id;
  const isAgent = participant.identity.includes('agent') || participant.identity.includes('assistant');
  
  const transcriptionData = {
    id: transcriptionId,
    text: transcription.text,
    speaker: isAgent ? 'agent' : 'user',
    participantName: isAgent ? 'AI Assistant' : 'You',
    timestamp: Date.now(),
    final: transcription.final,
    type: 'transcription'
  };

  if (transcription.final) {
    // Final transcription - remove from ongoing and add to chat
    ongoingTranscriptions.delete(transcriptionId);
    
    if (transcription.text.trim()) {
      addTranscriptionMessage(transcriptionData);
    }
  } else {
    // Ongoing transcription - store for updates
    ongoingTranscriptions.set(transcriptionId, transcriptionData);
    updateOngoingTranscription(transcriptionData);
  }
}

/**
 * Add transcription as a chat message
 * @param {Object} transcriptionData - Transcription data
 */
function addTranscriptionMessage(transcriptionData) {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  const message = document.createElement('div');
  message.className = `iheard-message ${transcriptionData.speaker === 'agent' ? 'assistant-message' : 'user-message'} transcription-message`;
  message.dataset.transcriptionId = transcriptionData.id;

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';

  const speechIcon = document.createElement('span');
  speechIcon.className = 'speech-icon';
  speechIcon.innerHTML = '🎤';
  speechIcon.title = 'Voice message';

  const textSpan = document.createElement('span');
  textSpan.textContent = transcriptionData.text;

  messageContent.appendChild(speechIcon);
  messageContent.appendChild(textSpan);
  message.appendChild(messageContent);

  messagesContainer.appendChild(message);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log(`🎤 Added ${transcriptionData.speaker} transcription:`, transcriptionData.text);
}

/**
 * Update ongoing transcription display
 * @param {Object} transcriptionData - Transcription data
 */
function updateOngoingTranscription(transcriptionData) {
  console.log(`🔄 Updating ${transcriptionData.speaker} transcription:`, transcriptionData.text);
  // Implementation for real-time transcription updates would go here
}

/**
 * Display user transcription with streaming support
 * @param {string} text - Transcription text
 * @param {boolean} isFinal - Whether transcription is final
 */
function displayUserTranscription(text, isFinal) {
  removeWelcomeMessage();
  
  const messagesContainer = document.querySelector('.iheard-chat-messages');
  if (!messagesContainer) return;

  if (!currentUserMessage) {
    // Create new user message if none exists
    if (currentAssistantMessage && !currentAssistantMessage) {
      // Don't create new user message if assistant is still streaming
      return;
    }

    setCurrentUserMessage(document.createElement('div'));
    currentUserMessage.className = 'iheard-message user-message streaming';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    currentUserMessage.appendChild(messageContent);

    messagesContainer.appendChild(currentUserMessage);
  }

  // Update content
  const messageContent = currentUserMessage.querySelector('.message-content');
  messageContent.textContent = text;

  if (isFinal) {
    // Finalize the message
    currentUserMessage.classList.remove('streaming');
    currentUserMessage.classList.add('final');
    setCurrentUserMessage(null);
  }

  // Auto-scroll
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Add agent message with streaming support
 * @param {string} text - Message text
 * @param {boolean} isFinal - Whether message is final
 */
function addAgentMessage(text, isFinal) {
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
  messageContent.textContent = text;

  if (isFinal) {
    // Finalize the message
    currentAssistantMessage.classList.remove('streaming');
    currentAssistantMessage.classList.add('final');
    setCurrentAssistantMessage(null);
  }

  // Auto-scroll
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Remove welcome message when chat starts
 */
function removeWelcomeMessage() {
  const welcomeMessage = document.querySelector('.welcome-message');
  if (welcomeMessage && welcomeMessage.parentNode) {
    welcomeMessage.parentNode.removeChild(welcomeMessage);
  }
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
 * Clear all transcriptions
 */
export function clearTranscriptions() {
  ongoingTranscriptions.clear();
  setCurrentUserMessage(null);
  setCurrentAssistantMessage(null);
  setLastTranscriptionReceived(false);
}

/**
 * Get ongoing transcriptions map
 * @returns {Map} Ongoing transcriptions
 */
export function getOngoingTranscriptions() {
  return ongoingTranscriptions;
}