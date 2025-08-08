/**
 * Logging utilities for iHeardAI Widget
 * Provides centralized logging and error reporting
 */

// Internal logging state
let debugMode = false;
let logHistory = [];
let maxLogHistory = 1000;
let errorCallback = null;

/**
 * Set up error reporting callback
 * @param {Function} callback - Function to call when errors occur
 */
export function addErrorReporting(callback) {
  errorCallback = callback;
}

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or additional data
 * @param {string} context - Context where error occurred
 */
export function logError(message, error = null, context = 'Widget') {
  const logEntry = {
    level: 'error',
    message,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : null,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  // Add to history
  addToHistory(logEntry);
  
  // Console output
  console.error(`❌ [${context}] ${message}`, error);
  
  // Call error reporting callback if set
  if (errorCallback) {
    try {
      errorCallback(logEntry);
    } catch (callbackError) {
      console.error('Error in error reporting callback:', callbackError);
    }
  }
}

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {Object} data - Additional data
 * @param {string} context - Context where warning occurred
 */
export function logWarning(message, data = null, context = 'Widget') {
  const logEntry = {
    level: 'warning',
    message,
    data,
    context,
    timestamp: new Date().toISOString()
  };
  
  addToHistory(logEntry);
  console.warn(`⚠️ [${context}] ${message}`, data);
}

/**
 * Log info message (only in debug mode)
 * @param {string} message - Info message
 * @param {Object} data - Additional data
 * @param {string} context - Context where info was logged
 */
export function logInfo(message, data = null, context = 'Widget') {
  const logEntry = {
    level: 'info',
    message,
    data,
    context,
    timestamp: new Date().toISOString()
  };
  
  addToHistory(logEntry);
  
  if (debugMode) {
    console.log(`ℹ️ [${context}] ${message}`, data);
  }
}

/**
 * Enable debug mode
 */
export function enableDebugMode() {
  debugMode = true;
  console.log('🐛 Debug mode enabled for iHeardAI Widget');
}

/**
 * Disable debug mode
 */
export function disableDebugMode() {
  debugMode = false;
  console.log('🐛 Debug mode disabled for iHeardAI Widget');
}

/**
 * Get current debug mode status
 * @returns {boolean} Whether debug mode is enabled
 */
export function isDebugMode() {
  return debugMode;
}

/**
 * Get log history
 * @param {string} level - Filter by log level (optional)
 * @param {number} limit - Maximum number of entries to return
 * @returns {Array} Log history entries
 */
export function getLogHistory(level = null, limit = 100) {
  let filtered = logHistory;
  
  if (level) {
    filtered = logHistory.filter(entry => entry.level === level);
  }
  
  return filtered.slice(-limit);
}

/**
 * Clear log history
 */
export function clearLogHistory() {
  logHistory = [];
  console.log('🗑️ Log history cleared');
}

/**
 * Export log history as text
 * @returns {string} Log history as formatted text
 */
export function exportLogHistory() {
  return logHistory.map(entry => {
    const timestamp = new Date(entry.timestamp).toLocaleString();
    let line = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
    
    if (entry.data) {
      line += ` | Data: ${JSON.stringify(entry.data)}`;
    }
    
    if (entry.error) {
      line += ` | Error: ${entry.error.name}: ${entry.error.message}`;
    }
    
    return line;
  }).join('\\n');
}

/**
 * Add entry to log history
 * @param {Object} entry - Log entry to add
 */
function addToHistory(entry) {
  logHistory.push(entry);
  
  // Trim history if it exceeds max size
  if (logHistory.length > maxLogHistory) {
    logHistory = logHistory.slice(-maxLogHistory);
  }
}

/**
 * Set maximum log history size
 * @param {number} size - Maximum number of log entries to keep
 */
export function setMaxLogHistory(size) {
  maxLogHistory = size;
  
  // Trim current history if needed
  if (logHistory.length > maxLogHistory) {
    logHistory = logHistory.slice(-maxLogHistory);
  }
}

/**
 * Create a performance timer
 * @param {string} name - Timer name
 * @returns {Object} Timer object with start and end methods
 */
export function createTimer(name) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      logInfo(`Timer "${name}" completed in ${duration.toFixed(2)}ms`, { duration }, 'Performance');
      return duration;
    }
  };
}

/**
 * Log function execution time
 * @param {Function} fn - Function to time
 * @param {string} name - Function name for logging
 * @returns {Function} Wrapped function that logs execution time
 */
export function timeFunction(fn, name) {
  return function(...args) {
    const timer = createTimer(name);
    const result = fn.apply(this, args);
    
    if (result instanceof Promise) {
      return result.then(value => {
        timer.end();
        return value;
      }).catch(error => {
        timer.end();
        throw error;
      });
    } else {
      timer.end();
      return result;
    }
  };
}

// Auto-enable debug mode in development
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('debug=true')) {
  enableDebugMode();
}

/**
 * Logger object with standard logging interface
 * Compatible with console.log/warn/error API
 */
export const logger = {
  error: logError,
  warn: logWarning,
  info: logInfo,
  log: logInfo,  // Alias for info
  debug: (message, data = null, context = 'Widget') => {
    if (debugMode) {
      logInfo(message, data, context);
    }
  }
};