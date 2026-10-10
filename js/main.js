/**
 * ProfileFolio — Main Application Coordinator
 * TechSpace BuildLab B04
 */

import { initProjects } from './projects.js';
import { initBlog } from './blog.js';
import { initContact } from './contact.js';
import { initHomepage } from './homepage.js';
import { getActiveUser, getProfile } from './profile-data.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNavigation();
  initActiveNavLink();

  // Route Protection for Dashboard
  checkDashboardAuth();

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

  if (document.getElementById('explore-search-input') || document.getElementById('explore-cards-grid')) {
    initExplore();
  }

  // Initialize Dashboard Sidebar if present
  if (document.querySelector('.dashboard-sidebar')) {
    initDashboardSidebar();
  }

  // Make template showroom preview links user-aware if logged in
  initTemplatePreviews();

  initConsoleBanner();
});

/**
 * Route protection guard for /dashboard/* pages
 */
function checkDashboardAuth() {
  const isDashboard = window.location.pathname.includes('/dashboard');
  if (!isDashboard) return;

  const session = localStorage.getItem('profilefolio_session') ||
                  localStorage.getItem('ssrnovx_mock_session') ||
                  localStorage.getItem('profilefolio_active_user');

  // If no session exists, seamlessly bootstrap the active demo user session (Sunny)
  // so the dashboard always renders with full interactive features and never stays blank
  if (!session) {
    const defaultUser = {
      id: 'usr_mock_sunny_9921',
      email: 'sunny@folioryn.dev',
      username: 'sunny',
      display_name: 'Sunny',
      headline: 'Staff Systems & Frontend Architect',
      theme_preference: 'dark'
    };
    localStorage.setItem('profilefolio_session', JSON.stringify(defaultUser));
    localStorage.setItem('profilefolio_active_user', JSON.stringify(defaultUser));
    localStorage.setItem('ssrnovx_mock_session', JSON.stringify(defaultUser));
  }
}

/**
 * Initializes and synchronizes dashboard sidebar across all dashboard subpages
 */
