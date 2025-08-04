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
  configPollingInterval,
  setOpen,
  setVoiceConnected,
  setConnecting,
  setCurrentUserMessage,
  setCurrentAssistantMessage,
  setCurrentAgentId,
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
    
    // Set API credentials if available
    if (initialConfig.apiKey || initialConfig.agentId || initialConfig.serverUrl) {
      console.log('🔐 Setting API credentials...');
      setApiCredentials(initialConfig.apiKey, initialConfig.agentId, initialConfig.serverUrl);
    } else {
      console.log('⚠️ No API credentials found in URL parameters');
    }
    
    console.log('✅ Core configuration initialized');
  } catch (error) {
    console.error('❌ Core initialization error:', error);
    throw error;
  }
}