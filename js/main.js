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
  initMobileBottomNav();
  initScrollAnimations();
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

  // Update navbar actions if user is signed in (without replacing homepage)
  initPublicNavbarAuth();

  initConsoleBanner();
});

/**
 * Route protection guard for /dashboard/* pages
 * Strictly blocks unauthorized entry into dashboard and redirects to login.
 */
function checkDashboardAuth() {
  const isDashboard = window.location.pathname.includes('/dashboard');
  if (!isDashboard) return true;

  try {
    const raw = localStorage.getItem('profilefolio_session') ||
                localStorage.getItem('ssrnovx_mock_session') ||
                localStorage.getItem('profilefolio_active_user');
    const user = raw ? JSON.parse(raw) : null;
    if (!user || (!user.id && !user.username && !user.email)) {
      const target = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`/login/?redirect=${target}&auth=required`);
      return false;
    }
  } catch (e) {
    const target = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login/?redirect=${target}&auth=required`);
    return false;
  }
  return true;
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

  // 4. Inject mobile toggle into .dashboard-topbar if not present
  const topbar = document.querySelector('.dashboard-topbar');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (topbar && sidebar && !document.getElementById('dashboard-mobile-toggle')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'dashboard-mobile-toggle';
    toggleBtn.className = 'mobile-toggle-btn';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-label', 'Toggle Dashboard Menu');
    toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    toggleBtn.style.marginRight = '12px';
    topbar.insertBefore(toggleBtn, topbar.firstChild);

    let backdrop = document.querySelector('.dashboard-sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'dashboard-sidebar-backdrop mobile-nav-backdrop';
      document.body.appendChild(backdrop);
    }

    const toggleSidebar = (open) => {
      const next = typeof open === 'boolean' ? open : !sidebar.classList.contains('is-open');
      sidebar.classList.toggle('is-open', next);
      backdrop.classList.toggle('is-active', next);
      toggleBtn.classList.toggle('is-active', next);
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });

    backdrop.addEventListener('click', () => toggleSidebar(false));

    sidebar.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', () => toggleSidebar(false));
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
 * Handles mobile hamburger menu expansion, backdrop overlay,
 * animated drawer states, and touch accessibility.
 */
function initMobileNavigation() {
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!mobileToggleBtn || !navMenu) return;

  // 1. Create or get backdrop overlay
  let backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  // 2. Inject drawer action buttons if not already present (strictly for mobile drawer)
  if (!navMenu.querySelector('.mobile-drawer-actions')) {
    const actionsWrapper = document.createElement('li');
    actionsWrapper.className = 'mobile-drawer-actions';
    actionsWrapper.innerHTML = `
      <a href="/login/" class="btn btn-secondary">Sign In</a>
      <a href="/signup/" class="btn btn-primary">Create Your Portfolio &rarr;</a>
    `;
    navMenu.appendChild(actionsWrapper);
  }

  const toggleMenu = (open) => {
    const isCurrentlyOpen = navMenu.classList.contains('is-open');
    const nextState = typeof open === 'boolean' ? open : !isCurrentlyOpen;

    mobileToggleBtn.setAttribute('aria-expanded', String(nextState));
    mobileToggleBtn.classList.toggle('is-active', nextState);
    navMenu.classList.toggle('is-open', nextState);
    backdrop.classList.toggle('is-active', nextState);

    // Prevent background scrolling when mobile menu is open
    document.body.style.overflow = nextState ? 'hidden' : '';
  };

  mobileToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  backdrop.addEventListener('click', () => toggleMenu(false));

  navMenu.querySelectorAll('.nav-link, .btn').forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleMenu(false);
      mobileToggleBtn.focus();
    }
  });
}

/**
 * Injects persistent native-like bottom navigation dock for mobile devices
 */
function initMobileBottomNav() {
  if (document.querySelector('.mobile-bottom-nav')) return;

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isDashboard = pathname.startsWith('/dashboard');

  const bottomNav = document.createElement('nav');
  bottomNav.className = 'mobile-bottom-nav';
  bottomNav.setAttribute('aria-label', 'Mobile Bottom Navigation');

  if (isDashboard) {
    bottomNav.innerHTML = `
      <a href="/dashboard/" class="mobile-bottom-tab ${pathname === '/dashboard' || pathname === '/dashboard/index.html' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Overview</span>
      </a>
      <a href="/dashboard/builder/" class="mobile-bottom-tab ${pathname.includes('/builder') ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <span>Builder</span>
      </a>
      <a href="/dashboard/projects/" class="mobile-bottom-tab ${pathname.includes('/projects') ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>Projects</span>
      </a>
      <a href="/dashboard/resume/" class="mobile-bottom-tab ${pathname.includes('/resume') ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>Resume</span>
      </a>
      <button type="button" id="mobile-sidebar-toggle-trigger" class="mobile-bottom-tab" style="background:none; border:none; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <span>Menu</span>
      </button>
    `;
  } else {
    bottomNav.innerHTML = `
      <a href="/" class="mobile-bottom-tab ${pathname === '/' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </a>
      <a href="/features/" class="mobile-bottom-tab ${pathname.includes('/features') ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>Features</span>
      </a>
      <a href="/templates/" class="mobile-bottom-tab ${pathname.includes('/templates') ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>Templates</span>
      </a>
      <a href="/explore/" class="mobile-bottom-tab ${pathname.includes('/explore') ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
        <span>Explore</span>
      </a>
      <a href="/dashboard/" class="mobile-bottom-tab ${pathname.includes('/dashboard') ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Studio</span>
      </a>
    `;
  }

  document.body.appendChild(bottomNav);

  // Hook bottom trigger for dashboard sidebar toggle
  const trigger = document.getElementById('mobile-sidebar-toggle-trigger');
  if (trigger) {
    trigger.addEventListener('click', () => {
      const sidebar = document.querySelector('.dashboard-sidebar');
      if (sidebar) {
        const isOpen = sidebar.classList.toggle('is-open');
        let sbBackdrop = document.querySelector('.dashboard-sidebar-backdrop');
        if (!sbBackdrop) {
          sbBackdrop = document.createElement('div');
          sbBackdrop.className = 'dashboard-sidebar-backdrop mobile-nav-backdrop';
          document.body.appendChild(sbBackdrop);
          sbBackdrop.addEventListener('click', () => {
            sidebar.classList.remove('is-open');
            sbBackdrop.classList.remove('is-active');
          });
        }
        sbBackdrop.classList.toggle('is-active', isOpen);
      }
    });
  }
}

/**
 * Silky Smooth Scroll Reveal & Intersection Observer Animations
 */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.feature-card, .curated-profile-card, .project-card, .blog-card, .template-card, .floating-card, .section-header, .about-card, .education-item, .contact-card, .roadmap-card, .stat-card'
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  targets.forEach((el, index) => {
    el.classList.add('reveal-on-scroll');
    const staggerIndex = (index % 5) + 1;
    el.classList.add(`reveal-stagger-${staggerIndex}`);
    observer.observe(el);
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
    'font-weight: bold; font-size: 14px; color: #EDE8E1; background: #080909; padding: 4px 8px; border: 1px solid #292A2A; border-radius: 4px;',
    'font-size: 11px; color: #A8A39D; margin-top: 4px;'
  );
}

/**
 * Updates public navbar actions if a user session is active,
 * giving quick access to Dashboard without replacing the public platform homepage.
 */
function initPublicNavbarAuth() {
  try {
    const rawSession = localStorage.getItem('profilefolio_session') || localStorage.getItem('ssrnovx_mock_session');
    if (!rawSession) return;
    const user = JSON.parse(rawSession);
    if (!user || !user.username) return;

    // Check if on a public page with sign in / sign up buttons
    const signinLinks = document.querySelectorAll('a[href="/login/"], a[href="/login"]');
    signinLinks.forEach(link => {
      link.href = '/dashboard/';
      link.textContent = 'Dashboard';
    });

    const signupLinks = document.querySelectorAll('header .btn-primary[href="/signup/"], header .btn-primary[href="/signup"]');
    signupLinks.forEach(link => {
      link.href = '/dashboard/builder/';
      link.textContent = 'Edit Portfolio →';
    });
  } catch (e) {
    // Non-blocking
  }
}


