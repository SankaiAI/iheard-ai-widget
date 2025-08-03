#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvVariables() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadEnvVariables };
}

// If run directly, print environment variables
if (require.main === module) {
  const envVars = loadEnvVariables();
  console.log('📋 Environment Variables:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`  ${key}=${value}`);
  });
}