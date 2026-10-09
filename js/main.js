/**
 * SSRNovX Portfolio & Blog — Main Application Entry Point
 * TechSpace BuildLab B04
 */

import { initProjects } from './projects.js';
import { initBlog } from './blog.js';
import { initContact } from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNavigation();
  initScrollSpy();
  initProjects();
  initBlog();
  initContact();
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

  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('is-open')) {
        toggleMenu();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleMenu();
      mobileToggleBtn.focus();
    }
  });
}

/**
 * Updates active navigation link based on scroll position
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if (sections.length === 0 || navLinks.length === 0) return;

  const updateActiveLink = () => {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

/**
 * Developer console banner
 */
function initConsoleBanner() {
  console.log(
    '%cSSRNovX Personal Portfolio & Blog%c\nBuildLab B04 | Vite + ES Modules + Accessible Design Tokens',
    'font-weight: bold; font-size: 14px; color: #ffffff; background: #000000; padding: 4px 8px; border-radius: 4px;',
    'font-size: 11px; color: #888888; margin-top: 4px;'
  );
}
