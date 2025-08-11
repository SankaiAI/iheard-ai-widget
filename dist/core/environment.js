/**
 * Environment configuration management for iHeardAI Widget
 * Handles loading URLs from environment variables (local .env and Cloudflare)
 */

/**
 * Get environment configuration
 * Loads from Cloudflare environment variables in production, .env for local development
 * @returns {Object} Environment configuration
 */
export function getEnvironmentConfig() {
  // Check if we're in local development
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.startsWith('192.168.') ||
                            window.location.hostname.endsWith('.local');

  let config = {
    textAgentUrl: null,
    voiceAgentUrl: null,
    widgetUrl: null,
    configApiUrl: null
  };

  if (isLocalDevelopment) {
    // Local development - Use localhost URLs as defaults
    config.textAgentUrl = window.IHEARD_TEXT_AGENT_URL || 'http://localhost:8080';
    config.voiceAgentUrl = window.IHEARD_VOICE_AGENT_URL || 'http://localhost:8001';
    config.widgetUrl = window.IHEARD_WIDGET_URL || 'http://localhost:3000/widget.js';
    
    console.log('🔧 Loading local environment configuration');
  } else {
    // Production - Cloudflare environment variables (injected at build time)
    config.textAgentUrl = window.IHEARD_TEXT_AGENT_URL;
    config.voiceAgentUrl = window.IHEARD_VOICE_AGENT_URL;
    config.widgetUrl = window.IHEARD_WIDGET_URL;
    
    console.log('☁️ Loading Cloudflare environment configuration');
  }

  // Config API URL defaults to same domain as widget
  if (config.widgetUrl) {
    try {
      const widgetUrl = new URL(config.widgetUrl);
      config.configApiUrl = `${widgetUrl.origin}/api/config`;
    } catch (error) {
      console.warn('⚠️ Could not parse widget URL for config API');
    }
  }

  console.log('🌍 Environment config loaded:', {
    textAgentUrl: config.textAgentUrl ? 'Present' : 'Missing',
    voiceAgentUrl: config.voiceAgentUrl ? 'Present' : 'Missing',
    widgetUrl: config.widgetUrl ? 'Present' : 'Missing',
    configApiUrl: config.configApiUrl ? 'Present' : 'Missing'
  });

  return config;
}

/**
 * Get text agent URL from environment
 * @returns {string} Text agent URL
 */
export function getTextAgentUrl() {
  const config = getEnvironmentConfig();
  
  if (!config.textAgentUrl) {
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname.startsWith('192.168.') ||
                              window.location.hostname.endsWith('.local');
    
    if (isLocalDevelopment) {
      console.warn('⚠️ TEXT_AGENT_URL not configured, using localhost:8080 default');
      return 'http://localhost:8080';
    } else {
      throw new Error('TEXT_AGENT_URL environment variable is not configured. Please set it in Cloudflare environment variables.');
    }
  }
  
  return config.textAgentUrl;
}

/**
 * Get voice agent URL from environment  
 * @returns {string} Voice agent URL
 */
export function getVoiceAgentUrl() {
  const config = getEnvironmentConfig();
  
  if (!config.voiceAgentUrl) {
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname.startsWith('192.168.') ||
                              window.location.hostname.endsWith('.local');
    
    if (isLocalDevelopment) {
      console.warn('⚠️ VOICE_AGENT_URL not configured, using localhost:8001 default');
      return 'http://localhost:8001';
    } else {
      throw new Error('VOICE_AGENT_URL environment variable is not configured. Please set it in Cloudflare environment variables.');
    }
  }
  
  return config.voiceAgentUrl;
}

/**
 * Get config API URL from environment
 * @returns {string} Config API URL
 */
export function getConfigApiUrl() {
  const config = getEnvironmentConfig();
  
  if (!config.configApiUrl) {
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname.startsWith('192.168.') ||
                              window.location.hostname.endsWith('.local');
    
    if (isLocalDevelopment) {
      console.warn('⚠️ Config API URL not configured, using localhost:3000 default');
      return 'http://localhost:3000/api/config';
    } else {
      throw new Error('Could not determine config API URL. Please ensure WIDGET_URL is properly configured in Cloudflare environment variables.');
    }
  }
  
  return config.configApiUrl;
}

/**
 * Check if all required environment variables are present
 * @returns {Object} Validation result with missing variables
 */
export function validateEnvironmentConfig() {
  const config = getEnvironmentConfig();
  const missing = [];
  
  if (!config.textAgentUrl) missing.push('TEXT_AGENT_URL');
  if (!config.voiceAgentUrl) missing.push('VOICE_AGENT_URL');
  if (!config.widgetUrl) missing.push('WIDGET_URL');
  
  return {
    isValid: missing.length === 0,
    missing: missing,
    message: missing.length > 0 
      ? `Missing environment variables: ${missing.join(', ')}. Please configure them in your .env file (local) or Cloudflare environment variables (production).`
      : 'All environment variables are properly configured.'
  };
}