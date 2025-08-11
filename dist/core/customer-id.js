/**
 * Customer ID Generator with Browser Fingerprinting
 * Creates persistent customer identification for chat history
 */

/**
 * Generates a privacy-friendly browser fingerprint
 * @returns {string} Hashed fingerprint
 */
function generateBrowserFingerprint() {
    const fingerprint = {
        // Screen properties
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        
        // Browser properties  
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(',') : '',
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        
        // Canvas fingerprint for uniqueness
        canvas: generateCanvasFingerprint(),
        
        // WebGL fingerprint
        webgl: generateWebGLFingerprint(),
        
        // User agent (partial for privacy)
        userAgentHash: simpleHash(navigator.userAgent.substring(0, 50))
    };
    
    // Create hash of combined fingerprint
    const fingerprintString = JSON.stringify(fingerprint);
    return simpleHash(fingerprintString);
}

/**
 * Generates canvas fingerprint
 * @returns {string} Canvas-based fingerprint
 */
function generateCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 200;
        canvas.height = 50;
        
        // Draw text with different properties
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('iHeard.ai widget fingerprint', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Customer ID generator', 4, 35);
        
        // Convert to hash
        return simpleHash(canvas.toDataURL());
    } catch (e) {
        // Fallback if canvas is not supported
        return 'canvas_unavailable_' + Date.now();
    }
}

/**
 * Generates WebGL fingerprint
 * @returns {string} WebGL-based fingerprint
 */
function generateWebGLFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return 'webgl_unavailable';
        }
        
        const info = {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            extensions: gl.getSupportedExtensions().join(',')
        };
        
        return simpleHash(JSON.stringify(info));
    } catch (e) {
        return 'webgl_error';
    }
}

/**
 * Simple hash function for fingerprinting
 * @param {string} str - String to hash
 * @returns {string} Hash value
 */
function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
}

/**
 * Generates or retrieves customer ID
 * @returns {string} Persistent customer ID
 */
export function generateCustomerId() {
    const storageKey = 'iheard_customer_id';
    
    // Try to get existing ID from localStorage
    let customerId = null;
    
    try {
        customerId = localStorage.getItem(storageKey);
    } catch (e) {
        console.warn('localStorage not available, trying sessionStorage');
    }
    
    if (!customerId) {
        try {
            customerId = sessionStorage.getItem(storageKey);
        } catch (e) {
            console.warn('sessionStorage not available, using memory-based ID');
        }
    }
    
    // Generate new ID if none found
    if (!customerId) {
        const fingerprint = generateBrowserFingerprint();
        const timestamp = Date.now();
        customerId = `${fingerprint}_${timestamp}`;
        
        // Try to store the new ID
        try {
            localStorage.setItem(storageKey, customerId);
        } catch (e) {
            try {
                sessionStorage.setItem(storageKey, customerId);
            } catch (e2) {
                console.warn('Unable to persist customer ID - will be memory-only');
                // Store in memory as fallback
                if (!window._iheardCustomerId) {
                    window._iheardCustomerId = customerId;
                }
            }
        }
    }
    
    return customerId;
}

/**
 * Validates customer ID format
 * @param {string} customerId - Customer ID to validate
 * @returns {boolean} True if valid format
 */
export function isValidCustomerId(customerId) {
    if (!customerId || typeof customerId !== 'string') {
        return false;
    }
    
    // Check format: fingerprint_timestamp (alphanumeric + underscores only)
    const validFormat = /^[a-zA-Z0-9_]+$/.test(customerId);
    const hasUnderscore = customerId.includes('_');
    const minLength = customerId.length >= 10;
    
    return validFormat && hasUnderscore && minLength;
}

/**
 * Clears stored customer ID (for testing/debugging)
 */
export function clearCustomerId() {
    const storageKey = 'iheard_customer_id';
    
    try {
        localStorage.removeItem(storageKey);
    } catch (e) {
        // Ignore localStorage errors
    }
    
    try {
        sessionStorage.removeItem(storageKey);
    } catch (e) {
        // Ignore sessionStorage errors
    }
    
    // Clear memory fallback
    if (window._iheardCustomerId) {
        delete window._iheardCustomerId;
    }
}

/**
 * Gets current customer ID without generating new one
 * @returns {string|null} Current customer ID or null if none exists
 */
export function getCurrentCustomerId() {
    const storageKey = 'iheard_customer_id';
    
    // Try localStorage first
    try {
        const id = localStorage.getItem(storageKey);
        if (id && isValidCustomerId(id)) {
            return id;
        }
    } catch (e) {
        // Ignore localStorage errors
    }
    
    // Try sessionStorage
    try {
        const id = sessionStorage.getItem(storageKey);
        if (id && isValidCustomerId(id)) {
            return id;
        }
    } catch (e) {
        // Ignore sessionStorage errors
    }
    
    // Try memory fallback
    if (window._iheardCustomerId && isValidCustomerId(window._iheardCustomerId)) {
        return window._iheardCustomerId;
    }
    
    return null;
}

/**
 * Debug function to show fingerprint components
 * @returns {Object} Fingerprint components for debugging
 */
export function getDebugInfo() {
    return {
        customerId: getCurrentCustomerId(),
        fingerprint: generateBrowserFingerprint(),
        canvas: generateCanvasFingerprint(),
        webgl: generateWebGLFingerprint(),
        storageSupport: {
            localStorage: (() => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            sessionStorage: (() => {
                try {
                    sessionStorage.setItem('test', 'test');
                    sessionStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            })()
        }
    };
}