/**
 * BuildLab — Marketing Homepage Interactive Controller
 * TechSpace BuildLab B04
 */

export function initHomepage() {
  initHeroTilt();
  initPreviewTabs();
  initPreviewDeviceToggle();
  initPreviewTemplateToggle();
  initTemplateFilters();
  initInteractiveSteps();
}

/**
 * 1. Hero floating cards subtle tilt interaction on pointer movement
 */
function initHeroTilt() {
  const heroSection = document.querySelector('.hero-section');
  const floatingComp = document.querySelector('.hero-floating-composition');
  if (!heroSection || !floatingComp) return;

  heroSection.addEventListener('mousemove', (e) => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = (y / rect.height) * -8;
    const tiltY = (x / rect.width) * 8;

    floatingComp.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    floatingComp.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

/**
 * 2. Interactive Portfolio Preview Tabs (Portfolio, Projects, Education, Blog)
 */
function initPreviewTabs() {
  const tabButtons = document.querySelectorAll('.preview-tab-btn');
  const tabPanels = document.querySelectorAll('.preview-tab-panel');
  if (!tabButtons.length || !tabPanels.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-preview-tab');

      // Update button states
      tabButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update panels with crossfade
      tabPanels.forEach((panel) => {
        if (panel.getAttribute('data-tab-content') === targetTab) {
          panel.style.display = 'block';
          panel.style.opacity = '0';
          setTimeout(() => {
            panel.style.transition = 'opacity 0.25s ease';
            panel.style.opacity = '1';
          }, 10);
        } else {
          panel.style.display = 'none';
        }
      });
    });
  });
}

/**
 * 3. Interactive Desktop / Mobile Viewport Switcher
 */
function initPreviewDeviceToggle() {
  const deviceBtns = document.querySelectorAll('.device-toggle-btn');
  const previewStage = document.getElementById('interactive-preview-stage');
  if (!deviceBtns.length || !previewStage) return;

  deviceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-device-mode');

      deviceBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (mode === 'mobile') {
        previewStage.classList.add('mobile-frame');
        previewStage.classList.remove('desktop-frame');
      } else {
        previewStage.classList.add('desktop-frame');
        previewStage.classList.remove('mobile-frame');
      }
    });
  });
}

/**
 * 4. Interactive Template Theme Switcher for Live Preview
 */
function initPreviewTemplateToggle() {
  const templateSelect = document.getElementById('preview-template-select');
  const previewStage = document.getElementById('interactive-preview-stage');
  if (!templateSelect || !previewStage) return;

  templateSelect.addEventListener('change', (e) => {
    const selectedTemplate = e.target.value;
    previewStage.setAttribute('data-preview-style', selectedTemplate);
  });
}

/**
 * 5. Functional Template Gallery Filters (All, Minimal, Developer, Creative, Student, Professional)
 */
function initTemplateFilters() {
  const filterBtns = document.querySelectorAll('.template-filter-btn');
  const templateCards = document.querySelectorAll('.template-gallery-card');
  if (!filterBtns.length || !templateCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active filter pill
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      let visibleCount = 0;
      templateCards.forEach((card) => {
        const categories = (card.getAttribute('data-categories') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.25s ease';
            card.style.opacity = '1';
          }, 10);
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Handle empty state if no template matches
      const emptyState = document.getElementById('template-empty-state');
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });

  // Attach "Use Template" click handlers to persist chosen template
  const useTemplateBtns = document.querySelectorAll('.use-template-action');
  useTemplateBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const templateId = btn.getAttribute('data-template-id');
      if (templateId) {
        localStorage.setItem('buildlab_selected_template', templateId);
      }
    });
  });
}

/**
 * 6. Interactive step highlight on scroll or hover
 */
function initInteractiveSteps() {
  const steps = document.querySelectorAll('.timeline-step');
  if (!steps.length) return;

  steps.forEach((step) => {
    step.addEventListener('mouseenter', () => {
      steps.forEach((s) => s.classList.remove('active'));
      step.classList.add('active');
    });
  });
}
