/**
 * Folioryn — Centralized Theme Manager
 * 
 * Manages the three complete website themes:
 * 1. 'dark'  — Premium Obsidian + Emerald (New Default)
 * 2. 'light' — Ivory + Forest Green
 * 3. 'night' — Preserved original Folioryn warm stone monochrome
 *
 * Capabilities:
 * - Immediate DOM update without page reload or state loss
 * - Instant persistence across localStorage, user session, and backend profile
 * - Anti-FOUC direct-load integration
 * - Accessible compact header toggle / dropdown menu
 * - Rich 3-option visual preview cards for Settings
 * - Cross-tab synchronization via BroadcastChannel & storage events
 */

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  NIGHT: 'night'
};

export const THEME_LIST = ['dark', 'light', 'night'];
export const DEFAULT_THEME = 'dark';
export const STORAGE_KEY = 'folioryn_theme';
export const LEGACY_STORAGE_KEY = 'theme';

export const THEME_METADATA = {
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    badge: 'Premium Default',
    subtitle: 'Obsidian + Emerald',
    description: 'Refined obsidian background with elevated charcoal surfaces and vibrant emerald green accents.',
    iconSvg: `<svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`,
    swatch: {
      bg: '#050706',
      card: '#101512',
      surface: '#171D19',
      border: '#26352B',
      accent: '#8FE0AE',
      accentHover: '#A6EABD',
      text: '#F4F7F4',
      textMuted: '#929F95'
    }
  },
  light: {
    id: 'light',
    name: 'Light Theme',
    badge: 'Ivory + Forest',
    subtitle: 'Ivory + Forest Green',
    description: 'Warm ivory canvas with crisp white cards, botanical tones, and deep forest green accents.',
    iconSvg: `<svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>`,
    swatch: {
      bg: '#F7F5EF',
      card: '#FFFFFF',
      surface: '#EFEEE6',
      border: '#E5E2D8',
      accent: '#315C46',
      accentHover: '#264A38',
      text: '#20372D',
      textMuted: '#62685F'
    }
  },
  night: {
    id: 'night',
    name: 'Night Theme',
    badge: 'Classic Folioryn',
    subtitle: 'Warm Stone Monochrome',
    description: 'Preserved original Folioryn website theme with soft warm stone tones and graphite surfaces.',
    iconSvg: `<svg class="icon-star" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    swatch: {
      bg: '#080909',
      card: '#101111',
      surface: '#141515',
      border: '#292A2A',
      accent: '#D6D1C7',
      accentHover: '#C5C0B6',
      text: '#D1CCC2',
      textMuted: '#726E67'
    }
  }
};

/**
 * Validates a theme string
 */
export function isValidTheme(theme) {
  return typeof theme === 'string' && THEME_LIST.includes(theme.toLowerCase());
}

/**
 * Reads the active theme preference with full fallback hierarchy:
 * 1. Saved localStorage ('folioryn_theme' or 'theme')
 * 2. Authenticated user profile preference
 * 3. Default to 'dark'
 */
export function getTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isValidTheme(saved)) {
      return saved.toLowerCase();
    }

    // Check session user preference
    const rawSession = localStorage.getItem('profilefolio_session') ||
                       localStorage.getItem('profilefolio_active_user') ||
                       localStorage.getItem('ssrnovx_mock_session');
    if (rawSession) {
      const user = JSON.parse(rawSession);
      const pref = user.theme_preference || user.theme;
      if (isValidTheme(pref)) {
        return pref.toLowerCase();
      }
    }
  } catch (e) {
    // Graceful fallback on storage access issues
  }

  return DEFAULT_THEME;
}

/**
 * Applies a theme immediately and persists it
 * @param {string} themeName - 'dark' | 'light' | 'night'
 * @param {boolean} persist - Whether to persist to storage and user profile
 */
export function setTheme(themeName, persist = true) {
  const targetTheme = isValidTheme(themeName) ? themeName.toLowerCase() : DEFAULT_THEME;

  // 1. Apply to DOM root immediately
  document.documentElement.setAttribute('data-theme', targetTheme);

  // 2. Persist to localStorage
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, targetTheme);
      localStorage.setItem(LEGACY_STORAGE_KEY, targetTheme);
    } catch (e) {}

    // 3. Persist to active user profile and registry if authenticated
    try {
      const rawSession = localStorage.getItem('profilefolio_session') ||
                         localStorage.getItem('profilefolio_active_user') ||
                         localStorage.getItem('ssrnovx_mock_session');
      if (rawSession) {
        const user = JSON.parse(rawSession);
        user.theme_preference = targetTheme;
        localStorage.setItem('profilefolio_session', JSON.stringify(user));
        localStorage.setItem('profilefolio_active_user', JSON.stringify(user));
        localStorage.setItem('ssrnovx_mock_session', JSON.stringify(user));

        // Multi-user registry sync
        const rawRegistry = localStorage.getItem('profilefolio_users_registry');
        if (rawRegistry) {
          const users = JSON.parse(rawRegistry);
          const idx = users.findIndex(u => u.id === user.id || u.username === user.username);
          if (idx !== -1) {
            users[idx].theme_preference = targetTheme;
            localStorage.setItem('profilefolio_users_registry', JSON.stringify(users));
          }
        }

        // Scoped profile data sync
        const uid = user.id || (user.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
        const profileKey = `profilefolio_user_${uid}_profile`;
        const rawProf = localStorage.getItem(profileKey);
        if (rawProf) {
          const prof = JSON.parse(rawProf);
          prof.theme = targetTheme;
          localStorage.setItem(profileKey, JSON.stringify(prof));
        }

        // Sync to global mock profile
        const rawGlobalProf = localStorage.getItem('profilefolio_profile');
        if (rawGlobalProf) {
          const prof = JSON.parse(rawGlobalProf);
          prof.theme = targetTheme;
          localStorage.setItem('profilefolio_profile', JSON.stringify(prof));
        }

        // Supabase remote sync if online
        if (window.profileService && typeof window.profileService.updateProfile === 'function') {
          window.profileService.updateProfile(user.id, { theme_preference: targetTheme }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Error syncing theme with user profile:', e);
    }
  }

  // 4. Update all UI elements on current page
  updateThemeUI(targetTheme);

  // 5. Dispatch event for custom observers
  window.dispatchEvent(new CustomEvent('folioryn:theme-changed', {
    detail: { theme: targetTheme }
  }));

  return targetTheme;
}

/**
 * Cycles to the next theme: dark -> light -> night -> dark
 */
export function cycleTheme() {
  const current = getTheme();
  const idx = THEME_LIST.indexOf(current);
  const next = THEME_LIST[(idx + 1) % THEME_LIST.length];
  return setTheme(next, true);
}

/**
 * Updates UI state for all toggle buttons, dropdowns, and settings cards
 */
export function updateThemeUI(activeTheme) {
  const meta = THEME_METADATA[activeTheme] || THEME_METADATA.dark;

  // 1. Update all theme toggle buttons
  document.querySelectorAll('.theme-toggle-btn, #theme-toggle').forEach(btn => {
    btn.style.display = 'inline-flex';
    btn.setAttribute('aria-label', `Theme: ${meta.name} (Click to switch)`);
    btn.setAttribute('title', `Active Theme: ${meta.name}`);
    btn.setAttribute('data-active-theme', activeTheme);

    // Ensure all 3 SVG icons exist inside the button
    ensureButtonIcons(btn);
  });

  // 2. Update active states in all dropdown items
  document.querySelectorAll('.theme-dropdown-item').forEach(item => {
    const itemTheme = item.getAttribute('data-theme-value');
    const isSelected = itemTheme === activeTheme;
    item.classList.toggle('is-selected', isSelected);
    item.setAttribute('aria-checked', isSelected ? 'true' : 'false');

    const checkEl = item.querySelector('.theme-dropdown-item-check');
    if (checkEl) checkEl.style.display = isSelected ? 'inline-block' : 'none';
  });

  // 3. Update dedicated Settings Theme Cards
  document.querySelectorAll('.theme-option-card').forEach(card => {
    const cardTheme = card.getAttribute('data-theme-value');
    const isActive = cardTheme === activeTheme;
    card.classList.toggle('is-active', isActive);
    card.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });

  // 4. Update any save indicator
  const saveIndicator = document.getElementById('theme-save-indicator');
  if (saveIndicator) {
    saveIndicator.style.display = 'inline-flex';
    setTimeout(() => {
      saveIndicator.style.display = 'none';
    }, 2500);
  }
}

/**
 * Ensures moon, sun, and star SVGs exist inside a toggle button
 */
function ensureButtonIcons(btn) {
  let moon = btn.querySelector('.icon-moon');
  let sun = btn.querySelector('.icon-sun');
  let star = btn.querySelector('.icon-star');

  if (!moon) {
    const tmp = document.createElement('div');
    tmp.innerHTML = THEME_METADATA.dark.iconSvg;
    moon = tmp.firstElementChild;
    btn.appendChild(moon);
  }
  if (!sun) {
    const tmp = document.createElement('div');
    tmp.innerHTML = THEME_METADATA.light.iconSvg;
    sun = tmp.firstElementChild;
    btn.appendChild(sun);
  }
  if (!star) {
    const tmp = document.createElement('div');
    tmp.innerHTML = THEME_METADATA.night.iconSvg;
    star = tmp.firstElementChild;
    btn.appendChild(star);
  }

  // Ensure accessible attributes
  moon.setAttribute('aria-hidden', 'true');
  sun.setAttribute('aria-hidden', 'true');
  star.setAttribute('aria-hidden', 'true');
}

/**
 * Closes any open theme dropdowns
 */
function closeAllDropdowns() {
  document.querySelectorAll('.theme-dropdown-menu').forEach(menu => {
    menu.remove();
  });
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Renders and attaches a floating dropdown menu to a toggle button
 */
function toggleThemeDropdown(btn) {
  const existing = document.querySelector('.theme-dropdown-menu');
  if (existing) {
    const parentBtn = existing.getAttribute('data-for-btn');
    closeAllDropdowns();
    if (parentBtn === btn.id) return;
  }

  const currentTheme = getTheme();
  const menu = document.createElement('div');
  menu.className = 'theme-dropdown-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Select Folioryn theme');
  if (btn.id) menu.setAttribute('data-for-btn', btn.id);

  menu.innerHTML = `
    <div class="theme-dropdown-header">Switch Theme</div>
    ${THEME_LIST.map(themeKey => {
      const meta = THEME_METADATA[themeKey];
      const isSelected = themeKey === currentTheme;
      return `
        <button type="button" class="theme-dropdown-item ${isSelected ? 'is-selected' : ''}"
          role="menuitemradio"
          aria-checked="${isSelected ? 'true' : 'false'}"
          data-theme-value="${themeKey}">
          <span class="theme-dropdown-item-left">
            <span class="theme-dropdown-item-swatch" style="background: ${meta.swatch.accent};"></span>
            <span>${meta.name}</span>
          </span>
          <span class="theme-dropdown-item-check" style="display: ${isSelected ? 'inline-block' : 'none'};">✓</span>
        </button>
      `;
    }).join('')}
  `;

  // Position relative to button
  btn.style.position = 'relative';
  btn.setAttribute('aria-expanded', 'true');
  btn.appendChild(menu);

  // Click handler for items
  menu.querySelectorAll('.theme-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const chosen = item.getAttribute('data-theme-value');
      setTheme(chosen, true);
      closeAllDropdowns();
      btn.focus();
    });
  });

  // Keyboard navigation within dropdown
  const items = Array.from(menu.querySelectorAll('.theme-dropdown-item'));
  menu.addEventListener('keydown', (e) => {
    const currentIndex = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (currentIndex + 1) % items.length;
      items[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (currentIndex - 1 + items.length) % items.length;
      items[prev].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAllDropdowns();
      btn.focus();
    }
  });

  // Focus the first item or currently selected item
  const selectedItem = menu.querySelector('.theme-dropdown-item.is-selected') || items[0];
  if (selectedItem) selectedItem.focus();
}

/**
 * Initializes all toggle buttons on the page
 */
export function initThemeToggleButtons() {
  document.querySelectorAll('.theme-toggle-btn, #theme-toggle').forEach(btn => {
    btn.style.display = 'inline-flex';
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    ensureButtonIcons(btn);

    // Remove old listeners to prevent duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleThemeDropdown(newBtn);
    });

    // Double-click or Shift-click cycles directly
    newBtn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      cycleTheme();
      closeAllDropdowns();
    });
  });

  // Global click listener to close dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-dropdown-menu') && !e.target.closest('.theme-toggle-btn')) {
      closeAllDropdowns();
    }
  });

  // Escape key closes dropdown
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}

/**
 * Generates the HTML for the rich 3-option Settings theme selector
 */
export function renderThemeSettingsSelector(containerId = 'theme-selector-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentTheme = getTheme();

  container.innerHTML = `
    <div class="theme-options-grid" role="radiogroup" aria-label="Choose Folioryn visual theme">
      ${THEME_LIST.map(themeKey => {
        const meta = THEME_METADATA[themeKey];
        const isActive = themeKey === currentTheme;
        return `
          <div class="theme-option-card ${isActive ? 'is-active' : ''}"
               role="radio"
               tabindex="0"
               aria-checked="${isActive ? 'true' : 'false'}"
               data-theme-value="${themeKey}"
               aria-label="${meta.name}: ${meta.description}">
            
            <div class="theme-card-header">
              <div class="theme-card-title-group">
                <span class="theme-card-icon">${meta.iconSvg}</span>
                <h4 class="theme-card-name">${meta.name}</h4>
              </div>
              <span class="theme-card-badge">${meta.badge}</span>
            </div>

            <p class="theme-card-description">${meta.description}</p>

            <!-- Miniature UI Preview Swatch -->
            <div class="theme-card-preview theme-preview-${themeKey}" aria-hidden="true">
              <div class="theme-preview-surface">
                <div class="theme-preview-bar theme-preview-bar-primary"></div>
                <div class="theme-preview-bar theme-preview-bar-secondary"></div>
                <div class="theme-preview-btn">Button</div>
              </div>
              <div class="theme-preview-swatches">
                <span class="theme-preview-color-dot" style="background: ${meta.swatch.bg};" title="Background: ${meta.swatch.bg}"></span>
                <span class="theme-preview-color-dot" style="background: ${meta.swatch.card};" title="Card: ${meta.swatch.card}"></span>
                <span class="theme-preview-color-dot" style="background: ${meta.swatch.border};" title="Border: ${meta.swatch.border}"></span>
                <span class="theme-preview-color-dot" style="background: ${meta.swatch.accent};" title="Accent: ${meta.swatch.accent}"></span>
              </div>
            </div>

            <div class="theme-card-footer">
              <div class="theme-card-radio">
                <span class="theme-radio-circle">
                  <span class="theme-radio-inner"></span>
                </span>
                <span>${isActive ? 'Active Theme' : 'Select Theme'}</span>
              </div>
            </div>

          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach event handlers for mouse, touch, and keyboard
  const cards = Array.from(container.querySelectorAll('.theme-option-card'));

  cards.forEach((card, idx) => {
    const themeKey = card.getAttribute('data-theme-value');

    // Click handler
    card.addEventListener('click', () => {
      setTheme(themeKey, true);
    });

    // Keyboard navigation (Arrow keys + Enter / Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setTheme(themeKey, true);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (idx + 1) % cards.length;
        cards[next].focus();
        setTheme(cards[next].getAttribute('data-theme-value'), true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (idx - 1 + cards.length) % cards.length;
        cards[prev].focus();
        setTheme(cards[prev].getAttribute('data-theme-value'), true);
      }
    });
  });
}

/**
 * Initializes the entire theme manager:
 * - Reads & sets initial theme
 * - Wires up toggle buttons
 * - Wires up settings cards if present
 * - Listens for storage events across tabs
 */
export function initThemeManager() {
  const currentTheme = getTheme();
  setTheme(currentTheme, false);

  initThemeToggleButtons();

  // If settings container exists, hydrate it
  if (document.getElementById('theme-selector-container')) {
    renderThemeSettingsSelector('theme-selector-container');
  }

  // Cross-tab sync
  window.addEventListener('storage', (e) => {
    if ((e.key === STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) && isValidTheme(e.newValue)) {
      setTheme(e.newValue, false);
    }
  });
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initThemeManager());
  } else {
    initThemeManager();
  }
}
