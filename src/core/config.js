/**
 * Configuration management for iHeardAI Widget
 * Handles widget configuration, remote config fetching, and environment detection
 */

import { getConfigApiUrl } from './environment.js';

/**
 * Default widget configuration
 */
export const defaultConfig = {
  agentName: 'AI Assistant',
  avatar: '',
  personality: 'Helpful and professional e-commerce assistant',
  welcomeMessage: 'Hello! I\'m here to help you find the perfect products and answer any questions you might have.',
  voiceType: 'natural',
  language: 'en-US',
  responseStyle: 'conversational',
  voiceEnabled: true,
  chatEnabled: true,
  position: 'bottom-right',
  buttonText: 'Ask AI Assistant',
  chatTitle: 'AI Sales Assistant',
  inputPlaceholder: 'Ask me anything about our products...',
  primaryColor: '#ee5cee',
  gradientEnabled: false,
  gradientColor1: '#ee5cee',
  gradientColor2: '#31d1d1',
  gradientDirection: 'to right',
  glassEffect: true,
  widgetStyle: 'eye-animation',
  showButtonText: true,
  chatBackgroundColor: 'transparent',
  useDefaultAppearance: true,
  isActive: true,
  isEnabled: true
};

/**
 * Global widget configuration object
 */
export let widgetConfig = { ...defaultConfig };

/**
 * Update widget configuration
 * @param {Object} newConfig - New configuration values
 */
export function updateConfig(newConfig) {
  widgetConfig = { ...widgetConfig, ...newConfig };
}

/**
 * Reset configuration to defaults
 */
export function resetConfig() {
  widgetConfig = { ...defaultConfig };
}

/**
 * Get current configuration
 * @returns {Object} Current widget configuration
 */
export function getConfig() {
  return { ...widgetConfig };
}

/**
 * Extract configuration from script parameters and URL
 * @returns {Object} Extracted configuration
 */
export function getInitialConfig() {
  console.log('🔍 getInitialConfig called');
  
  let apiKey = null;
  let agentId = null;
  let serverUrl = null;

  // Get parameters from script tag src
  const scripts = document.querySelectorAll('script[src*="widget"]');
  console.log('🔍 Script tags found:', scripts.length);
  
  for (const script of scripts) {
    const scriptUrl = new URL(script.src, window.location.origin);
    console.log('🔍 URL params:', Object.fromEntries(scriptUrl.searchParams));
    
    if (!apiKey) apiKey = scriptUrl.searchParams.get('apiKey');
    if (!agentId) agentId = scriptUrl.searchParams.get('agentId');
    if (!serverUrl) serverUrl = scriptUrl.searchParams.get('serverUrl');
  }

  // Fallback to URL parameters
  if (!apiKey || !agentId || !serverUrl) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!apiKey) apiKey = urlParams.get('apiKey');
    if (!agentId) agentId = urlParams.get('agentId');
    if (!serverUrl) serverUrl = urlParams.get('serverUrl');
  }

  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 Stored currentAgentId:', agentId);
  console.log('🔍 Stored currentApiKey:', apiKey ? 'Present' : 'Not provided');
  console.log('🔍 Stored currentServerUrl:', serverUrl || 'Not provided');

  return {
    apiKey,
    agentId,
    serverUrl
  };
}

/**
 * Fetch remote configuration from server
 * @param {string} agentId - Agent ID to fetch config for
 * @param {boolean} silent - Whether to suppress error logging
 * @returns {Promise<Object|null>} Remote configuration or null if failed
 */
