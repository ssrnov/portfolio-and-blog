/**
 * Folioryn — Cinematic Motion System
 * Inspired by Casa di Solare (Nikolas Type) motion principles:
 * - Fluid luxury easing curves (cubic-bezier(0.19, 1, 0.22, 1))
 * - Typography-led masked reveals (sliding upward from overflow-hidden bounding box)
 * - Coordinated hero timeline sequencing
 * - Dynamic interpolated number counters
 * - Scroll-triggered progressive card staggers
 * - Sliding dual-arrow button micro-interactions
 * - Smooth, non-blocking internal route transitions
 * - Ambient background orb parallax depth
 */

let _motionInitialized = false;

/**
 * Check whether user prefers reduced motion
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initialize the entire Folioryn Cinematic Motion System
 */
export function initMotionSystem() {
  if (typeof document === 'undefined') return;
  if (_motionInitialized) return;
  _motionInitialized = true;

  if (prefersReducedMotion()) {
    // Accessibility: immediately reveal all counters and headings without motion
    document.querySelectorAll('[data-counter], .hero-metric-val').forEach(el => {
      const text = el.getAttribute('data-original-val') || el.textContent;
      el.textContent = text;
    });
    return;
  }

  initHeroCinematicReveal();
  initTypographyMaskReveals();
  initNumberCounters();
  initScrollStaggers();
  initButtonMicroInteractions();
  initPageTransitions();
  initParallaxDepth();
}

/**
 * 1. HERO CINEMATIC REVEAL
 * Masks the headline lines, preps badge, lead, CTAs, metrics and stage,
 * then plays a choreographed entrance timeline. Coordinates with cinematic intro.
 */
export function initHeroCinematicReveal() {
  const hero = document.getElementById('hero') || document.querySelector('.hero-section');
  if (!hero) return;

  const title = hero.querySelector('.hero-title');
  const badge = hero.querySelector('.editorial-badge');
  const lead = hero.querySelector('.hero-lead');
  const actions = hero.querySelector('.hero-actions');
  const metrics = hero.querySelector('.hero-metrics-bar');
  const stage = hero.querySelector('.hero-floating-composition') || hero.querySelector('#interactive-preview-stage');

  // Format title lines with mask wrappers if not already wrapped
  if (title && !title.querySelector('.motion-mask-block')) {
    // Check if title has <br> or multiple text nodes
    const html = title.innerHTML;
    if (html.includes('<br')) {
      const parts = html.split(/<br\s*\/?>/i);
      const wrapped = parts.map((part, idx) => {
        const clean = part.trim();
        if (!clean) return '';
        return `<span class="motion-mask-block"><span class="motion-line motion-stagger-${idx + 1}">${clean}</span></span>`;
      }).filter(Boolean).join('');
      title.innerHTML = wrapped;
    } else {
      title.innerHTML = `<span class="motion-mask-block"><span class="motion-line motion-stagger-1">${html}</span></span>`;
    }
  }

  // Add staging classes
  if (badge) badge.classList.add('hero-staged-badge');
  if (lead) lead.classList.add('hero-staged-lead');
  if (actions) actions.classList.add('hero-staged-actions');
  if (metrics) metrics.classList.add('hero-staged-metrics');
  if (stage) stage.classList.add('hero-staged-stage');

  hero.classList.add('hero-motion-prep');
  hero.classList.add('motion-init');

  const playSequence = () => {
    // Trigger hero play
    requestAnimationFrame(() => {
      hero.classList.remove('motion-init');
      hero.classList.add('motion-revealed');
      hero.classList.add('hero-motion-play');
    });
  };

  // If cinematic intro is playing, wait for completion
  const isIntroPlaying = window.FoliorynIntro && typeof window.FoliorynIntro.isPlaying === 'function' && window.FoliorynIntro.isPlaying();
  if (isIntroPlaying) {
    window.addEventListener('folioryn:intro-complete', playSequence, { once: true });
    // Safety fallback in case event was already dispatched or timed out
    setTimeout(playSequence, 2600);
  } else {
    // Short delay for smooth paint
    setTimeout(playSequence, 90);
  }
}

/**
 * 2. TYPOGRAPHY MASK REVEALS ACROSS SECTIONS
 * Reveals section headings with masked upward translation on scroll
 */
export function initTypographyMaskReveals() {
  if (!('IntersectionObserver' in window)) return;

  const headings = document.querySelectorAll(
    '.section-header h2, .section-title, .editorial-heading, .curated-title, .portfolio-hero-title, .feature-headline'
  );

  if (!headings.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-revealed');
        entry.target.querySelectorAll('.motion-line').forEach(line => {
          line.classList.add('is-revealed');
        });
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  headings.forEach(heading => {
    // If not already masked, wrap inner text
    if (!heading.querySelector('.motion-mask') && !heading.querySelector('.motion-mask-block')) {
      const text = heading.innerHTML.trim();
      heading.innerHTML = `<span class="motion-mask-block"><span class="motion-line motion-stagger-1">${text}</span></span>`;
    }
    heading.classList.add('motion-init');
    observer.observe(heading);
  });
}

/**
 * 3. DYNAMIC NUMBER COUNTERS
 * Interpolates numerical values with Solare-style fluid easing
 */
export function initNumberCounters() {
  if (!('IntersectionObserver' in window)) return;

  const counterElements = document.querySelectorAll(
    '[data-counter], .hero-metric-val, .stat-value, .stat-metric-number'
  );

  if (!counterElements.length) return;

  // Parser helper
  function parseCounterData(el) {
    const raw = el.getAttribute('data-counter') || el.textContent.trim();
    el.setAttribute('data-original-val', raw);

    // Examples: "10K+", "50K+", "100K+", "4.9 ★", "12.4K", "3.98 CGPA", "14+ Systems", "99.9%"
    const match = raw.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return null;

    const prefix = match[1] || '';
    const num = parseFloat(match[2]);
    const suffix = match[3] || '';
    const hasDecimals = match[2].includes('.');
    const decimalPlaces = hasDecimals ? (match[2].split('.')[1] || '').length : 0;

    return { prefix, targetNum: num, suffix, decimalPlaces };
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        obs.unobserve(el);

        const data = parseCounterData(el);
        if (!data || isNaN(data.targetNum)) return;

        animateValue(el, 0, data.targetNum, 1600, data.prefix, data.suffix, data.decimalPlaces);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -30px 0px'
  });

  counterElements.forEach(el => observer.observe(el));
}

