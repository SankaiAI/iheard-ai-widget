/**
 * Storage utilities for iHeardAI Widget
 * Provides safe localStorage and sessionStorage management
 */

/**
 * LocalStorage wrapper with error handling
 */
export class LocalStorage {
  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} Whether storage was successful
   */
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`iheard_${key}`, serialized);
      return true;
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Stored value or default
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`iheard_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Whether removal was successful
   */
  static remove(key) {
    try {
      localStorage.removeItem(`iheard_${key}`);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all iHeard items from localStorage
   * @returns {boolean} Whether clear was successful
   */
  static clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('iheard_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} Whether localStorage is available
   */
  static isAvailable() {
    try {
      const test = '__iheard_storage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * SessionStorage wrapper with error handling
 */
export class SessionStorage {
  /**
   * Set item in sessionStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} Whether storage was successful
   */
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(`iheard_${key}`, serialized);
      return true;
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
      return false;
    }
  }

  /**
   * Get item from sessionStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Stored value or default
   */
  static get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(`iheard_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from sessionStorage
   * @param {string} key - Storage key
   * @returns {boolean} Whether removal was successful
   */
  static remove(key) {
    try {
      sessionStorage.removeItem(`iheard_${key}`);
      return true;
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
      return false;
    }
  }

  /**
   * Clear all iHeard items from sessionStorage
   * @returns {boolean} Whether clear was successful
   */
  static clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('iheard_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   * @returns {boolean} Whether sessionStorage is available
   */
  static isAvailable() {
    try {
      const test = '__iheard_storage_test__';
      sessionStorage.setItem(test, 'test');
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Universal storage manager that falls back between storage types
 */
export class StorageManager {
  constructor() {
    this.preferredStorage = this.detectBestStorage();
  }

  /**
   * Detect the best available storage option
   * @returns {string} Storage type: 'localStorage', 'sessionStorage', or 'memory'
   */
  detectBestStorage() {
    if (LocalStorage.isAvailable()) {
      return 'localStorage';
    } else if (SessionStorage.isAvailable()) {
      return 'sessionStorage';
    } else {
      return 'memory';
    }
  }

  /**
   * Set item using the best available storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {boolean} persistent - Whether to prefer persistent storage
   * @returns {boolean} Whether storage was successful
   */
  set(key, value, persistent = true) {
    if (persistent && LocalStorage.isAvailable()) {
      return LocalStorage.set(key, value);
    } else if (SessionStorage.isAvailable()) {
      return SessionStorage.set(key, value);
    } else {
      // Fallback to in-memory storage
      this.memoryStorage = this.memoryStorage || {};
      this.memoryStorage[key] = value;
      return true;
    }
  }

  /**
   * Get item using the best available storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @param {boolean} persistent - Whether to prefer persistent storage
   * @returns {any} Stored value or default
   */
  get(key, defaultValue = null, persistent = true) {
    if (persistent && LocalStorage.isAvailable()) {
      const value = LocalStorage.get(key, null);
      if (value !== null) return value;
    }
    
    if (SessionStorage.isAvailable()) {
      const value = SessionStorage.get(key, null);
      if (value !== null) return value;
    }
    
    // Check memory storage
    if (this.memoryStorage && this.memoryStorage.hasOwnProperty(key)) {
      return this.memoryStorage[key];
    }
    
    return defaultValue;
  }

  /**
   * Remove item from all storage types
   * @param {string} key - Storage key
   * @returns {boolean} Whether removal was successful
   */
  remove(key) {
    let success = true;
    
    if (LocalStorage.isAvailable()) {
      success = LocalStorage.remove(key) && success;
    }
    
    if (SessionStorage.isAvailable()) {
      success = SessionStorage.remove(key) && success;
    }
    
    if (this.memoryStorage && this.memoryStorage.hasOwnProperty(key)) {
      delete this.memoryStorage[key];
    }
    
    return success;
  }

  /**
   * Clear all storage
   * @returns {boolean} Whether clear was successful
   */
  clear() {
    let success = true;
    
    if (LocalStorage.isAvailable()) {
      success = LocalStorage.clear() && success;
    }
    
    if (SessionStorage.isAvailable()) {
      success = SessionStorage.clear() && success;
    }
    
    this.memoryStorage = {};
    
    return success;
  }

  /**
   * Get storage availability info
   * @returns {Object} Storage availability information
   */
  getStorageInfo() {
    return {
      localStorage: LocalStorage.isAvailable(),
      sessionStorage: SessionStorage.isAvailable(),
      preferred: this.preferredStorage,
      memoryFallback: !LocalStorage.isAvailable() && !SessionStorage.isAvailable()
    };
  }
}

// Export a default instance
export const storage = new StorageManager();