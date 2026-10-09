import { initProjects } from './projects.js';
import { initBlog } from './blog.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNavigation();
  initProjects();
  initBlog();
  initConsoleBanner();
});

/**
 * Initializes light/dark theme toggling with localStorage persistence
 * and accessibility attribute updates.
 */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  };

  const applyTheme = (theme, save = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    themeToggleBtn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    themeToggleBtn.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

    if (save) {
      localStorage.setItem('theme', theme);
    }
  };

  // Sync initial button attributes
  applyTheme(getCurrentTheme(), false);

  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });

  // Listen for OS-level theme preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // Only adjust automatically if user has not stored a manual choice
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light', false);
    }
  });
}

/**
 * Handles mobile hamburger menu expansion, keyboard accessibility,
 * and ARIA attribute state.
 */
function initMobileNavigation() {
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!mobileToggleBtn || !navMenu) return;

  const toggleMenu = () => {
    const isExpanded = mobileToggleBtn.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;
    mobileToggleBtn.setAttribute('aria-expanded', String(nextState));
    navMenu.classList.toggle('is-open', nextState);
  };

  mobileToggleBtn.addEventListener('click', toggleMenu);

  // Close menu when a navigation link is clicked
  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('is-open')) {
        toggleMenu();
      }
    });
  });

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleMenu();
      mobileToggleBtn.focus();
    }
  });
}

/**
 * Developer console banner indicating environment & Phase 1 readiness
 */
function initConsoleBanner() {
  console.log(
    '%cSSRNovX Portfolio & Blog%c\nPhase 1 Foundation Initialized.\nVite + Vanilla JavaScript + CSS3 Design System.',
    'font-weight: bold; font-size: 14px; color: #ffffff; background: #000000; padding: 4px 8px; border-radius: 4px;',
    'font-size: 11px; color: #888888; margin-top: 4px;'
  );
}
