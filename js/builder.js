/**
 * SSRNovX — Split-Pane Visual Portfolio Builder
 * Manages form state, reactive 0ms iframe preview synchronization,
 * localStorage autosave drafts, viewport switching, and Supabase publish.
 */

import { authService, profileService, portfolioService } from './supabase.js';

const DRAFT_KEY = 'ssrnovx_portfolio_draft';

// Builder State
let builderState = {
  displayName: 'Sunny / SSRNovX',
  headline: 'Engineering Scalable Systems & Modern Web Experiences',
  bio: 'Software engineer focused on clean architecture, performance optimization, and responsive interface design. Building robust software with native web standards.',
  location: 'India (IST / UTC+5:30)',
  template: 'minimal',
  skillsFrontend: 'JavaScript (ES6+), TypeScript, HTML5, Modern CSS3, Vite',
  skillsBackend: 'Node.js, Express, REST APIs, Redis, PostgreSQL, WebSockets',
  githubUrl: 'https://github.com/ssrnov',
  contactEmail: 'contact@ssrnovx.dev',
};

let activeUser = null;
let saveTimeout = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth session
  try {
    const session = await authService.getSession();
    if (session && session.user) {
      activeUser = session.user;
    }
  } catch (err) {
    console.warn('Builder auth session notice:', err);
  }

  // Load existing draft or profile
  loadInitialState();

  // Bind all input event listeners for live preview sync
  bindInputListeners();

  // Bind responsive canvas viewport switcher
  bindViewportControls();

  // Bind publish button
  bindPublishButton();

  // Listen for iframe readiness
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'SSRNOVX_PREVIEW_READY') {
      sendStateToPreview();
    }
  });

  // Also send state on iframe load event
  const iframe = document.getElementById('live-preview-frame');
  if (iframe) {
    iframe.addEventListener('load', () => {
      setTimeout(sendStateToPreview, 100);
    });
  }
});

function loadInitialState() {
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft);
      builderState = { ...builderState, ...parsed };
    } catch (e) {
      console.warn('Failed to parse draft from localStorage:', e);
    }
  }

  // Populate inputs with current state
  const nameEl = document.getElementById('input-display-name');
  if (nameEl) nameEl.value = builderState.displayName;

  const headlineEl = document.getElementById('input-headline');
  if (headlineEl) headlineEl.value = builderState.headline;

  const bioEl = document.getElementById('input-bio');
  if (bioEl) bioEl.value = builderState.bio;

  const locEl = document.getElementById('input-location');
  if (locEl) locEl.value = builderState.location;

  const tmplEl = document.getElementById('template-select');
  if (tmplEl) tmplEl.value = builderState.template;

  const skillsFrontEl = document.getElementById('input-skills-frontend');
  if (skillsFrontEl) skillsFrontEl.value = builderState.skillsFrontend;

  const skillsBackEl = document.getElementById('input-skills-backend');
  if (skillsBackEl) skillsBackEl.value = builderState.skillsBackend;

  const githubEl = document.getElementById('input-github-url');
  if (githubEl) githubEl.value = builderState.githubUrl;

  const emailEl = document.getElementById('input-contact-email');
  if (emailEl) emailEl.value = builderState.contactEmail;
}

function bindInputListeners() {
  const inputsMap = [
    { id: 'input-display-name', key: 'displayName' },
    { id: 'input-headline', key: 'headline' },
    { id: 'input-bio', key: 'bio' },
    { id: 'input-location', key: 'location' },
    { id: 'template-select', key: 'template' },
    { id: 'input-skills-frontend', key: 'skillsFrontend' },
    { id: 'input-skills-backend', key: 'skillsBackend' },
    { id: 'input-github-url', key: 'githubUrl' },
    { id: 'input-contact-email', key: 'contactEmail' },
  ];

  inputsMap.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;

    const handler = () => {
      builderState[key] = el.value;
      triggerAutosaveAndSync();
    };

    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });
}

function triggerAutosaveAndSync() {
  // 1. Instant 0ms Preview Update
  sendStateToPreview();

  // 2. Debounced LocalStorage save & UI badge
  const saveBadge = document.getElementById('save-status-text');
  if (saveBadge) saveBadge.textContent = 'Saving changes...';

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(builderState));
      if (saveBadge) saveBadge.textContent = 'All changes saved';
    } catch (err) {
      console.warn('Error saving draft:', err);
    }
  }, 400);
}

function sendStateToPreview() {
  const iframe = document.getElementById('live-preview-frame');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        type: 'SSRNOVX_PREVIEW_UPDATE',
        payload: { ...builderState },
      },
      '*'
    );
  }
}

function bindViewportControls() {
  const canvas = document.getElementById('preview-canvas');
  const buttons = document.querySelectorAll('.viewport-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-viewport');
      if (!canvas) return;

      canvas.style.transition = 'max-width 300ms cubic-bezier(0.16, 1, 0.3, 1)';
      if (mode === 'desktop') canvas.style.maxWidth = '100%';
      if (mode === 'tablet') canvas.style.maxWidth = '768px';
      if (mode === 'mobile') canvas.style.maxWidth = '375px';
    });
  });
}

function bindPublishButton() {
  const publishBtn = document.getElementById('publish-btn');
  if (!publishBtn) return;

  publishBtn.addEventListener('click', async () => {
    publishBtn.disabled = true;
    publishBtn.innerHTML = '<span>Publishing...</span>';

    try {
      // If user is authenticated, sync to Supabase
      if (activeUser && activeUser.id) {
        await profileService.updateProfile(activeUser.id, {
          display_name: builderState.displayName,
          headline: builderState.headline,
          bio: builderState.bio,
          location: builderState.location,
          github_handle: builderState.githubUrl?.replace('https://github.com/', ''),
        });

        const userPortfolio = await portfolioService.getUserPortfolio(activeUser.id);
        if (userPortfolio?.id) {
          await portfolioService.updatePortfolio(userPortfolio.id, {
            template_id: builderState.template,
            is_published: true,
          });
        }
      }

      // Persist draft
      localStorage.setItem(DRAFT_KEY, JSON.stringify(builderState));

      publishBtn.disabled = false;
      publishBtn.innerHTML = '<span>✓ Published Live!</span>';
      publishBtn.style.backgroundColor = '#16a34a';
      publishBtn.style.borderColor = '#16a34a';
      publishBtn.style.color = '#ffffff';

      setTimeout(() => {
        publishBtn.innerHTML = '<span>Publish Live</span>';
        publishBtn.removeAttribute('style');
      }, 3000);
    } catch (err) {
      console.error('Publish error:', err);
      publishBtn.disabled = false;
      publishBtn.innerHTML = '<span>Error Publishing</span>';
      setTimeout(() => {
        publishBtn.innerHTML = '<span>Publish Live</span>';
      }, 2500);
    }
  });
}
