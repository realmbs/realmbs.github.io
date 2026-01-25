// Import SCSS styles
import './styles/main.scss';

// Import resume renderer
import { initResumeRenderer } from './scripts/resume-renderer';

// Theme management
const THEME_KEY = 'theme-preference';

type Theme = 'light' | 'dark' | 'system';

/**
 * Get the initial theme based on:
 * 1. Stored preference in localStorage
 * 2. System preference via prefers-color-scheme
 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }
  return 'system';
}

/**
 * Apply the theme to the document
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (theme === 'system') {
    // Remove data-theme to let CSS media query handle it
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }

  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Toggle between themes
 */
function toggleTheme(): void {
  const current = document.documentElement.getAttribute('data-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let newTheme: Theme;

  if (current === null) {
    // Currently on system, toggle to opposite of system preference
    newTheme = systemPrefersDark ? 'light' : 'dark';
  } else if (current === 'light') {
    newTheme = 'dark';
  } else {
    newTheme = 'light';
  }

  applyTheme(newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  // Expose toggle function globally for testing
  (window as unknown as { toggleTheme: () => void }).toggleTheme = toggleTheme;

  // Render resume data to DOM
  initResumeRenderer();
});

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'system' || !stored) {
    // Re-apply system theme to ensure CSS is in sync
    applyTheme('system');
  }
});
