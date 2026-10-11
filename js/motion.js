/**
 * Folioryn — Cinematic Scroll Experience
 * Reference: Casa di Solare (Nikolas Type) — https://casadisolare.com/
 * 
 * Core Motion Architecture:
 * - GSAP ScrollTrigger Scroll-Scrubbed Timelines (scrub: 1 / 0.8)
 * - Pinned Sections & Multi-Step Scroll Storytelling
 * - Container Expansion from Constrained Frame to Full Stage
 * - Scroll-Driven Heading Line Reveals via Clipping Masks
 * - Restrained Image Scale & Media Zoom on Scroll Scrub
 * - Overlapping Sections & Stacked Card Layering
 * - Milestone Timeline Line Fill Linked to Scroll Progress
 * - Sliding Dual-Arrow Button Micro-Interactions
 * - Dynamic Eased Interpolation Number Counters
 * - Seamless Three-Theme Synchronization (Dark, Light, Night)
 * - Full Accessibility Support (prefers-reduced-motion)
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

let _motionInitialized = false;

/**
 * Accessibility check for prefers-reduced-motion
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initialize Folioryn Cinematic Scroll & Motion System
 */
export function initMotionSystem() {
  if (typeof document === 'undefined') return;
  if (_motionInitialized) return;
  _motionInitialized = true;

  if (prefersReducedMotion()) {
    // Accessibility: immediately reveal all counters, headings, and stages without motion
    document.querySelectorAll('[data-counter], .hero-metric-val').forEach(el => {
      const text = el.getAttribute('data-original-val') || el.textContent;
      el.textContent = text;
    });
    return;
  }

  // 1. Hero Choreographed Opening
  initHeroCinematicReveal();

  // 2. Scroll-Driven Hero Transformation & Parallax Drift
  initScrollDrivenHero();

  // 3. Pinned Interactive Preview Stage & Expanding Frame
  initScrollDrivenInteractivePreview();

  // 4. Scroll-Driven Stacked Archetype & Feature Cards
  initScrollDrivenStackedCards();

  // 5. Scroll-Synchronized Featured Project Media Zoom
  initScrollDrivenProjectGallery();

  // 6. Scroll-Driven Milestone Timeline Fill (Public Portfolios)
  initScrollDrivenTimeline();

  // 7. Scroll-Scrubbed Typography Line Reveals
  initScrollDrivenTypography();

  // 8. Eased Interpolation Number Counters
  initNumberCounters();

  // 9. Sliding Dual-Arrow Button Micro-Interactions
  initButtonMicroInteractions();

  // 10. Tasteful Route Curtain Transitions
  initPageTransitions();

  // 11. Subtle Ambient Orb Mouse Depth
  initParallaxDepth();

  // Lifecycle listeners
  initScrollTriggerLifecycle();
}

/**
 * 1. HERO OPENING REVEAL
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
  const stage = hero.querySelector('.hero-profile-card-main') || hero.querySelector('.hero-floating-composition');

  // Format title lines with mask wrappers if not already wrapped
  if (title && !title.querySelector('.motion-mask-block')) {
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

  if (badge) badge.classList.add('hero-staged-badge');
  if (lead) lead.classList.add('hero-staged-lead');
  if (actions) actions.classList.add('hero-staged-actions');
  if (metrics) metrics.classList.add('hero-staged-metrics');
  if (stage) stage.classList.add('hero-staged-stage');

  hero.classList.add('hero-motion-prep');
  hero.classList.add('motion-init');

  const playSequence = () => {
    requestAnimationFrame(() => {
      hero.classList.remove('motion-init');
      hero.classList.add('motion-revealed');
      hero.classList.add('hero-motion-play');
    });
  };

  const isIntroPlaying = window.FoliorynIntro && typeof window.FoliorynIntro.isPlaying === 'function' && window.FoliorynIntro.isPlaying();
  if (isIntroPlaying) {
    window.addEventListener('folioryn:intro-complete', playSequence, { once: true });
    setTimeout(playSequence, 2600);
  } else {
    setTimeout(playSequence, 90);
  }
}

/**
 * 2. SCROLL-DRIVEN HERO TRANSFORMATION (Casa di Solare Principle)
 * Scrolling away from the hero scrubs a coordinated transformation:
 * - Headline lines drift upward with gentle parallax
 * - Profile mockup card subtly scales and tilts in 3D
 * - Ambient background orbs drift in opposing directions
 * - Content softly dims as attention transfers to the expanding preview stage
 */
