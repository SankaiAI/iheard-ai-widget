/**
 * Audio detection and voice activity detection for iHeardAI Widget
 * Handles speaking detection, audio analysis, and voice state management
 */

import { 
  voiceActivityDetector,
  isUserSpeaking,
  isVoiceConnected,
  livekitRoom,
  setVoiceActivityDetector,
  setUserSpeaking
} from '../core/state.js';

import { widgetConfig } from '../core/config.js';
import { setupInputEventHandlers } from '../ui/events.js';

/**
 * Setup agent participant speaking detection
 * @param {Object} participant - LiveKit participant
 */
export function setupAgentParticipant(participant) {
  const isAgent = participant.identity.includes('agent') || 
                 participant.identity.includes('assistant') || 
                 participant.identity.includes('ai') || 
                 participant.identity.toLowerCase().includes('agent');

  console.log('🎯 Setting up participant:', participant.identity);
  console.log('🤖 Is agent:', isAgent);

  if (isAgent) {
    // Handle speaking state changes
    participant.on(window.LiveKit.ParticipantEvent.IsSpeakingChanged, (speaking) => {
      console.log('🗣️ Agent speaking state changed:', participant.identity, speaking);
      if (speaking) {
        setUserSpeaking(false);
        updateWaveAnimation(true);
        requestAgentTranscription();
      } else {
        updateWaveAnimation(false);
      }
    });

    // Handle audio level changes
    participant.on(window.LiveKit.ParticipantEvent.AudioLevelChanged, (audioLevel) => {
      if (audioLevel > 0.01) {
        console.log('🔊 Agent audio level:', participant.identity, audioLevel);
      }
    });

    // Handle track publications
    participant.on(window.LiveKit.ParticipantEvent.TrackPublished, (publication) => {
      console.log('📢 Agent track published:', participant.identity, publication.kind, publication.source, publication.muted);
    });
  }
}

/**
 * Setup comprehensive room event handlers for speaking detection
 * @param {Object} room - LiveKit room instance
 */
export function setupRoomSpeakingDetection(room) {
  const { RoomEvent, TrackKind, ParticipantEvent } = window.LiveKit;

  // Handle active speakers changes
  room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
    console.log('🎤 Active speakers count:', speakers.length);
    const speakerData = speakers.map(speaker => ({
      identity: speaker.identity,
      audioLevel: speaker.audioLevel,
      isLocal: speaker === room.localParticipant
    }));
    console.log('🗣️ Speaker data:', speakerData);
    
    console.log('👤 Local participant identity:', room.localParticipant.identity);
    const remoteParticipants = Array.from(room.remoteParticipants.values()).map(p => ({
      identity: p.identity,
      audioTracks: p.audioTrackPublications.size,
      isConnected: p.connectionState
    }));
    console.log('👥 Remote participants:', remoteParticipants);

    // Check for agent speakers
    const agentSpeakers = speakers.filter(speaker => 
      speaker.identity.includes('agent') || 
      speaker.identity.includes('assistant') || 
      speaker.identity.includes('ai') || 
      speaker.identity.toLowerCase().includes('agent')
    );
    
    console.log('🤖 Agent speakers:', agentSpeakers.map(s => s.identity));
    
    if (agentSpeakers.length > 0) {
      isUserSpeaking = false;
      updateWaveAnimation(true);
    } else {
      updateWaveAnimation(false);
    }
  });

  // Handle participant connections
  room.on(RoomEvent.ParticipantConnected, (participant) => {
    console.log('👤 Participant connected:', participant.identity);
    console.log('🆔 Participant SID:', participant.sid);
    console.log('📋 Participant metadata:', participant.metadata);
    console.log('🏠 Local participant constructor:', room.localParticipant.constructor);
    
    const isAgent = participant.identity.includes('agent') || 
                   participant.identity.includes('assistant') || 
                   participant.identity.includes('ai') || 
                   participant.identity.toLowerCase().includes('agent');
    
    console.log('🤖 Is agent participant:', isAgent);
    console.log('👤 Participant identity:', participant.identity);

    if (isAgent) {
      setupAgentParticipant(participant);
    }
  });

  // Handle track subscriptions
  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    console.log('🎵 Track subscribed - Kind:', track.kind);
    console.log('👤 From participant:', participant.identity);
    
    if (track.kind === TrackKind.Audio && 
        (participant.identity.includes('agent') || participant.identity.includes('assistant'))) {
      
      // Attach and configure audio element
      const audioElement = track.attach();
      audioElement.autoplay = true;
      audioElement.controls = false;
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
      
      // Setup audio analysis
      setupAudioAnalysis(track, participant);
    }
  });

  // Handle track unsubscriptions
  room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
    console.log('🔇 Track unsubscribed - Kind:', track.kind);
    console.log('👤 From participant:', participant.identity);
    track.detach();
  });

  // Handle participant disconnections
  room.on(RoomEvent.ParticipantDisconnected, (participant) => {
    console.log('👋 Participant disconnected:', participant.identity);
  });
}