export async function fetchRemoteConfig(agentId, silent = false) {
  if (!agentId) return null;

  // Skip remote config fetching for local development
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.startsWith('192.168.') ||
                            window.location.hostname.endsWith('.local');

  if (isLocalDevelopment) {
    if (!silent) {
      console.log('🔧 Skipping remote config fetch for local development');
    }
    return null;
  }

  try {
    const configApiUrl = getConfigApiUrl();
    const response = await fetch(`${configApiUrl}?agentId=${agentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!silent) {
      console.log('📡 Config fetch response status:', response.status);
      console.log('📡 Config fetch response ok:', response.ok);
      console.log('📡 Config API URL:', configApiUrl);
    }

    if (response.ok) {
      const data = await response.json();
      if (data && data.config) {
        return data.config;
      }
    } else {
      if (!silent) {
        console.log('📡 Config fetch failed:', response.status);
        console.log('📡 Config fetch error:', await response.text());
      }
    }
  } catch (error) {
    if (!silent) {
      console.log('📡 Config fetch error:', error.message);
    }
  }

  return null;
}

/**
 * Apply remote configuration to widget config
 * @param {Object} remoteConfig - Remote configuration object
 * @returns {boolean} Whether configuration was updated
 */
export function applyRemoteConfig(remoteConfig) {
  if (!remoteConfig) return false;

  const oldConfig = { ...widgetConfig };
  
  // Update configuration with remote values
  updateConfig({
    agentName: remoteConfig.agentName || widgetConfig.agentName,
    avatar: remoteConfig.avatarUrl || widgetConfig.avatar,
    personality: remoteConfig.personality || widgetConfig.personality,
    welcomeMessage: remoteConfig.welcomeMessage || widgetConfig.welcomeMessage,
    voiceType: remoteConfig.voiceType || widgetConfig.voiceType,
    language: remoteConfig.language || widgetConfig.language,
    responseStyle: remoteConfig.responseStyle || widgetConfig.responseStyle,
    voiceEnabled: remoteConfig.voiceEnabled ?? widgetConfig.voiceEnabled,
    chatEnabled: remoteConfig.chatEnabled ?? widgetConfig.chatEnabled,
    position: remoteConfig.position || widgetConfig.position,
    buttonText: remoteConfig.buttonText || widgetConfig.buttonText,
    chatTitle: remoteConfig.chatTitle || widgetConfig.chatTitle,
    inputPlaceholder: remoteConfig.inputPlaceholder || widgetConfig.inputPlaceholder,
    primaryColor: normalizeColor(remoteConfig.primaryColor || widgetConfig.primaryColor),
    gradientEnabled: remoteConfig.gradientEnabled ?? widgetConfig.gradientEnabled,
    gradientColor1: normalizeColor(remoteConfig.gradientColor1 || widgetConfig.gradientColor1),
    gradientColor2: normalizeColor(remoteConfig.gradientColor2 || widgetConfig.gradientColor2),
    gradientDirection: remoteConfig.gradientDirection || widgetConfig.gradientDirection,
    glassEffect: remoteConfig.glassEffect ?? widgetConfig.glassEffect,
    widgetStyle: remoteConfig.widgetStyle || widgetConfig.widgetStyle,
    showButtonText: remoteConfig.showButtonText ?? widgetConfig.showButtonText,
    chatBackgroundColor: normalizeColor(remoteConfig.chatBackgroundColor || widgetConfig.chatBackgroundColor),
    useDefaultAppearance: remoteConfig.useDefaultAppearance ?? widgetConfig.useDefaultAppearance,
    isActive: remoteConfig.isActive ?? widgetConfig.isActive,
    isEnabled: remoteConfig.isEnabled ?? widgetConfig.isEnabled
  });

  // Check if significant appearance changes occurred
  const hasAppearanceChanges = (
    oldConfig.useDefaultAppearance !== widgetConfig.useDefaultAppearance ||
    oldConfig.chatBackgroundColor !== widgetConfig.chatBackgroundColor ||
    oldConfig.glassEffect !== widgetConfig.glassEffect
  );

  return hasAppearanceChanges;
}

/**
 * Get agent ID from URL parameters
 * @returns {string|null} Agent ID or null if not found
 */
export function getAgentIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const scriptTag = document.querySelector('script[src*="widget"]');
  
  // Check URL parameters first
  let agentId = urlParams.get('agentId');
  if (agentId) return agentId;
  
  // Check script tag src parameters
  if (scriptTag && scriptTag.src) {
    const scriptUrl = new URL(scriptTag.src, window.location.href);
    agentId = scriptUrl.searchParams.get('agentId');
    if (agentId) return agentId;
  }
  
  // Check window configuration
  if (window.iHeardConfig && window.iHeardConfig.agentId) {
    return window.iHeardConfig.agentId;
  }
  
  return null;
}

/**
 * Normalize color values to ensure consistent format
 * @param {string} color - Color string to normalize
 * @returns {string} Normalized color string
 */
function normalizeColor(color) {
  if (!color || typeof color !== 'string') return '';
  
  // Remove any extra whitespace
  color = color.trim();
  
  // Ensure hex colors start with #
  if (color.match(/^[0-9a-fA-F]{3,6}$/)) {
    color = '#' + color;
  }
  
  return color;
}