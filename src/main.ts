/**
 * Main Entry Point
 * Initializes all application modules on page load
 */

// Import SCSS styles
import './styles/main.scss';

// Import modules
import { initThemeToggle } from './scripts/theme-toggle';
import { initResumeRenderer } from './scripts/resume-renderer';
import { initScrollHandler } from './scripts/scroll-handler';
import { initFormHandler } from './scripts/form-handler';

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme toggle (handles localStorage, system preference, and toggle button)
  initThemeToggle();

  // Render resume data to DOM
  initResumeRenderer();

  // Initialize full-page scroll handler with nav dots and keyboard navigation
  initScrollHandler();

  // Initialize contact form validation and handling
  initFormHandler();
});
