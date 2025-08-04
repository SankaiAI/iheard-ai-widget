/**
 * Utilities module entry point for iHeardAI Widget
 * Exports all utility functions
 */

export {
  generateId,
  debounce,
  throttle,
  formatTime,
  parseUrl,
  validateEmail,
  sanitizeHtml,
  copyToClipboard,
  isMobile,
  isIOS,
  isAndroid,
  getDeviceInfo,
  getBrowserInfo,
  supportsWebRTC,
  supportsAudioAPI
} from './helpers.js';

export {
  addErrorReporting,
  logError,
  logWarning,
  logInfo,
  enableDebugMode,
  disableDebugMode,
  getLogHistory,
  clearLogHistory
} from './logging.js';

export {
  LocalStorage,
  SessionStorage,
  StorageManager
} from './storage.js';