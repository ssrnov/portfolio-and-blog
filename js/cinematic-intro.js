/**
 * Folioryn — Cinematic Three-Theme-Aware Intro Animation
 * 
 * Brand: Folioryn
 * Tagline: Your Identity. Your Portfolio. Your Story.
 * Concept: The Birth of an Identity
 * Duration: 2.0s – 2.4s
 * 
 * Features:
 * - Three-theme aware: Dark (Obsidian + Emerald), Light (Ivory + Forest Green), Night (Warm Stone)
 * - Zero-flash on first visible frame (bound to data-theme and intro semantic tokens)
 * - Live theme synchronization if theme toggles during playback
 * - Session gated: plays on full-page visit / reload, never during client-side route transitions
 * - Supports direct URL landing (/u/:username, /login, /signup, etc.) without redirection
 * - Hard safety timeout (2.5s) prevents stuck overlay under any conditions
 * - Accessible: prefers-reduced-motion support, ESC key / skip button, ARIA dialog semantics
 */

export const INTRO_SESSION_KEY = 'folioryn_intro_seen';
export const INTRO_ELEMENT_ID = 'folioryn-cinematic-intro';
export const INTRO_TARGET_DURATION_MS = 2420;
export const INTRO_REVEAL_START_MS = 2050;
export const INTRO_SAFETY_TIMEOUT_MS = 2550;

let _isPlaying = false;
let _currentResolve = null;

/**
 * Determine whether the cinematic intro should play for this visit.
 * Plays on fresh session visit or full-page reload.
 * Can be forced via ?intro=true or suppressed via ?skipIntro=true.
 */
export function shouldPlayIntro() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  // Allow URL parameter overrides for testing and previewing
  const params = new URLSearchParams(window.location.search);
  if (params.get('skipIntro') === 'true' || params.get('noIntro') === 'true') {
    return false;
  }
  if (params.get('intro') === 'true' || params.get('intro') === '1' || params.get('forceIntro') === 'true') {
    return true;
  }

  // Do not play intro on dashboard workspaces
  if (window.location.pathname.startsWith('/dashboard') || document.body.classList.contains('dashboard-shell')) {
    return false;
  }

  // If already playing in current document lifecycle, don't duplicate
  if (_isPlaying || document.getElementById(INTRO_ELEMENT_ID)) {
    return false;
  }

  // Detect genuine full-page reload
  try {
    const navEntries = performance.getEntriesByType?.('navigation');
    if (navEntries && navEntries.length > 0 && navEntries[0].type === 'reload') {
      return true;
    }
    if (performance.navigation && performance.navigation.type === 1) {
      return true;
    }
  } catch (e) {
    // Graceful fallback
  }

  // If not previously seen in this session, play
  try {
    const seen = sessionStorage.getItem(INTRO_SESSION_KEY);
    return !seen;
  } catch (e) {
    return true;
  }
}

/**
 * Build the DOM structure for the cinematic intro overlay.
 */
export function createIntroDOM() {
  const overlay = document.createElement('aside');
  overlay.id = INTRO_ELEMENT_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Folioryn introduction');

  overlay.innerHTML = `
    <div class="intro-canvas-grid" aria-hidden="true"></div>
    <div class="intro-atmosphere-glow" aria-hidden="true"></div>
    <div class="intro-corner intro-corner-tl" aria-hidden="true"></div>
    <div class="intro-corner intro-corner-tr" aria-hidden="true"></div>
    <div class="intro-corner intro-corner-bl" aria-hidden="true"></div>
    <div class="intro-corner intro-corner-br" aria-hidden="true"></div>
    
    <button type="button" class="intro-skip-btn" aria-label="Skip intro animation">
      SKIP [ESC]
    </button>
    
    <div class="intro-brand-composition">
      <div class="intro-emblem-container" aria-hidden="true">
        <svg class="intro-emblem-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="intro-path-frame" d="M 40 10 L 68 26 L 68 54 L 40 70 L 12 54 L 12 26 Z" />
          <path class="intro-path-folio" d="M 40 22 C 28 26 22 36 22 48 C 22 58 32 63 40 65 C 48 63 58 58 58 48 C 58 36 52 26 40 22 Z" />
          <path class="intro-path-spine" d="M 40 20 L 40 64" />
          <path class="intro-path-facet" d="M 40 34 L 28 42 M 40 44 L 30 52 M 40 34 L 52 42 M 40 44 L 50 52" />
        </svg>
        <div class="intro-light-beam"></div>
      </div>
      
      <div class="intro-wordmark-wrapper">
        <div class="intro-wordmark">FOLIORYN</div>
      </div>
      
      <div class="intro-tagline">Your Identity. Your Portfolio. Your Story.</div>
    </div>
  `;

  return overlay;
}