function animateValue(el, start, end, duration, prefix, suffix, decimals) {
  let startTime = null;
  el.classList.add('counter-animating');

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const current = start + (end - start) * easedProgress;

    const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
    el.textContent = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = `${prefix}${decimals > 0 ? end.toFixed(decimals) : end}${suffix}`;
      el.classList.remove('counter-animating');
    }
  }

  requestAnimationFrame(step);
}

/**
 * 4. PROGRESSIVE SCROLL-TRIGGERED CARDS & STAGGERS
 * Coordinates smooth entrance for card grids across all pages
 */
export function initScrollStaggers() {
  if (!('IntersectionObserver' in window)) return;

  const cardContainers = document.querySelectorAll(
    '.features-cards-grid, .template-gallery-grid, .templates-grid, .projects-grid, #projects-grid, #featured-projects-grid, .blog-grid, #blog-grid, #featured-blog-grid, .curated-profiles-grid, .bento-grid, .dashboard-stats-grid, .explore-cards-grid'
  );

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.motion-card-init');
        children.forEach((child, idx) => {
          setTimeout(() => {
            child.classList.add('is-revealed');
          }, idx * 75);
        });
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  cardContainers.forEach(container => {
    const cards = container.children;
    Array.from(cards).forEach((card, idx) => {
      card.classList.add('motion-card');
      card.classList.add('motion-card-init');
      card.classList.add(`stagger-delay-${(idx % 6) + 1}`);
    });
    observer.observe(container);
  });
}

/**
 * 5. BUTTON SLIDING ARROW MICRO-INTERACTION (Casa di Solare signature)
 * Injects dual-arrow track for smooth gliding feedback on hover
 */
export function initButtonMicroInteractions() {
  const arrowSvg = `
    <svg class="arrow-primary" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
    <svg class="arrow-clone" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  `;

  // Target buttons with arrows or primary action buttons
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-arrow-slide');

  buttons.forEach(btn => {
    // Avoid double-injecting
    if (btn.querySelector('.btn-arrow-icon')) return;

    // Check if button text ends with arrow or has an arrow element
    const html = btn.innerHTML;
    const hasArrowText = html.includes('&rarr;') || html.includes('→') || html.includes('->');

    if (hasArrowText || btn.classList.contains('btn-arrow-slide')) {
      // Remove raw text arrow and inject animated track
      const cleanedHtml = html.replace(/&rarr;|→|->/g, '').trim();
      btn.innerHTML = `<span>${cleanedHtml}</span><span class="btn-arrow-icon" aria-hidden="true">${arrowSvg}</span>`;
      btn.classList.add('btn-arrow-slide');
    }
  });
}

/**
 * 6. TASTEFUL ROUTE TRANSITIONS
 * Quick non-blocking veil for smooth page changes
 */
export function initPageTransitions() {
  let curtain = document.querySelector('.folioryn-route-curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.className = 'folioryn-route-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
  }

  // Remove curtain active on page show / bfcache restore
  window.addEventListener('pageshow', () => {
    curtain.classList.remove('is-active');
  });

  // Listen for internal clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore anchors, external links, javascript:, new tabs, or downloads
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      link.hasAttribute('download') ||
      link.getAttribute('target') === '_blank' ||
      e.ctrlKey || e.metaKey || e.shiftKey
    ) {
      return;
    }

    // Only apply to internal site routes
    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(link.href, window.location.href);

      // Same page anchor check
      if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) {
        return;
      }

      e.preventDefault();
      curtain.classList.add('is-active');

      setTimeout(() => {
        window.location.href = link.href;
      }, 140);
    }
  });
}

/**
 * 7. AMBIENT PARALLAX DEPTH
 * Gentle pointer tracking for organic gradient orbs
 */
export function initParallaxDepth() {
  const orbs = document.querySelectorAll('.ambient-orb');
  if (!orbs.length) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  const onMouseMove = (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseX = (e.clientX / w - 0.5) * 40;
    mouseY = (e.clientY / h - 0.5) * 40;

    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  };

  const updateParallax = () => {
    currentX += (mouseX - currentX) * 0.06;
    currentY += (mouseY - currentY) * 0.06;

    orbs.forEach((orb, idx) => {
      const factor = (idx % 2 === 0) ? 1 : -0.7;
      orb.style.transform = `translate3d(${(currentX * factor).toFixed(2)}px, ${(currentY * factor).toFixed(2)}px, 0)`;
    });

    if (Math.abs(mouseX - currentX) > 0.1 || Math.abs(mouseY - currentY) > 0.1) {
      rafId = requestAnimationFrame(updateParallax);
    } else {
      rafId = null;
    }
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
}
