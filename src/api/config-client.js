/**
 * Configuration client for iHeardAI Widget
 * Handles remote configuration fetching and management
 */

import { 
  currentAgentId,
  configPollingInterval,
  setConfigPollingInterval
} from '../core/state.js';
import { 
  widgetConfig,
  applyRemoteConfig,
  fetchRemoteConfig
} from '../core/config.js';

/**
 * Load and apply configuration for a specific agent
 * @param {string} agentId - Agent ID to load configuration for
 * @param {boolean} silent - Whether to suppress error logging
 * @returns {Promise<boolean>} Whether configuration was loaded and applied
 */
export async function loadAgentConfig(agentId, silent = false) {
  if (!agentId) {
    if (!silent) console.log('🔧 Local testing mode - using default configuration');
    return false;
  }

  try {
    const remoteConfig = await fetchRemoteConfig(agentId, silent);
    if (remoteConfig) {
      const hasSignificantChanges = applyRemoteConfig(remoteConfig);
      
      if (hasSignificantChanges) {
        // Significant appearance changes require widget recreation
        console.log('🎨 Significant configuration changes detected - widget will be recreated');
        return 'recreate';
      }
      
      console.log('✅ Configuration loaded and applied successfully');
      return true;
    }
  } catch (error) {
    if (!silent) {
      console.error('❌ Failed to load agent configuration:', error);
    }
  }

  return false;
}

/**
 * Start polling for configuration updates
 * @param {string} agentId - Agent ID to poll for
 * @param {number} intervalMs - Polling interval in milliseconds (default: 30000)
 */
export function startConfigPolling(agentId, intervalMs = 30000) {
  if (!agentId) return;

  // Clear existing interval
  if (configPollingInterval) {
    clearInterval(configPollingInterval);
  }

  // Start new polling interval
  const interval = setInterval(() => {
    if (agentId) {
      loadAgentConfig(agentId, true); // Silent polling
    }
  }, intervalMs);

  setConfigPollingInterval(interval);
  console.log(`🔄 Started configuration polling for agent ${agentId} every ${intervalMs}ms`);
}

/**
 * Stop configuration polling
 */
export function stopConfigPolling() {
  if (configPollingInterval) {
    clearInterval(configPollingInterval);
    setConfigPollingInterval(null);
    console.log('⏹️ Configuration polling stopped');
  }
}

/**
 * Force refresh configuration
 * @param {string} agentId - Agent ID to refresh
 * @returns {Promise<boolean>} Whether configuration was refreshed
 */
export async function refreshConfig(agentId) {
  console.log('🔄 Force refreshing configuration for agent:', agentId);
  return await loadAgentConfig(agentId, false);
}

/**
 * Update configuration and optionally save to server
 * @param {Object} newConfig - New configuration values
 * @param {boolean} saveToServer - Whether to save to remote server
 * @returns {Promise<boolean>} Whether update was successful
 */
export async function updateConfiguration(newConfig, saveToServer = false) {
  try {
    // Apply configuration locally
    applyRemoteConfig(newConfig);
    
    if (saveToServer && currentAgentId) {
      // Save to remote server
      const success = await saveConfigToServer(currentAgentId, newConfig);
      if (success) {
        console.log('✅ Configuration saved to server successfully');
      } else {
        console.warn('⚠️ Configuration applied locally but failed to save to server');
      }
      return success;
    }
    
    console.log('✅ Configuration updated locally');
    return true;
  } catch (error) {
    console.error('❌ Failed to update configuration:', error);
    return false;
  }
}

/**
 * Save configuration to remote server
 * @param {string} agentId - Agent ID
 * @param {Object} config - Configuration to save
 * @returns {Promise<boolean>} Whether save was successful
 */
async function saveConfigToServer(agentId, config) {
  try {
    const response = await fetch(`https://iheard-ai-widget.pages.dev/api/config?agentId=${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: agentId,
        config: config
      })
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Failed to save configuration to server:', error);
    return false;
  }
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateConfiguration(config) {
  const errors = [];
  
  // Required fields
  if (!config.agentName || typeof config.agentName !== 'string') {
    errors.push('agentName is required and must be a string');
  }
  
  // Color validation
  const colorFields = ['primaryColor', 'gradientColor1', 'gradientColor2', 'chatBackgroundColor'];
  colorFields.forEach(field => {
    if (config[field] && !isValidColor(config[field])) {
      errors.push(`${field} must be a valid color value`);
    }
  });
  
  // Boolean fields
  const booleanFields = ['voiceEnabled', 'chatEnabled', 'gradientEnabled', 'glassEffect', 'showButtonText', 'useDefaultAppearance', 'isActive', 'isEnabled'];
  booleanFields.forEach(field => {
    if (config[field] !== undefined && typeof config[field] !== 'boolean') {
      errors.push(`${field} must be a boolean value`);
    }
  });
  
  // Position validation
  const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center-right', 'center-left'];
  if (config.position && !validPositions.includes(config.position)) {
    errors.push(`position must be one of: ${validPositions.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Check if a color value is valid
 * @param {string} color - Color value to check
 * @returns {boolean} Whether color is valid
 */
function isValidColor(color) {
  if (!color || typeof color !== 'string') return false;
  
  // Check hex colors
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) return true;
  
  // Check rgb/rgba colors
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/i.test(color)) return true;
  
  // Check named colors (basic check)
  const namedColors = ['transparent', 'white', 'black', 'red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'gray', 'grey'];
  if (namedColors.includes(color.toLowerCase())) return true;
  
  return false;
}

/**
 * Get current configuration summary
 * @returns {Object} Configuration summary
 */
export function getConfigurationSummary() {
  return {
    agentId: currentAgentId,
    agentName: widgetConfig.agentName,
    voiceEnabled: widgetConfig.voiceEnabled,
    chatEnabled: widgetConfig.chatEnabled,
    position: widgetConfig.position,
    theme: widgetConfig.useDefaultAppearance ? 'default' : 'custom',
    isActive: widgetConfig.isActive,
    isEnabled: widgetConfig.isEnabled,
    pollingActive: !!configPollingInterval
  };
}