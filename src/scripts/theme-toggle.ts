/**
 * Theme Toggle Handler
 * Manages light/dark theme switching with localStorage persistence
 * and prefers-color-scheme detection
 */

const THEME_KEY = 'theme-preference';

type Theme = 'light' | 'dark' | 'system';

/**
 * Get the initial theme based on:
 * 1. Stored preference in localStorage
 * 2. Falls back to 'system' to let CSS media query handle it
 */
function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }
  return 'system';
}

/**
 * Apply the theme to the document and update toggle button icon
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
  updateToggleIcon();
}

/**
 * Get the currently active theme (resolved, not stored)
 * Returns 'light' or 'dark' based on actual display state
 */
function getActiveTheme(): 'light' | 'dark' {
  const stored = getStoredTheme();
  if (stored === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return stored;
}

/**
 * Update the toggle button icon based on current theme
 */
function updateToggleIcon(): void {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const activeTheme = getActiveTheme();
  toggleBtn.setAttribute('data-theme', activeTheme);
  toggleBtn.setAttribute(
    'aria-label',
    activeTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): void {
  const current = document.documentElement.getAttribute('data-theme');
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

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

/**
 * Initialize theme system
 * - Applies stored/system theme
 * - Sets up system preference change listener
 * - Exposes toggleTheme globally for onclick handler
 */
export function initThemeToggle(): void {
  // Apply initial theme
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'system' || !stored) {
      // Re-apply to update icon state
      applyTheme('system');
    }
  });

  // Expose toggleTheme globally for HTML onclick
  (window as unknown as { toggleTheme: () => void }).toggleTheme = toggleTheme;
}
