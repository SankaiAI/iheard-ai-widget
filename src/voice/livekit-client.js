/**
 * LiveKit client management for iHeardAI Widget
 * Handles LiveKit connection, room management, and participant events
 */

import { 
  livekitRoom, 
  localParticipant,
  currentApiKey,
  currentAgentId,
  currentServerUrl,
  isVoiceConnected,
  setLivekitRoom,
  setLocalParticipant,
  setVoiceConnected
} from '../core/state.js';

import { getVoiceAgentUrl } from '../core/environment.js';

import { isMobile } from '../utils/helpers.js';
import { setupVoiceActivityDetection, setupAudioAnalysis } from './audio-detection.js';
import { 
  handleTranscriptionSegment, 
  processRealtimeTranscription,
  isTranscriptionEnabled 
} from '../ui/transcription.js';

/**
 * Update wave animation (local implementation to avoid circular imports)
 * @param {boolean} agentSpeaking - Whether agent is speaking
 */
function updateWaveAnimation(agentSpeaking = false) {
  console.log('🌊 Updating wave animation:', agentSpeaking);
  
  const inputWrapper = document.querySelector('.iheard-chat-input');
  
  if (!inputWrapper) return;
  
  if (agentSpeaking) {
    inputWrapper.classList.add('showing-waves');
  } else {
    inputWrapper.classList.remove('showing-waves');
  }
}

/**
 * Wait for LiveKit to be available
 * @returns {Promise} Resolves when LiveKit is loaded
 */
