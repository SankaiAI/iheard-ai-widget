/**
 * API utilities for iHeardAI Widget
 * Common utility functions for API communication
 */

/**
 * Generate a session ID for conversation tracking
 * @returns {string} Session ID
 */
export function generateSessionId() {
  if (!window.iHeardSessionId) {
    window.iHeardSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  return window.iHeardSessionId;
}

/**
 * Generate a unique request ID
 * @returns {string} Request ID
 */
export function createRequestId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Format API error for user display
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {string} Formatted error message
 */
export function formatApiError(error, context = 'API request') {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return `Unable to connect to the service. Please check your internet connection.`;
  } else if (error.message.includes('404')) {
    return `Service not found. Please try again later.`;
  } else if (error.message.includes('500')) {
    return `Service temporarily unavailable. Please try again in a moment.`;
  } else if (error.message.includes('timeout')) {
    return `Request timed out. Please try again.`;
  } else {
    return `${context} failed. Please try again.`;
  }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of successful function call
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
      console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Validate if a string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} Whether string is valid URL
 */
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Sanitize user message for API transmission
 * @param {string} message - User message
 * @returns {string} Sanitized message
 */
export function sanitizeMessage(message) {
  if (typeof message !== 'string') {
    return '';
  }
  
  // Remove excessive whitespace
  message = message.trim().replace(/\s+/g, ' ');
  
  // Remove potential script tags or HTML
  message = message.replace(/<[^>]*>/g, '');
  
  // Remove null bytes and control characters
  message = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return message;
}

/**
 * Truncate message to maximum length
 * @param {string} message - Message to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated message
 */
export function truncateMessage(message, maxLength = 2000) {
  if (!message || typeof message !== 'string') {
    return '';
  }
  
  if (message.length <= maxLength) {
    return message;
  }
  
  return message.substring(0, maxLength - 3) + '...';
}

/**
 * Create AbortController with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortController} Abort controller
 */
export function createTimeoutController(timeoutMs = 30000) {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  // Clean up timeout when request completes
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });
  
  return controller;
}

/**
 * Check if error is due to network connectivity
 * @param {Error} error - Error to check
 * @returns {boolean} Whether error is network-related
 */
export function isNetworkError(error) {
  return error.name === 'TypeError' || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('Network request failed') ||
         error.message.includes('ERR_NETWORK') ||
         error.message.includes('ERR_INTERNET_DISCONNECTED');
}

/**
 * Parse API response safely
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed response data
 */
export async function parseApiResponse(response) {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error('Invalid JSON response from server');
    }
  } else {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      return { message: text };
    }
  }
}

/**
 * Build query string from parameters
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get request headers with common defaults
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object
 */
export function getRequestHeaders(additionalHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'iHeardAI-Widget/1.0',
    'X-Request-ID': createRequestId(),
    ...additionalHeaders
  };
}