/**
 * Setup voice activity detection for user speaking
 * @param {Object} room - LiveKit room instance
 */
export async function setupVoiceActivityDetection(room) {
  try {
    // Don't setup if already running
    if (voiceActivityDetector) {
      console.log('🎤 Voice activity detection already running');
      return;
    }

    // Disable on mobile for performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
      console.log('📱 Mobile browser detected - skipping voice activity detection for performance');
      return;
    }

    // Get local participant
    const localParticipant = room.localParticipant;
    if (!localParticipant) {
      console.log('⚠️ No local participant available for voice activity detection');
      return;
    }

    // Ensure microphone is enabled
    await localParticipant.setMicrophoneEnabled(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get audio track publications
    const audioTrackPublications = Array.from(localParticipant.audioTrackPublications.values());
    if (audioTrackPublications.length === 0) {
      console.log('⚠️ No audio track publications available yet, will retry voice activity detection later');
      setTimeout(() => setupVoiceActivityDetection(room), 2000);
      return;
    }
    
    const micPublication = audioTrackPublications[0];
    const micTrack = micPublication.audioTrack;
    if (!micTrack) {
      console.log('⚠️ No microphone track available for voice activity detection');
      return;
    }

    const mediaStreamTrack = micTrack.mediaStreamTrack;
    if (!mediaStreamTrack) {
      console.log('⚠️ No media stream track available for voice activity detection');
      return;
    }

    // Create audio analysis setup
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const mediaStream = new MediaStream([mediaStreamTrack]);
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.1;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    // Voice activity detection state
    let voiceState = 'silence';
    let silenceCount = 0;
    let speechCount = 0;
    const speechThreshold = 0.01;
    const silenceThreshold = 0.005;
    const speechFrames = 2;
    const silenceFrames = 2;
    let hasDetectedSpeech = false;

    function detectVoiceActivity() {
      analyser.getFloatTimeDomainData(dataArray);
      
      // Calculate RMS (Root Mean Square) for volume level
      let rms = 0;
      for (let i = 0; i < dataArray.length; i++) {
        rms += dataArray[i] * dataArray[i];
      }
      rms = Math.sqrt(rms / dataArray.length);
      
      const isSpeech = rms > speechThreshold;
      const isSilence = rms < silenceThreshold;
      const previousSpeaking = isUserSpeaking;

      // State machine for voice activity detection
      switch (voiceState) {
        case 'silence':
          if (isSpeech) {
            speechCount = 1;
            voiceState = 'maybe_speech';
          }
          break;
          
        case 'maybe_speech':
          if (isSpeech) {
            speechCount++;
            if (speechCount >= speechFrames) {
              voiceState = 'speech';
              if (!hasDetectedSpeech) {
                hasDetectedSpeech = true;
                setUserSpeaking(true);
                updateWaveAnimation();
              }
            }
          } else {
            voiceState = 'silence';
            speechCount = 0;
          }
          break;
          
        case 'speech':
          if (isSilence) {
            silenceCount = 1;
            voiceState = 'maybe_silence';
          } else if (rms > speechThreshold) {
            voiceState = 'speech';
            silenceCount = 0;
          }
          break;
          
        case 'maybe_silence':
          if (isSilence) {
            silenceCount++;
            if (silenceCount >= silenceFrames) {
              voiceState = 'silence';
              if (hasDetectedSpeech) {
                hasDetectedSpeech = false;
                setUserSpeaking(false);
                updateWaveAnimation();
              }
              silenceCount = 0;
            }
          } else if (rms > speechThreshold) {
            voiceState = 'speech';
            silenceCount = 0;
          }
          break;
      }

      // Update UI if speaking state changed
      if (previousSpeaking !== isUserSpeaking) {
        updateWaveAnimation(false);
      }

      requestAnimationFrame(detectVoiceActivity);
    }

    // Start detection
    await audioContext.resume();
    detectVoiceActivity();

  } catch (error) {
    console.error('❌ Voice activity detection setup failed:', error);
    // Fallback for mobile or unsupported browsers
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      updateWaveAnimation(false);
    }
  }
}