export function waitForLiveKit() {
  return new Promise((resolve, reject) => {
    // Check multiple possible global names for LiveKit
    function getLiveKit() {
      return window.LiveKit || window.livekit || window.LiveKitClient || window.livekitClient || window.LivekitClient;
    }
    
    if (getLiveKit()) {
      const livekit = getLiveKit();
      window.LiveKit = livekit; // Normalize to window.LiveKit
      console.log('✅ LiveKit client found and ready');
      resolve();
      return;
    }
    
    const checkInterval = setInterval(() => {
      const livekit = getLiveKit();
      if (livekit) {
        clearInterval(checkInterval);
        window.LiveKit = livekit; // Normalize to window.LiveKit
        console.log('✅ LiveKit client loaded and ready');
        resolve();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.error('❌ Available window objects:', Object.keys(window).filter(k => k.toLowerCase().includes('live')));
      reject(new Error('LiveKit client failed to load within timeout'));
    }, 10000);
  });
}

/**
 * Connect to LiveKit voice service
 * @returns {Promise<Object>} Connected room object
 */
export async function connectToLiveKit() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Add mobile debug overlay for troubleshooting
  if (isMobile) {
    setTimeout(() => {
      const debugOverlay = document.getElementById('mobile-debug-overlay');
      // Debug overlay code would go here
    }, 30000);
  }

  try {
    console.log('🌍 Current hostname:', window.location.hostname);
    console.log('🔒 Current protocol:', window.location.protocol);
    console.log('🔗 Current origin:', window.location.origin);

    // Use API key with fallback for local testing
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiKey = currentApiKey || (isLocalHost ? 'ihd_local-test-key' : null);
    if (!apiKey) {
      throw new Error('No API key available for voice connection');
    }

    // Wait for LiveKit to be available
    await waitForLiveKit();

    // Create room name
    const roomName = `voice_room_${currentAgentId || 'default'}_${Date.now()}`;

    // Determine voice server URL
    let voiceServerUrl;
    if (currentServerUrl) {
      voiceServerUrl = currentServerUrl;
      console.log('🎯 Using configured server URL:', voiceServerUrl);
    } else {
      try {
        voiceServerUrl = getVoiceAgentUrl();
        console.log('🌍 Using environment voice server URL:', voiceServerUrl);
      } catch (error) {
        console.error('❌ Failed to load voice server URL from environment:', error.message);
        throw new Error(`Voice server URL not configured: ${error.message}`);
      }
    }

    // Get LiveKit token from voice server
    const tokenResponse = await fetch(`${voiceServerUrl}/api/livekit/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        room_name: roomName,
        participant_name: 'User'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status} - Make sure your voice assistant server is running on ${voiceServerUrl}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('🎫 Received token for room:', tokenData.room);
    console.log('🔗 LiveKit server URL:', tokenData.url);

    // Create and configure LiveKit room
    const { Room, RoomEvent, TrackKind } = window.LiveKit;
    const room = new Room();

    // Set up room event handlers
    setupRoomEventHandlers(room);

    // Connect to the room
    try {
      await room.connect(tokenData.url, tokenData.token);
      console.log('🎉 Connected to LiveKit room:', tokenData.room);

      // Start agent session
      await startAgentSession(voiceServerUrl, apiKey);

    } catch (error) {
      console.error('🔥 LiveKit connection error:', error);
      
      if (error.message.includes('token') || error.message.includes('auth')) {
        throw new Error(`Authentication failed. Make sure:
1. Your voice assistant server is running
2. The token server is accessible on ${voiceServerUrl}
3. Your LiveKit server is properly configured`);
      }
      
      if (error.message.includes('network') || error.message.includes('connection')) {
        throw new Error(`Network connection failed. Make sure:
1. Your voice assistant server is running on ${voiceServerUrl}
2. Your internet connection is stable
3. The LiveKit server is accessible`);
      }
      
      throw new Error(`Connection failed: ${error.message}

Make sure your voice assistant server is running on ${voiceServerUrl}`);
    }

    // Handle microphone setup
    if (isMobile) {
      // Mobile-specific microphone handling
      console.log('📱 Mobile device detected');
      console.log('🎤 Available media devices:', !!navigator.mediaDevices);
      console.log('🔊 User agent:', navigator.userAgent);
      console.log('🎵 Audio context available:', !!(window.AudioContext || window.webkitAudioContext));
    }

    console.log('👥 Room name:', room.name);
    console.log('🙋 Local participant identity:', room.localParticipant.identity);
    console.log('👫 Remote participants:', Array.from(room.remoteParticipants.values()).map(p => p.identity));
    console.log('🔗 Server URL:', tokenData.server_url);

    // Store room and participant references
    setLivekitRoom(room);
    setLocalParticipant(room.localParticipant);

    // Setup additional room features
    setupRoomFeatures(room);

    // Enable microphone
    try {
      if (isMobile) {
        // Enhanced microphone setup for mobile
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Small delay for mobile compatibility
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clean up the test stream
        stream.getTracks().forEach(track => track.stop());
      }

      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (micError) {
      console.warn('⚠️ Initial microphone setup failed:', micError.message);
      try {
        // Fallback with simpler constraints
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false
          }
        });
        fallbackStream.getTracks().forEach(track => track.stop());
        
        // Delay and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (fallbackError) {
        console.error('❌ Microphone setup completely failed:', fallbackError.message);
      }
    }

    // Initialize audio context for better compatibility
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create a brief audio test
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = 0; // Silent
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
      console.log('🎵 Audio context state:', audioContext.state);
    } catch (audioError) {
      console.warn('⚠️ Audio context setup failed:', audioError.message);
    }

    return room;

  } catch (error) {
    console.error('❌ LiveKit connection failed:', error);
    throw new Error(`LiveKit connection failed: ${error.message}`);
  }
}

/**
 * Disconnect from LiveKit
 */
export async function disconnectFromLiveKit() {
  try {
    // Clear voice activity detector
    if (voiceActivityDetector) {
      clearInterval(voiceActivityDetector);
      voiceActivityDetector = null;
      isUserSpeaking = false;
    }

    // Disconnect from room
    if (livekitRoom) {
      await livekitRoom.disconnect();
      setLivekitRoom(null);
      setLocalParticipant(null);
    }
  } catch (error) {
    console.error('❌ LiveKit disconnect error:', error);
  }
}

/**
 * Setup room event handlers
 * @param {Object} room - LiveKit room instance
 */
function setupRoomEventHandlers(room) {
  console.log('🔍 Setting up room event handlers...');
  console.log('🔍 window.LiveKit available:', !!window.LiveKit);
  console.log('🔍 window.LiveKit keys:', window.LiveKit ? Object.keys(window.LiveKit) : 'N/A');
  
  const { RoomEvent, TrackKind } = window.LiveKit;
  
  console.log('🔍 TrackKind:', TrackKind);
  console.log('🔍 TrackKind.Audio:', TrackKind?.Audio);
  
  // Log available events for debugging
  console.log('🎯 Available RoomEvent types:', Object.keys(RoomEvent));

  // Handle participant connected
  room.on(RoomEvent.ParticipantConnected, (participant) => {
    console.log('👤 Participant connected:', participant.identity);
    participant.sid && console.log('🆔 Participant SID:', participant.sid);
    participant.metadata && console.log('📋 Participant metadata:', participant.metadata);
    
    // Store participant reference for comparison
    console.log('🏠 Local participant constructor:', room.localParticipant.constructor);
    
    // Check if this is an agent
    const isAgent = participant.identity.includes('agent') || 
                   participant.identity.includes('assistant') || 
                   participant.identity.includes('ai') || 
                   participant.identity.toLowerCase().includes('agent');
    
    console.log('🤖 Is agent participant:', isAgent);
    console.log('👤 Participant identity:', participant.identity);

    if (isAgent) {
      // Setup agent-specific handling
      setupAgentParticipant(participant);
    }
  });

  // Handle track subscription
  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    console.log('🎵 Track subscribed:', track.kind);
    console.log('👤 From participant:', participant.identity);
    
    if (track.kind === 'audio' && 
        (participant.identity.includes('agent') || participant.identity.includes('assistant'))) {
      
      console.log('🔊 Setting up audio playback for agent speech');
      
      // Ensure audio context is running
      if (window.AudioContext || window.webkitAudioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!window.audioContext) {
          window.audioContext = new AudioContextClass();
        }
        if (window.audioContext.state === 'suspended') {
          window.audioContext.resume().then(() => {
            console.log('🎵 Audio context resumed');
          }).catch(err => {
            console.error('❌ Failed to resume audio context:', err);
          });
        }
        console.log('🎵 Audio context state:', window.audioContext.state);
      }
      
      // Attach and play agent audio
      const audioElement = track.attach();
      audioElement.autoplay = true;
      audioElement.controls = false;
      audioElement.style.display = 'none';
      
      // Handle potential autoplay restrictions
      audioElement.addEventListener('canplay', () => {
        console.log('🎧 Audio element ready to play');
        console.log('🔊 Audio element properties:', {
          volume: audioElement.volume,
          muted: audioElement.muted,
          paused: audioElement.paused,
          src: audioElement.src
        });
        audioElement.play().catch(err => {
          console.error('❌ Failed to play audio:', err);
        });
      });

      // Additional debugging
      audioElement.addEventListener('play', () => {
        console.log('▶️ Audio started playing');
      });
      
      audioElement.addEventListener('pause', () => {
        console.log('⏸️ Audio paused');
      });
      
      audioElement.addEventListener('ended', () => {
        console.log('🏁 Audio playback ended');
      });
      
      audioElement.addEventListener('error', (e) => {
        console.error('❌ Audio element error:', e);
      });
      
      // Add to DOM for playback
      document.body.appendChild(audioElement);
      
      // Setup audio analysis for speaking detection
      setupAudioAnalysis(track, participant);
      
      console.log('✅ Agent audio track attached and playing');
    }
  });

  // Handle track unsubscription
  room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
    console.log('🔇 Track unsubscribed:', track.kind);
    console.log('👤 From participant:', participant.identity);
    track.detach();
  });

  // Handle participant disconnected
  room.on(RoomEvent.ParticipantDisconnected, (participant) => {
    console.log('👋 Participant disconnected:', participant.identity);
  });

  // Handle connection state changes
  room.on(RoomEvent.ConnectionStateChanged, (state) => {
    console.log('🔗 Connection state changed:', state);
  });

  // Handle audio playback status
  room.on(RoomEvent.AudioPlaybackStatusChanged, (canPlayback) => {
    console.log('🔊 Audio playback status changed:', canPlayback);
    if (!canPlayback) {
      room.startAudio().catch(error => {
        console.error('❌ Failed to start audio:', error.message);
      });
    }
  });

  // Handle room disconnected
  room.on(RoomEvent.Disconnected, () => {
    console.log('🔇 Room disconnected');
    setVoiceConnected(false);
  });

  // Handle transcription events
  if (RoomEvent.TranscriptionReceived) {
    room.on(RoomEvent.TranscriptionReceived, (transcriptions, participant, publication) => {
      console.log('📝 Transcription received from:', participant?.identity, transcriptions);
      transcriptions.forEach(transcription => {
        if (isTranscriptionEnabled()) {
          handleTranscriptionSegment(transcription, participant);
        }
      });
    });
  } else {
    console.log('⚠️ TranscriptionReceived event not available in this LiveKit version');
  }
  
  // Handle data messages for real-time transcription
  room.on(RoomEvent.DataReceived, (payload, participant) => {
    try {
      const message = new TextDecoder().decode(payload);
      const data = JSON.parse(message);
      
      // Handle real-time transcription from voice assistant
      if (data.type === 'transcription' && isTranscriptionEnabled()) {
        console.log('📝 Received voice assistant transcription:', data);
        processRealtimeTranscription(data);
      }
    } catch (error) {
      // Not JSON or not transcription data, ignore
    }
  });

  // Debug: Log all events
  Object.values(RoomEvent).forEach(eventType => {
    room.on(eventType, (...args) => {
      if (eventType !== RoomEvent.TranscriptionReceived && eventType !== RoomEvent.DataReceived) {
        // console.log(`🎯 Room event: ${eventType}`, args);
      }
    });
  });
}

/**
 * Setup additional room features after connection
 * @param {Object} room - LiveKit room instance
 */
function setupRoomFeatures(room) {
  // Setup speaking detection after a delay
  setTimeout(() => {
    const participants = Array.from(room.remoteParticipants.values());
    console.log('🔍 Remote participants for setup:', participants.map(p => ({
      identity: p.identity,
      isSpeaking: p.isSpeaking,
      audioLevel: p.audioLevel,
      audioTracks: p.audioTrackPublications.size
    })));
    
    participants.forEach(participant => {
      console.log('🎯 Setting up participant:', participant.identity);
      setupAgentParticipant(participant);
    });
  }, 2000);

  // Setup voice activity detection
  if (isMobile()) {
    // Skip voice activity detection on mobile for performance
    setTimeout(() => {
      updateWaveAnimation(false);
    }, 2000);
  } else {
    setTimeout(() => {
      setupVoiceActivityDetection(room);
    }, 1000);
  }

  // Setup track publication handler
  room.localParticipant.on('trackPublished', (publication) => {
    if (publication.kind === 'audio' && publication.source === 'microphone') {
      setTimeout(() => setupVoiceActivityDetection(room), 500);
    }
  });
}

/**
 * Start agent session on the server
 * @param {string} serverUrl - Voice server URL
 * @param {string} apiKey - API key
 */
async function startAgentSession(serverUrl, apiKey) {
  try {
    const agentConfig = {
      agent_id: currentAgentId || 'default',
      name: 'iHeard.ai Assistant',
      personality: 'friendly and helpful e-commerce assistant',
      welcome_message: 'Hello! I\'m your iHeard.ai voice assistant. How can I help you today?',
      voice_type: 'coral',
      language: 'en-US',
      response_style: 'conversational'
    };

    const response = await fetch(`${serverUrl}/api/agent/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        agent_config: agentConfig
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Agent session start failed:', response.status);
      return;
    }

    const sessionData = await response.json();
    console.log('🎯 Agent session started:', sessionData.session_id);
  } catch (error) {
    console.warn('⚠️ Agent session start error:', error.message);
  }
}

/**
 * Setup agent participant event handlers
 * @param {Object} participant - LiveKit participant
 */
function setupAgentParticipant(participant) {
  // This function would be implemented with specific agent handling
  // Will be completed when we extract the audio detection module
}


/**
 * Request transcription from agent when it starts speaking
 */
function requestAgentTranscription() {
  if (!livekitRoom || !isTranscriptionEnabled()) return;
  
  try {
    const request = JSON.stringify({
      type: 'request_transcription',
      timestamp: Date.now()
    });
    
    console.log('📤 Requesting transcription from agent');
    livekitRoom.localParticipant.publishData(
      new TextEncoder().encode(request),
      { reliable: true }
    );
  } catch (error) {
    console.error('❌ Failed to request transcription:', error);
  }
}