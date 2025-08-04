/**
 * API module entry point for iHeardAI Widget
 * Exports all API-related functionality
 */

export {
  getTextAgentUrl,
  sendMessageToAgent,
  checkAgentHealth,
  startSession,
  endSession,
  getConversationHistory,
  getFallbackResponse
} from './text-agent.js';

export {
  loadAgentConfig,
  startConfigPolling,
  stopConfigPolling,
  refreshConfig,
  updateConfiguration,
  validateConfiguration,
  getConfigurationSummary
} from './config-client.js';

export {
  generateSessionId,
  createRequestId,
  formatApiError,
  retryWithBackoff,
  isValidUrl,
  sanitizeMessage,
  truncateMessage
} from './utils.js';