/**
 * Setup audio analysis for agent speaking detection
 * @param {Object} track - Audio track
 * @param {Object} participant - Participant object
 */
export function setupAudioAnalysis(track, participant) {
  console.log('🎵 Setting up audio analysis for:', participant.identity);
  
  try {
    if (window.LiveKit && window.LiveKit.createAudioAnalyser) {
      const { analyser, calculateVolume, cleanup } = window.LiveKit.createAudioAnalyser(track, {
        fftSize: 32,
        smoothingTimeConstant: 0
      });

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      let volumeCheckInterval = null;

      if (!isMobile) {
        volumeCheckInterval = setInterval(() => {
          const volume = calculateVolume();
          if (volume > 0.01) {
            console.log('🔊 Agent audio volume detected:', participant.identity, volume);
          }
        }, 500);
      }

      // Cleanup on track end
      track.on('ended', () => {
        if (volumeCheckInterval) clearInterval(volumeCheckInterval);
        cleanup();
      });
    }
  } catch (error) {
    console.error('❌ Audio analysis setup failed:', error);
  }
}

/**
 * Request agent transcription via data channel
 */
function requestAgentTranscription() {
  if (!livekitRoom || !isVoiceConnected) return;

  try {
    const message = JSON.stringify({
      type: 'request_transcription',
      timestamp: Date.now()
    });
    
    livekitRoom.localParticipant.publishData(
      new TextEncoder().encode(message),
      { reliable: true }
    );
  } catch (error) {
    console.error('❌ Failed to request transcription:', error);
  }
}

/**
 * Update wave animation based on speaking state
 * @param {boolean} agentSpeaking - Whether agent is speaking
 */
export function updateWaveAnimation(agentSpeaking = false) {
  const inputWrapper = document.querySelector('.iheard-chat-input');
  
  if (!inputWrapper) return;
  
  if (!isVoiceConnected) {
    // Not in voice mode - show normal input
    inputWrapper.classList.remove('showing-waves');
    const inputClass = widgetConfig.useDefaultAppearance ? 'iheard-input default-appearance' : 'iheard-input';
    inputWrapper.innerHTML = `
      <div class="iheard-input-row">
        <input type="text" class="${inputClass}" placeholder="${widgetConfig.inputPlaceholder}" />
        <button class="iheard-action-btn" title="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
          </svg>
        </button>
      </div>
      <div class="iheard-branding">
        <span class="iheard-powered-by">Powered by iHeard.ai</span>
      </div>
    `;
    
    const input = inputWrapper.querySelector('.iheard-input');
    const actionBtn = inputWrapper.querySelector('.iheard-action-btn');
    if (input && actionBtn) {
      setupInputEventHandlers(input, actionBtn);
    }
    return;
  }

  // Voice mode - show status
  inputWrapper.classList.add('showing-waves');
  
  // Show transcription reminder only if transcription is not enabled
  // Check if CC button has active class instead of importing to avoid circular dependency
  const ccButton = document.querySelector('.iheard-cc-btn');
  const isTranscriptionActive = ccButton && ccButton.classList.contains('active');
  const reminderHTML = isTranscriptionActive ? '' : '<div class="iheard-transcription-reminder">Click CC button in header to see live transcription</div>';

  if (agentSpeaking) {
    inputWrapper.innerHTML = `
      <div class="iheard-text-only">
        ${reminderHTML}
        <div class="iheard-status-text ai-speaking">AI is speaking...</div>
      </div>
    `;
  } else if (isUserSpeaking) {
    inputWrapper.innerHTML = `
      <div class="iheard-text-only">
        ${reminderHTML}
        <div class="iheard-status-text user-speaking">You are speaking...</div>
      </div>
    `;
  } else {
    inputWrapper.innerHTML = `
      <div class="iheard-text-only">
        ${reminderHTML}
        <div class="iheard-status-text listening">I'm listening...</div>
      </div>
    `;
  }
}

