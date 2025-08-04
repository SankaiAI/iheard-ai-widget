/**
 * Main styles module for iHeardAI Widget
 * Combines all CSS modules into a single function
 */

import { createBaseStyles } from './base.css.js';
import { createComponentStyles } from './components.css.js';
import { createAnimationStyles } from './animations.css.js';
import { createMessageStyles } from './messages.css.js';
import { createMobileStyles } from './mobile.css.js';

/**
 * Creates and returns the complete CSS for the widget
 * @returns {HTMLStyleElement} Style element with all widget CSS
 */
export function createWidgetCSS() {
  const style = document.createElement('style');
  
  // Combine all style modules
  style.textContent = `
    /* iHeardAI Widget Styles - Modular Architecture */
    
    ${createBaseStyles()}
    
    ${createComponentStyles()}
    
    ${createAnimationStyles()}
    
    ${createMessageStyles()}
    
    ${createMobileStyles()}
  `;
  
  return style;
}

/**
 * Creates and returns all CSS styles as a string (for compatibility)
 * @returns {string} Complete CSS string for the widget
 */
export function createAllStyles() {
  return `
    /* iHeardAI Widget Styles - Modular Architecture */
    
    ${createBaseStyles()}
    
    ${createComponentStyles()}
    
    ${createAnimationStyles()}
    
    ${createMessageStyles()}
    
    ${createMobileStyles()}
  `;
}

/**
 * Individual style module exports for selective use
 */
export {
  createBaseStyles,
  createComponentStyles, 
  createAnimationStyles,
  createMessageStyles,
  createMobileStyles
};