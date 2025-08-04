/**
 * Voice module entry point for iHeardAI Widget
 * Exports all voice-related functionality
 */

// Import functions for internal use
import {
  waitForLiveKit as _waitForLiveKit,
  connectToLiveKit,
  disconnectFromLiveKit
} from './livekit-client.js';

// Re-export for external use
export {
  connectToLiveKit,
  disconnectFromLiveKit
};

// Re-export waitForLiveKit
export const waitForLiveKit = _waitForLiveKit;

export {
  setupAgentParticipant,
  setupRoomSpeakingDetection,
  setupVoiceActivityDetection,
  setupAudioAnalysis,
  updateWaveAnimation
} from './audio-detection.js';

export {
  setupDataReceived,
  handleTranscription,
  showTypingIndicator,
  hideTypingIndicator,
  clearTranscriptions,
  getOngoingTranscriptions
} from './transcription.js';

/**
 * Initialize voice system
 * @returns {Promise<void>}
 */
export async function initializeVoiceSystem() {
  console.log('🎤 Initializing voice system...');
  
  try {
    // Wait for LiveKit to be available
    await _waitForLiveKit();
    
    console.log('✅ Voice system initialized successfully');
  } catch (error) {
    console.error('❌ Voice system initialization failed:', error);
    throw error;
  }
}

