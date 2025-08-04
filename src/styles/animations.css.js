/**
 * Animation and transition styles for iHeardAI Widget
 * Keyframes, transitions, and interactive animations
 */

export function createAnimationStyles() {
  return `
    /* Keyframe Animations */
    @keyframes eyeBlink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }

    @keyframes pulse {
      from {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.7);
      }
      to {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(255, 165, 0, 0);
      }
    }

    @keyframes pulse-connected {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }

    @keyframes wave {
      0%, 60%, 100% {
        transform: scaleY(1);
      }
      30% {
        transform: scaleY(1.5);
      }
    }

    @keyframes blink {
      0%, 50% { border-color: transparent; }
      51%, 100% { border-color: white; }
    }

    @keyframes fadeOutUp {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -80%);
      }
    }

    /* Transition Classes */
    .iheard-slide-in {
      animation: slideIn 0.3s ease-out;
    }

    .iheard-slide-out {
      animation: slideOut 0.3s ease-out;
    }

    .iheard-fade-in-scale {
      animation: fadeInScale 0.2s ease-out;
    }

    /* Loading States */
    .iheard-loading {
      opacity: 0.7;
      pointer-events: none;
    }

    .iheard-loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Hover Effects */
    .iheard-hover-lift {
      transition: transform 0.2s ease;
    }

    .iheard-hover-lift:hover {
      transform: translateY(-2px);
    }

    .iheard-hover-scale {
      transition: transform 0.2s ease;
    }

    .iheard-hover-scale:hover {
      transform: scale(1.05);
    }

    /* Focus States */
    .iheard-focus-ring:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    .iheard-focus-ring:focus:not(:focus-visible) {
      outline: none;
    }
  `;
}