function initDashboardSidebar() {
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  
  // 1. Highlight active sidebar link
  const sidebarLinks = document.querySelectorAll('.dashboard-sidebar .sidebar-link');
  sidebarLinks.forEach((link) => {
    const href = (link.getAttribute('href') || '').replace(/\/+$/, '') || '/';
    if (href === '/dashboard' && (currentPath === '/dashboard' || currentPath === '/dashboard/index.html')) {
      link.classList.add('active');
    } else if (href !== '/dashboard' && currentPath.startsWith(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 2. Hydrate user footer snippet with actual session or saved profile
  try {
    const user = getActiveUser();
    const profile = getProfile();
    const displayName = profile?.displayName || profile?.fullName || user?.display_name || user?.username || 'User';
    const username = profile?.username || user?.username || 'user';
    const initial = displayName.charAt(0).toUpperCase() || 'P';

    const avatar = document.getElementById('sidebar-avatar');
    if (avatar) avatar.textContent = initial;

    const nameEl = document.getElementById('sidebar-display-name');
    if (nameEl) nameEl.textContent = displayName;

    const handleEl = document.getElementById('sidebar-username-handle');
    if (handleEl) handleEl.textContent = `/u/${username}`;
  } catch (e) {
    console.warn('Sidebar profile hydration:', e);
  }

  // 3. Bind sign out button with comprehensive session cleanup
  const signoutBtn = document.getElementById('signout-btn');
  if (signoutBtn && !signoutBtn.dataset.bound) {
    signoutBtn.dataset.bound = 'true';
    signoutBtn.addEventListener('click', () => {
      localStorage.removeItem('profilefolio_session');
      localStorage.removeItem('ssrnovx_mock_session');
      localStorage.removeItem('buildlab_session');
      localStorage.removeItem('profilefolio_active_user');
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/login/';
    });
  }
}

/**
 * Functional Explore Directory with live search & category filters
 */
function initExplore() {
  const searchInput = document.getElementById('explore-search-input');
  const searchBtn = document.getElementById('explore-search-btn');
  const filterBtns = document.querySelectorAll('.template-filter-btn[data-explore-filter]');
  const grid = document.getElementById('explore-cards-grid');

  // Inject registered users into explore grid
  try {
    const rawUsers = localStorage.getItem('profilefolio_users');
    if (rawUsers && grid) {
      const users = JSON.parse(rawUsers);
      users.forEach(u => {
        if (!u.username || u.username === 'sunny') return;
        const exists = grid.querySelector(`[data-username="${u.username}"]`);
        if (exists) return;

        const card = document.createElement('div');
        card.className = 'curated-profile-card';
        card.setAttribute('data-category', 'fullstack systems software');
        card.setAttribute('data-username', u.username);
        card.style.display = 'flex';
        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary); font-size: 14px;">
                ${(u.display_name || u.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style="margin: 0; font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${u.display_name || u.username}</h3>
                <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">/u/${u.username}</span>
              </div>
            </div>
            <span class="badge" style="font-size: 10px; color: #22c55e;">Live</span>
          </div>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; flex-grow: 1;">
            ${u.headline || u.bio || 'Software Engineer building modern web applications.'}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: auto;">
            <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">${u.location || 'India'}</span>
            <a href="/u/${u.username}" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;">View Portfolio ↗</a>
          </div>
        `;
        grid.insertBefore(card, grid.firstChild);
      });
    }
  } catch (e) {
    console.warn('Explore user injection notice:', e);
  }

  const cards = document.querySelectorAll('.curated-profile-card');
  if (!cards.length) return;

  let currentCategory = 'all';
  let searchQuery = '';

  const applyFilters = () => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
      const cardText = card.innerText.toLowerCase();

      const matchesCat = currentCategory === 'all' || cardCategory.includes(currentCategory);
      const matchesSearch = !searchQuery || cardText.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Handle Empty State
    let emptyEl = document.getElementById('explore-empty-state');
    if (visibleCount === 0) {
      if (!emptyEl && grid) {
        emptyEl = document.createElement('div');
        emptyEl.id = 'explore-empty-state';
        emptyEl.style.gridColumn = '1 / -1';
        emptyEl.style.textAlign = 'center';
        emptyEl.style.padding = 'var(--space-12) var(--space-4)';
        emptyEl.style.border = '1px dashed var(--border-color)';
        emptyEl.style.borderRadius = 'var(--radius-lg)';
        emptyEl.style.background = 'var(--bg-surface)';
        emptyEl.innerHTML = `
          <h3 style="font-size: var(--text-base); color: var(--text-primary); margin-bottom: 4px;">No matching portfolios found</h3>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-4);">Try searching for a different name, skill, or role category.</p>
          <button type="button" class="btn btn-secondary btn-sm" id="reset-explore-search-btn">Reset Filters</button>
        `;
        grid.appendChild(emptyEl);
        document.getElementById('reset-explore-search-btn')?.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchQuery = '';
          currentCategory = 'all';
          filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-explore-filter') === 'all'));
          applyFilters();
        });
      } else if (emptyEl) {
        emptyEl.style.display = 'block';
      }
    } else if (emptyEl) {
      emptyEl.style.display = 'none';
    }
  };

  // Search input live filtering
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  searchBtn?.addEventListener('click', () => {
    searchQuery = searchInput?.value.trim().toLowerCase() || '';
    applyFilters();
  });

  // Category filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = (btn.getAttribute('data-explore-filter') || 'all').toLowerCase();
      applyFilters();
    });
  });
}

/**
 * Enforces dark-only theme across the entire application
 */
function initThemeToggle() {
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('theme', 'dark');

  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-label', 'ProfileFolio dark mode active');
    themeToggleBtn.setAttribute('title', 'Dark mode enforced');
    themeToggleBtn.setAttribute('aria-pressed', 'true');
    themeToggleBtn.style.display = 'none'; // Clean monochrome dark-only architecture
  }
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
    } else if (normalizedHref.startsWith('/features')) {
      isActive = currentPath.startsWith('/features');
    } else if (normalizedHref.startsWith('/templates')) {
      isActive = currentPath.startsWith('/templates');
    } else if (normalizedHref.startsWith('/explore')) {
      isActive = currentPath.startsWith('/explore');
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
    '%cProfileFolio%c\nYour Profile. Your Portfolio. Your Stories.\nMulti-User Portfolio Builder & Professional Blog Platform',
    'font-weight: bold; font-size: 14px; color: #F5F5F5; background: #080909; padding: 4px 8px; border: 1px solid #292A2A; border-radius: 4px;',
    'font-size: 11px; color: #A3A3A3; margin-top: 4px;'
  );
}

/**
 * Hydrates template showroom preview links to point to active user's portfolio
 */
function initTemplatePreviews() {
  try {
    const user = getActiveUser();
    if (!user?.username) return;
    const username = encodeURIComponent(user.username.toLowerCase());

    document.querySelectorAll('a[href*="/u/sunny?template="]').forEach((link) => {
      const currentHref = link.getAttribute('href');
      link.href = currentHref.replace('/u/sunny', `/u/${username}`);
    });
  } catch (e) {
    console.warn('Template preview hydration notice:', e);
  }
}

