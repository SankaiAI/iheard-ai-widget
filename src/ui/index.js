/**
 * UI module entry point for iHeardAI Widget
 * Exports all UI-related functionality
 */

export {
  createWidgetHTML,
  updateCallButtonState,
  updateWidgetAppearance,
  showCCButton,
  hideCCButton
} from './components.js';

export {
  setupEventListeners,
  setupInputEventHandlers,
  setupWindowEventListeners,
  setupKeyboardEventListeners,
  handleKeyboardShortcuts
} from './events.js';

export {
  addUserMessage,
  addAgentMessage,
  showWelcomeMessage,
  removeWelcomeMessage,
  sendTextMessage,
  clearMessages,
  getMessageCount,
  exportChatTranscript
} from './messaging.js';

export {
  toggleTranscription,
  isTranscriptionEnabled,
  displayUserTranscription,
  displayAssistantTranscription,
  handleTranscriptionSegment,
  clearInterimTranscriptions,
  processRealtimeTranscription
} from './transcription.js';

export {
  initializeUnifiedConversation,
  sendUnifiedMessage,
  getConversationState,
  switchToMode,
  cleanupUnifiedConversation,
  sendMessage
} from './unified-messaging.js';