export function initScrollDrivenHero() {
  const hero = document.getElementById('hero') || document.querySelector('.hero-section');
  if (!hero) return;

  const title = hero.querySelector('.hero-title');
  const profileCard = hero.querySelector('.hero-profile-card-main') || hero.querySelector('.hero-floating-composition');
  const orbs = hero.querySelectorAll('.ambient-orb');
  const lead = hero.querySelector('.hero-lead');
  const actions = hero.querySelector('.hero-actions');
  const metrics = hero.querySelector('.hero-metrics-bar');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      invalidateOnRefresh: true
    }
  });

  if (title) {
    tl.to(title, { y: -45, opacity: 0.55, ease: 'none' }, 0);
  }

  if (lead || actions || metrics) {
    tl.to([lead, actions, metrics].filter(Boolean), { y: -25, opacity: 0.35, ease: 'none' }, 0);
  }

  if (profileCard) {
    tl.to(profileCard, { y: -65, scale: 0.95, ease: 'none' }, 0);
  }

  if (orbs.length >= 2) {
    tl.to(orbs[0], { y: -100, x: -30, ease: 'none' }, 0);
    tl.to(orbs[1], { y: 70, x: 25, ease: 'none' }, 0);
  }
}

/**
 * 3. PINNED INTERACTIVE PREVIEW STAGE & EXPANDING FRAME
 * Reference: Casa di Solare container expanding from constrained frame into full presentation.
 * On desktop: pins `#interactive-preview` while scrolling scrubs:
 * 1. Stage expanding from scale(0.92) with rounded inset clipping into full scale(1) frame.
 * 2. Tabs progressively switching through Overview -> Projects -> Skills -> Resume.
 */
export function initScrollDrivenInteractivePreview() {
  const section = document.getElementById('interactive-preview');
  const stage = document.getElementById('interactive-preview-stage');
  if (!section || !stage) return;

  stage.classList.add('scroll-expand-frame');

  // Container expansion timeline
  const isDesktop = window.innerWidth >= 900;

  if (isDesktop) {
    const tabButtons = stage.querySelectorAll('.preview-tab-btn');

    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=1100',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Progressively cycle active preview tab between 0.35 and 1.0
          if (tabButtons.length >= 4 && self.progress > 0.35) {
            const tabProgress = (self.progress - 0.35) / 0.65; // 0 to 1
            const activeIndex = Math.min(Math.floor(tabProgress * tabButtons.length), tabButtons.length - 1);

            tabButtons.forEach((btn, idx) => {
              if (idx === activeIndex && !btn.classList.contains('active')) {
                btn.click();
                btn.classList.add('is-scroll-active');
              } else if (idx !== activeIndex) {
                btn.classList.remove('is-scroll-active');
              }
            });
          }
        }
      }
    });

    // Expanding frame animation scrubbed over first 40% of scroll
    pinTl.fromTo(stage,
      {
        scale: 0.90,
        clipPath: 'inset(3% 3% 3% 3% round 24px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)'
      },
      {
        scale: 1,
        clipPath: 'inset(0% 0% 0% 0% round 16px)',
        boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.55)',
        duration: 0.4,
        ease: 'power2.out'
      },
      0
    );

    // Subtle header text fade and rise
    const header = section.querySelector('.section-header');
    if (header) {
      pinTl.to(header, { y: -20, opacity: 0.8, duration: 0.4 }, 0);
    }
  } else {
    // Mobile alternative: scrub expand without sticky pinning
    gsap.fromTo(stage,
      { scale: 0.94, opacity: 0.8 },
      {
        scale: 1,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stage,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 1
        }
      }
    );
  }
}

/**
 * 4. SCROLL-DRIVEN STACKED CARDS & ARCHETYPES
 * Reference: Casa di Solare stacked panel deck effect.
 * Staggers and scrubs card entrances, slightly compressing the preceding card
 * to create an authentic sense of physical depth.
 */
export function initScrollDrivenStackedCards() {
  const containers = document.querySelectorAll(
    '.template-gallery-grid, #template-cards-container, .features-cards-grid, .curated-profiles-grid, .bento-grid'
  );

  containers.forEach(container => {
    const cards = Array.from(container.children);
    if (!cards.length) return;

    cards.forEach((card, idx) => {
      // Entrance scrub for each card
      gsap.fromTo(card,
        {
          y: 45,
          opacity: 0.15,
          scale: 0.97
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 60%',
            scrub: 0.8
          }
        }
      );

      // Subsequent card compresses predecessor slightly
      if (idx > 0) {
        const prevCard = cards[idx - 1];
        gsap.to(prevCard, {
          scale: 0.985,
          opacity: 0.92,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            end: 'top 40%',
            scrub: 1
          }
        });
      }
    });
  });
}

/**
 * 5. SCROLL-SYNCHRONIZED PROJECT GALLERY MEDIA ZOOM
 * Reference: Casa di Solare restrained image zoom and parallax media movement.
 * As user scrolls past project cards, the media smoothly zooms while
 * project details translate with layered depth.
 */