/**
 * Play the cinematic intro animation.
 * @param {Object} options
 * @param {boolean} options.force Force playback even if seen in session
 * @param {Function} options.onComplete Callback when intro completes
 * @returns {Promise<boolean>} Resolves true when finished
 */
export function playCinematicIntro(options = {}) {
  const { force = false, onComplete = null } = options;

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // Gating check
  if (!force && !shouldPlayIntro()) {
    if (typeof onComplete === 'function') onComplete();
    return Promise.resolve(false);
  }

  // Prevent duplicate instances
  const existing = document.getElementById(INTRO_ELEMENT_ID);
  if (existing) {
    existing.remove();
  }

  // Ensure HTML has the active data-theme before mounting overlay
  try {
    if (!document.documentElement.getAttribute('data-theme')) {
      const saved = localStorage.getItem('folioryn_theme') || localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (e) {
    // Non-fatal
  }

  return new Promise((resolve) => {
    _isPlaying = true;
    _currentResolve = resolve;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mount intro DOM
    const overlay = createIntroDOM();
    document.body.prepend(overlay);

    // Save scroll state & prevent background scroll during the brief intro
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Set session flag so normal internal navigation does not replay
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch (e) {
      // Non-fatal
    }

    let isFinished = false;
    let revealTimer = null;
    let finishTimer = null;
    let safetyTimer = null;

    const cleanup = () => {
      if (isFinished) return;
      isFinished = true;
      _isPlaying = false;

      // Clear all active timers
      if (revealTimer) clearTimeout(revealTimer);
      if (finishTimer) clearTimeout(finishTimer);
      if (safetyTimer) clearTimeout(safetyTimer);

      // Remove event listeners
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('folioryn:theme-changed', handleThemeChange);

      // Restore body overflow
      document.body.style.overflow = originalOverflow;

      // Remove DOM overlay
      if (overlay && overlay.parentNode) {
        overlay.remove();
      }

      if (typeof onComplete === 'function') {
        try { onComplete(); } catch (e) { /* ignore */ }
      }

      if (_currentResolve) {
        _currentResolve(true);
        _currentResolve = null;
      }
    };

    const triggerRevealAndFinish = (immediate = false) => {
      if (isFinished) return;

      if (immediate || prefersReducedMotion) {
        cleanup();
        return;
      }

      overlay.classList.add('intro-revealing');

      // Allow transition to finish before removing from DOM
      setTimeout(() => {
        cleanup();
      }, 420);
    };

    // Keyboard & interaction skip
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.key === ' ') {
        e.preventDefault();
        triggerRevealAndFinish(true);
      }
    };

    // Live theme synchronization
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme;
      if (newTheme) {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('folioryn:theme-changed', handleThemeChange);

    // Skip button click handler
    const skipBtn = overlay.querySelector('.intro-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerRevealAndFinish(true);
      });
    }

    // Direct overlay click allows fast skip
    overlay.addEventListener('click', () => {
      triggerRevealAndFinish(false);
    });

    // If user prefers reduced motion, complete almost immediately
    if (prefersReducedMotion) {
      setTimeout(() => {
        triggerRevealAndFinish(true);
      }, 80);
      return;
    }

    // Normal choreographed sequence:
    // At INTRO_REVEAL_START_MS (2050ms): begin seamless iris reveal / fade to website
    revealTimer = setTimeout(() => {
      if (!isFinished) {
        overlay.classList.add('intro-revealing');
      }
    }, INTRO_REVEAL_START_MS);

    // At INTRO_TARGET_DURATION_MS (2420ms): finish and remove
    finishTimer = setTimeout(() => {
      cleanup();
    }, INTRO_TARGET_DURATION_MS);

    // Hard safety timeout (2550ms): guarantee overlay is never stuck
    safetyTimer = setTimeout(() => {
      cleanup();
    }, INTRO_SAFETY_TIMEOUT_MS);
  });
}

/**
 * Initialize the cinematic intro on page load.
 */
export function initCinematicIntro() {
  if (typeof document === 'undefined') return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      playCinematicIntro();
    });
  } else {
    playCinematicIntro();
  }
}

// Global API hook for testing, debug, and manual triggers
if (typeof window !== 'undefined') {
  window.FoliorynIntro = {
    play: (force = true) => playCinematicIntro({ force }),
    skip: () => {
      const el = document.getElementById(INTRO_ELEMENT_ID);
      if (el) el.remove();
      _isPlaying = false;
      document.body.style.overflow = '';
      if (_currentResolve) _currentResolve(true);
    },
    shouldPlay: shouldPlayIntro,
    isPlaying: () => _isPlaying,
    version: '1.0.0'
  };
}
