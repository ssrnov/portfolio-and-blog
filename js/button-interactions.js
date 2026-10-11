/**
 * Folioryn — Button Interaction & Switching Animation Engine
 * Comprehensive, lightweight, accessible button animation and segmented control system.
 * 
 * Features:
 * 1. Sliding Background Indicator Pill for segmented controls
 * 2. Button-to-button switching animations with spring easing
 * 3. Tactile click feedback (hover lift, press scale, focus rings)
 * 4. Restrained loading state with double-click submission lock & no layout shift
 * 5. Success state transitions
 * 6. Smooth panel crossfading for associated tab/button views
 * 7. Accessibility & prefers-reduced-motion support
 */

// Active observers map
const observerMap = new WeakMap();

/**
 * Checks if reduced motion is requested
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initializes a sliding background pill for a segmented control group
 * @param {HTMLElement} container 
 * @param {Object} options 
 */
export function initSegmentedControl(container, options = {}) {
  if (!container || !(container instanceof HTMLElement)) return;

  const selector = options.buttonSelector || 'button, [role="tab"], .preset-btn, .viewport-btn, .demo-switch-btn, .device-toggle-btn, .auth-tab-btn, .template-filter-btn';
  const buttons = Array.from(container.querySelectorAll(selector));
  if (buttons.length === 0) return;

  container.classList.add('has-slider');

  // Find or create slider pill
  let pill = container.querySelector(':scope > .segmented-slider-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'segmented-slider-pill';
    pill.setAttribute('aria-hidden', 'true');
    container.insertBefore(pill, container.firstChild);
  }

  // Function to move pill to target button
  function positionPill(targetBtn, immediate = false) {
    if (!targetBtn || !pill) return;

    const cRect = container.getBoundingClientRect();
    const bRect = targetBtn.getBoundingClientRect();

    // Compute relative offset
    const offsetLeft = targetBtn.offsetLeft;
    const offsetTop = targetBtn.offsetTop;
    const width = targetBtn.offsetWidth;
    const height = targetBtn.offsetHeight;

    if (width === 0 || height === 0) {
      pill.style.opacity = '0';
      return;
    }

    if (immediate || prefersReducedMotion()) {
      pill.style.transition = 'none';
    } else {
      pill.style.transition = '';
    }

    pill.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0)`;
    pill.style.width = `${width}px`;
    pill.style.height = `${height}px`;
    pill.style.opacity = '1';
  }

  // Position pill on currently active button
  function updatePill(immediate = false) {
    const activeBtn = container.querySelector(
      ':scope > .active, :scope > [aria-selected="true"], :scope > .is-active, :scope > [data-active="true"]'
    ) || buttons.find(b => b.classList.contains('active') || b.classList.contains('is-active')) || buttons[0];

    if (activeBtn) {
      positionPill(activeBtn, immediate);
    }
  }

  // Bind click handlers to buttons if not purely managed externally
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active on clicked button
      buttons.forEach(b => {
        b.classList.remove('active');
        if (b.hasAttribute('aria-selected')) {
          b.setAttribute('aria-selected', 'false');
        }
      });
      btn.classList.add('active');
      if (btn.hasAttribute('aria-selected')) {
        btn.setAttribute('aria-selected', 'true');
      }

      positionPill(btn, false);
    });
  });

  // Observe container size changes (responsive layouts / font loads)
  if (typeof ResizeObserver !== 'undefined' && !observerMap.has(container)) {
    const ro = new ResizeObserver(() => {
      updatePill(true);
    });
    ro.observe(container);
    observerMap.set(container, ro);
  }

  // Initial layout synchronization
  requestAnimationFrame(() => updatePill(true));
  setTimeout(() => updatePill(true), 120);

  // Store update function on container element
  container.__updateSegmentedSlider = updatePill;
}

/**
 * Updates a specific segmented slider pill position
 */
export function updateSegmentedSlider(container) {
  if (container && typeof container.__updateSegmentedSlider === 'function') {
    container.__updateSegmentedSlider(false);
  } else if (container) {
    initSegmentedControl(container);
  }
}

/**
 * Automatically discovers and initializes all segmented controls across the current page
 */
export function initAllSegmentedControls() {
  const containers = document.querySelectorAll(
    '.preset-group, .builder-viewport-controls, .demo-switcher-tabs, .preview-device-toggle, .auth-tab-group, .segmented-control, [data-segmented-control]'
  );

  containers.forEach(container => {
    initSegmentedControl(container);
  });
}

/**
 * Updates all registered segmented control sliders (e.g. after theme or tab changes)
 */
export function updateAllSegmentedSliders() {
  const containers = document.querySelectorAll(
    '.preset-group, .builder-viewport-controls, .demo-switcher-tabs, .preview-device-toggle, .auth-tab-group, .segmented-control, [data-segmented-control]'
  );
  containers.forEach(container => {
    if (typeof container.__updateSegmentedSlider === 'function') {
      container.__updateSegmentedSlider(false);
    } else {
      initSegmentedControl(container);
    }
  });
}

/**
 * Puts a button into a restrained loading state, preventing double-clicks and layout shifts
 * @param {HTMLButtonElement|HTMLElement} button 
 * @param {boolean} isLoading 
 * @param {string|null} loadingText 
 */
export function setButtonLoading(button, isLoading = true, loadingText = null) {
  if (!button || !(button instanceof HTMLElement)) return;

  if (isLoading) {
    if (button.classList.contains('is-loading')) return; // Already loading

    // Lock width to avoid layout shifts
    const rect = button.getBoundingClientRect();
    if (rect.width > 0) {
      button.style.minWidth = `${rect.width}px`;
    }

    button.__originalHtml = button.innerHTML;
    button.classList.add('is-loading');
    button.setAttribute('data-loading', 'true');
    button.setAttribute('aria-busy', 'true');
    button.disabled = true;

    if (loadingText) {
      button.setAttribute('data-loading-text', loadingText);
    }
  } else {
    button.classList.remove('is-loading');
    button.removeAttribute('data-loading');
    button.removeAttribute('aria-busy');
    button.removeAttribute('data-loading-text');
    button.disabled = false;
    button.style.minWidth = '';

    if (button.__originalHtml) {
      button.innerHTML = button.__originalHtml;
      delete button.__originalHtml;
    }
  }
}

/**
 * Smoothly transitions a button to a success state
 * @param {HTMLButtonElement|HTMLElement} button 
 * @param {string} successText 
 * @param {number} duration 
 */
export function setButtonSuccess(button, successText = 'Saved!', duration = 2000) {
  if (!button || !(button instanceof HTMLElement)) return;

  setButtonLoading(button, false);

  const prevHtml = button.innerHTML;
  button.classList.add('is-success');
  button.innerHTML = `<span>✓ ${successText}</span>`;

  setTimeout(() => {
    button.classList.remove('is-success');
    button.innerHTML = prevHtml;
  }, duration);
}

/**
 * Global capture-phase listener that prevents duplicate click submissions during loading
 */
export function initButtonDoubleTapProtection() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, [role="button"]');
    if (!btn) return;

    if (
      btn.classList.contains('is-loading') || 
      btn.getAttribute('data-loading') === 'true' || 
      btn.disabled || 
      btn.getAttribute('aria-busy') === 'true'
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }, true); // Capture phase
}

/**
 * Smoothly switches between associated content panels with a micro-fade/slide
 * @param {HTMLElement} activePanel 
 * @param {NodeList|Array<HTMLElement>} allPanels 
 */
export function switchContentPanels(activePanel, allPanels) {
  if (!activePanel) return;

  if (allPanels) {
    allPanels.forEach(panel => {
      if (panel !== activePanel) {
        panel.style.display = 'none';
        panel.classList.remove('tab-pane-transition', 'content-switch-fade');
      }
    });
  }

  activePanel.style.display = 'block';
  activePanel.classList.remove('tab-pane-transition', 'content-switch-fade');
  void activePanel.offsetWidth; // Force reflow
  activePanel.classList.add('tab-pane-transition');
}

/**
 * Coordinator initialization
 */
export function initButtonInteractions() {
  initButtonDoubleTapProtection();
  initAllSegmentedControls();

  // Window resize fallback
  window.addEventListener('resize', () => {
    updateAllSegmentedSliders();
  });

  // Listen for theme changes to sync colors
  window.addEventListener('folioryn:theme-changed', () => {
    updateAllSegmentedSliders();
  });
}

// Global exposure for non-module scripts or inline handlers
if (typeof window !== 'undefined') {
  window.FoliorynButtonInteractions = {
    initSegmentedControl,
    initAllSegmentedControls,
    updateSegmentedSlider,
    updateAllSegmentedSliders,
    setButtonLoading,
    setButtonSuccess,
    switchContentPanels,
  };
  window.updateSegmentedSliders = updateAllSegmentedSliders;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initButtonInteractions());
  } else {
    initButtonInteractions();
  }
}
