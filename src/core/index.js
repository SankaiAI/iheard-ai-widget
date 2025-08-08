/**
 * Core module entry point for iHeardAI Widget
 * Exports all core functionality
 */

// Import config functions for internal use
import {
  resetConfig as _resetConfig,
  defaultConfig,
  widgetConfig,
  fetchRemoteConfig,
  applyRemoteConfig,
  updateConfig,
  getAgentIdFromUrl,
  getInitialConfig
} from './config.js';

// Re-export for external use
export {
  defaultConfig,
  widgetConfig,
  fetchRemoteConfig,
  applyRemoteConfig,
  updateConfig,
  getAgentIdFromUrl
};

// Re-export resetConfig
export const resetConfig = _resetConfig;

import * as stateModule from './state.js';

// Re-export state variables and functions
export const {
  isOpen,
  isVoiceConnected,
  isConnecting,
  currentUserMessage,
  currentAssistantMessage,
  currentAgentId,
  currentCustomerId,
  configPollingInterval,
  setOpen,
  setVoiceConnected,
  setConnecting,
  setCurrentUserMessage,
  setCurrentAssistantMessage,
  setCurrentAgentId,
  setCurrentCustomerId,
  setConfigPollingInterval,
  resetState,
  setApiCredentials
} = stateModule;

// Also export stateModule for internal use
export { stateModule };

// Export environment functions
export {
  getEnvironmentConfig,
  getTextAgentUrl as getEnvironmentTextAgentUrl,
  getVoiceAgentUrl as getEnvironmentVoiceAgentUrl,
  getConfigApiUrl,
  validateEnvironmentConfig
} from './environment.js';

// Import customer ID generation
import { generateCustomerId } from './customer-id.js';

/**
 * Initialize core configuration system
 * @returns {Promise<void>}
 */
export async function initializeConfiguration() {
  console.log('🔧 Initializing core configuration...');
  
  try {
    // Reset state
    console.log('🔄 Calling resetState...');
    resetState();
    
    // Load default configuration
    console.log('🔄 Calling resetConfig...');
    _resetConfig();
    
    // Extract API credentials from script parameters
    console.log('🔍 Extracting initial configuration...');
    const initialConfig = getInitialConfig();
    
    // Apply configuration from dashboard global variable (immediate)
    if (window.iHeardConfigFromDashboard) {
      console.log('🎨 Applying dashboard configuration immediately:', window.iHeardConfigFromDashboard);
      updateConfig(window.iHeardConfigFromDashboard);
    }
    
    // Apply URL configuration immediately to avoid default settings flash
    if (initialConfig.configFromUrl && Object.keys(initialConfig.configFromUrl).length > 0) {
      console.log('🎨 Applying URL configuration immediately:', initialConfig.configFromUrl);
      updateConfig(initialConfig.configFromUrl);
    }
    
    // Set API credentials if available
    if (initialConfig.apiKey || initialConfig.agentId || initialConfig.serverUrl) {
      console.log('🔐 Setting API credentials...');
      setApiCredentials(initialConfig.apiKey, initialConfig.agentId, initialConfig.serverUrl);
    } else {
      console.log('⚠️ No API credentials found in URL parameters');
    }
    
    // Generate and set customer ID for conversation continuity
    console.log('👤 Generating customer ID for conversation tracking...');
    const customerId = generateCustomerId();
    stateModule.setCurrentCustomerId(customerId);
    console.log('✅ Customer ID set:', customerId);
    
    console.log('✅ Core configuration initialized');
  } catch (error) {
    console.error('❌ Core initialization error:', error);
    throw error;
  }
}