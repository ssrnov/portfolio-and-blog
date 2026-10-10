/**
 * SSRNovX Portfolio & Blog — Main Application Coordinator
 * TechSpace BuildLab B04
 */

import { initProjects } from './projects.js';
import { initBlog } from './blog.js';
import { initContact } from './contact.js';
import { initHomepage } from './homepage.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNavigation();
  initActiveNavLink();

  // Conditionally initialize components present on the current page
  if (document.getElementById('interactive-preview-stage') || document.querySelector('.hero-floating-composition')) {
    initHomepage();
  }

  if (document.getElementById('projects-grid') || document.getElementById('featured-projects-grid')) {
    initProjects();
  }

  if (document.getElementById('blog-grid') || document.getElementById('featured-blog-grid') || document.getElementById('article-modal')) {
    initBlog();
  }

  if (document.getElementById('contact-form')) {
    initContact();
  }

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
 * Detects current pathname and synchronizes the active state and ARIA attributes
 * across navigation items.
 */
function initActiveNavLink() {
  const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normalize href for comparison
    const normalizedHref = href.replace(/\/index\.html$/, '/');
    let isActive = false;

    if (normalizedHref === '/' || normalizedHref === '') {
      isActive = currentPath === '/' || currentPath === '';
    } else if (normalizedHref.startsWith('/about')) {
      isActive = currentPath.startsWith('/about');
    } else if (normalizedHref.startsWith('/projects')) {
      isActive = currentPath.startsWith('/projects');
    } else if (normalizedHref.startsWith('/blog')) {
      isActive = currentPath.startsWith('/blog');
    } else if (normalizedHref.startsWith('/contact')) {
      isActive = currentPath.startsWith('/contact');
    }

    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Developer console banner
 */
function initConsoleBanner() {
  console.log(
    '%cSSRNovX Personal Portfolio & Blog%c\nBuildLab B04 | Complete UI Design Phase | Monochrome System',
    'font-weight: bold; font-size: 13px; color: #ffffff; background: #000000; padding: 4px 8px; border-radius: 4px;',
    'font-size: 11px; color: #888888; margin-top: 4px;'
  );
}