export function initScrollDrivenProjectGallery() {
  const projectCards = document.querySelectorAll('.project-card, .article-portfolio-card');

  projectCards.forEach(card => {
    const imgWrap = card.querySelector('.project-media-wrap, .article-thumbnail-wrap, .template-preview-canvas');
    const img = card.querySelector('img, svg');
    const content = card.querySelector('div:first-child');

    if (img) {
      card.classList.add('scroll-scrub-media');
      gsap.fromTo(img,
        { scale: 1.1, yPercent: -4 },
        {
          scale: 1.0,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    }

    if (content) {
      gsap.fromTo(content,
        { y: 12 },
        {
          y: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'bottom 40%',
            scrub: 1
          }
        }
      );
    }
  });
}

/**
 * 6. SCROLL-DRIVEN MILESTONE TIMELINE FILL (Public Portfolios)
 * Fills the vertical milestone track as visitor scrolls through academics and experience.
 */
export function initScrollDrivenTimeline() {
  const sections = document.querySelectorAll('#education, #experience');

  sections.forEach(section => {
    const list = section.querySelector('div[style*="flex-direction: column"]') || section.querySelector('.timeline');
    if (!list) return;

    list.classList.add('scroll-timeline-wrapper');

    // Create line and animated fill if not already injected
    if (!list.querySelector('.scroll-timeline-line')) {
      const line = document.createElement('div');
      line.className = 'scroll-timeline-line';
      const fill = document.createElement('div');
      fill.className = 'scroll-timeline-line-fill';
      line.appendChild(fill);
      list.prepend(line);

      gsap.fromTo(fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: list,
            start: 'top 75%',
            end: 'bottom 65%',
            scrub: 0.5
          }
        }
      );
    }
  });
}

/**
 * 7. SCROLL-SCRUBBED TYPOGRAPHY LINE REVEALS
 * Masks headings and smoothly scrubs their reveal line-by-line with scroll position.
 */
export function initScrollDrivenTypography() {
  const headings = document.querySelectorAll(
    '.section-header h2, .section-title, .portfolio-hero-title, .editorial-heading'
  );

  headings.forEach(heading => {
    // Wrap lines if needed
    if (!heading.querySelector('.motion-mask-block') && !heading.querySelector('.motion-mask')) {
      const text = heading.innerHTML.trim();
      heading.innerHTML = `<span class="motion-mask-block"><span class="motion-line motion-stagger-1">${text}</span></span>`;
    }

    const lines = heading.querySelectorAll('.motion-line');
    if (!lines.length) return;

    lines.forEach((line, idx) => {
      gsap.fromTo(line,
        {
          yPercent: 110,
          opacity: 0.2
        },
        {
          yPercent: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 92%',
            end: 'top 68%',
            scrub: 0.8
          }
        }
      );
    });
  });
}

/**
 * 8. DYNAMIC NUMBER COUNTERS
 * Interpolates numerical values with Solare-style fluid easing
 */
export function initNumberCounters() {
  const counterElements = document.querySelectorAll(
    '[data-counter], .hero-metric-val, .stat-value, .stat-metric-number'
  );

  if (!counterElements.length) return;

  function parseCounterData(el) {
    const raw = el.getAttribute('data-counter') || el.textContent.trim();
    el.setAttribute('data-original-val', raw);

    const match = raw.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return null;

    const prefix = match[1] || '';
    const num = parseFloat(match[2]);
    const suffix = match[3] || '';
    const hasDecimals = match[2].includes('.');
    const decimalPlaces = hasDecimals ? (match[2].split('.')[1] || '').length : 0;

    return { prefix, targetNum: num, suffix, decimalPlaces };
  }

  counterElements.forEach(el => {
    const data = parseCounterData(el);
    if (!data || isNaN(data.targetNum)) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        animateValue(el, 0, data.targetNum, 1600, data.prefix, data.suffix, data.decimalPlaces);
      }
    });
  });
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
 * 9. BUTTON SLIDING ARROW MICRO-INTERACTION (Casa di Solare signature)
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

  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-arrow-slide');

  buttons.forEach(btn => {
    if (btn.querySelector('.btn-arrow-icon')) return;

    const html = btn.innerHTML;
    const hasArrowText = html.includes('&rarr;') || html.includes('→') || html.includes('->');

    if (hasArrowText || btn.classList.contains('btn-arrow-slide')) {
      const cleanedHtml = html.replace(/&rarr;|→|->/g, '').trim();
      btn.innerHTML = `<span>${cleanedHtml}</span><span class="btn-arrow-icon" aria-hidden="true">${arrowSvg}</span>`;
      btn.classList.add('btn-arrow-slide');
    }
  });
}

/**
 * 10. TASTEFUL ROUTE TRANSITIONS
 */
export function initPageTransitions() {
  let curtain = document.querySelector('.folioryn-route-curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.className = 'folioryn-route-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
  }

  window.addEventListener('pageshow', () => {
    curtain.classList.remove('is-active');
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

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

    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(link.href, window.location.href);

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
 * 11. AMBIENT PARALLAX DEPTH
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

/**
 * ScrollTrigger Lifecycle Management
 * Refreshes measurements on resize, layout shift, and live theme change
 */
function initScrollTriggerLifecycle() {
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  }, { passive: true });

  window.addEventListener('folioryn:theme-changed', () => {
    ScrollTrigger.refresh();
  });

  // Window load safety refresh
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}
