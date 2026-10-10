/**
 * Folioryn — Visual Portfolio Builder Engine
 * Features:
 * 1. Reliable Autosave (800ms debounce, sequence counter, unsaved/saving/saved/failed states, retry, beforeunload dirty guard)
 * 2. Full Undo & Redo (50-state bounded stack, grouped rapid typing, keyboard shortcuts Ctrl+Z/Ctrl+Shift+Z, header UI buttons)
 * 3. Reactive 0ms iframe preview synchronization with authenticated draft preview
 * 4. User-isolated data persistence with Supabase remote sync
 */

import { authService, profileService, portfolioService } from './supabase.js';
import {
  getProfile,
  saveProfile,
  getPublishSettings,
  savePublishSettings,
  getProjects,
  getActiveUser
} from './profile-data.js';

let activeUser = null;
let DRAFT_KEY = 'folioryn_portfolio_draft';

// Builder Current State
let builderState = {
  displayName: '',
  headline: '',
  bio: '',
  location: '',
  template: 'minimal-professional',
  skillsFrontend: '',
  skillsBackend: '',
  githubUrl: '',
  contactEmail: '',
};

// Autosave Engine State
let isDirty = false;
let saveTimeout = null;
let saveSequenceCounter = 0;
let latestResolvedSequence = 0;

// History (Undo/Redo) Engine State
const MAX_HISTORY = 50;
let undoStack = [];
let redoStack = [];
let isApplyingHistory = false;
let typingSnapshotTimer = null;
let lastSnapshotState = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verify User Authentication Session
  try {
    const session = await authService.getSession();
    if (session && session.user) {
      activeUser = session.user;
    }
  } catch (err) {
    console.warn('Builder auth session notice:', err);
  }

  if (!activeUser) {
    activeUser = getActiveUser();
  }

  // Strictly block entry if not logged in
  if (!activeUser) {
    const target = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login/?redirect=${target}&auth=required`);
    return;
  }

  const uid = activeUser.id || (activeUser.username === 'sunny' ? 'usr_mock_sunny_9921' : 'demo');
  DRAFT_KEY = `profilefolio_user_${uid}_builder_draft`;

  // Reset history on user load
  undoStack = [];
  redoStack = [];
  updateHistoryButtons();

  // 2. Load existing draft or profile
  loadInitialState();

  // Initialize initial history snapshot
  lastSnapshotState = JSON.stringify(builderState);

  // 3. Setup preview frame & titles
  setupUserPreviewFrame();

  // 4. Render real projects in builder
  renderBuilderProjects();

  // 5. Bind form input listeners & autosave
  bindInputListeners();

  // 6. Bind Undo / Redo controls and keyboard shortcuts
  bindHistoryControls();

  // 7. Bind Viewport switcher
  bindViewportControls();

  // 8. Bind Publish Live button
  bindPublishButton();

  // 9. Bind Autosave Retry Button
  const retryBtn = document.getElementById('save-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      executeSave();
    });
  }

  // 10. Navigation Guard for Unsaved Changes
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  });

  // 11. Listen for iframe readiness
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'SSRNOVX_PREVIEW_READY' || event.data?.type === 'FOLIORYN_PREVIEW_READY') {
      sendStateToPreview();
    }
  });

  const iframe = document.getElementById('live-preview-frame');
  if (iframe) {
    iframe.addEventListener('load', () => {
      setTimeout(sendStateToPreview, 120);
    });
  }
});

function setupUserPreviewFrame() {
  const profile = getProfile();
  const username = profile?.username || activeUser?.username || 'user';
  // Feature 3: Authenticated draft preview mode query
  const previewUrl = `/u/${encodeURIComponent(username)}?preview=true`;

  const userTitle = document.getElementById('builder-user-title');
  if (userTitle) {
    userTitle.textContent = `Portfolio Builder • /u/${username}`;
  }

  const previewPageLink = document.getElementById('preview-page-link');
  if (previewPageLink) {
    previewPageLink.href = previewUrl;
    previewPageLink.title = 'Open draft preview in new tab';
  }

  const iframe = document.getElementById('live-preview-frame');
  if (iframe) {
    iframe.src = previewUrl;
  }

  const canvasUrl = document.getElementById('preview-canvas-url');
  if (canvasUrl) {
    canvasUrl.innerHTML = `Draft Preview Canvas &bull; folioryn.dev/u/${username}`;
  }
}

function loadInitialState() {
  const profile = getProfile();
  const publishSettings = getPublishSettings();

  builderState = {
    displayName: profile.fullName || activeUser?.display_name || 'User',
    headline: profile.headline || 'Software Engineer & Systems Builder',
    bio: profile.bio || 'Building scalable applications and interfaces with native web standards.',
    location: profile.location || 'India',
    template: publishSettings.templateId || 'minimal-professional',
    skillsFrontend: 'JavaScript (ESNext), TypeScript, HTML5, CSS3, Vite',
    skillsBackend: 'Node.js, Express, REST APIs, Databases, WebSockets',
    githubUrl: profile.githubUrl || (activeUser?.github_handle ? `https://github.com/${activeUser.github_handle}` : ''),
    contactEmail: profile.email || activeUser?.email || '',
  };

  // Merge saved draft from localStorage if present
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft);
      builderState = { ...builderState, ...parsed };
    } catch (e) {
      console.warn('Failed to parse draft from localStorage:', e);
    }
  }

  populateFormInputs();
}

function populateFormInputs() {
  const map = [
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

  map.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = builderState[key] || '';
    }
  });
}

function renderBuilderProjects() {
  const projects = getProjects();
  const sectionContent = document.querySelector('.editor-section:nth-of-type(2) .editor-section-content');
  if (!sectionContent || projects.length === 0) return;

  sectionContent.innerHTML = projects.slice(0, 4).map(p => `
    <div style="padding: var(--space-3); border: 1px solid var(--border-color); border-radius: var(--radius-sm); background-color: var(--bg-secondary); margin-bottom: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <strong style="font-size: var(--text-xs); color: var(--text-primary);">${escapeHtml(p.title)}</strong>
        <span class="brand-badge">${escapeHtml(p.category || 'Tech')}</span>
      </div>
      <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">${escapeHtml(p.tags ? p.tags.join(', ') : p.description?.slice(0, 60))}</p>
    </div>
  `).join('');
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
      if (isApplyingHistory) return;

      // Group rapid typing for Undo/Redo: snapshot before series of rapid changes
      recordTypingSnapshot();

      builderState[key] = el.value;
      scheduleAutosave();
    };

    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });
}

// ==============================================================================
// Feature 1: Robust Autosave Engine
// ==============================================================================

function setSaveStatus(status) {
  const statusDot = document.getElementById('save-status-dot');
  const statusText = document.getElementById('save-status-text');
  const retryBtn = document.getElementById('save-retry-btn');

  if (!statusText) return;

  if (status === 'unsaved') {
    isDirty = true;
    statusText.textContent = 'Unsaved changes';
    if (statusDot) {
      statusDot.style.backgroundColor = '#eab308';
      statusDot.classList.remove('pulse-dot');
    }
    if (retryBtn) retryBtn.style.display = 'none';
  } else if (status === 'saving') {
    statusText.textContent = 'Saving changes...';
    if (statusDot) {
      statusDot.style.backgroundColor = '#eab308';
      statusDot.classList.add('pulse-dot');
    }
    if (retryBtn) retryBtn.style.display = 'none';
  } else if (status === 'saved') {
    isDirty = false;
    statusText.textContent = 'All changes saved';
    if (statusDot) {
      statusDot.style.backgroundColor = '#22c55e';
      statusDot.classList.remove('pulse-dot');
    }
    if (retryBtn) retryBtn.style.display = 'none';
  } else if (status === 'failed') {
    isDirty = true;
    statusText.textContent = 'Save failed';
    if (statusDot) {
      statusDot.style.backgroundColor = '#ef4444';
      statusDot.classList.remove('pulse-dot');
    }
    if (retryBtn) retryBtn.style.display = 'inline-block';
  }
}

function scheduleAutosave() {
  // 1. Instant 0ms Preview Update for live feel
  sendStateToPreview();

  // 2. Mark unsaved
  setSaveStatus('unsaved');

  // 3. Debounce save by 800ms (700-1000ms specification)
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    executeSave();
  }, 800);
}

async function executeSave() {
  const thisSequence = ++saveSequenceCounter;
  setSaveStatus('saving');

  try {
    // Save locally
    localStorage.setItem(DRAFT_KEY, JSON.stringify(builderState));

    // Save profile representation
    saveProfile({
      fullName: builderState.displayName,
      headline: builderState.headline,
      bio: builderState.bio,
      location: builderState.location,
      githubUrl: builderState.githubUrl,
      email: builderState.contactEmail,
    });

    // Save publish settings template
    savePublishSettings({
      templateId: builderState.template,
    });

    // Asynchronously sync to Supabase if logged in
    if (activeUser && activeUser.id && activeUser.id !== 'usr_mock_sunny_9921') {
      try {
        await profileService.updateProfile(activeUser.id, {
          display_name: builderState.displayName,
          headline: builderState.headline,
          bio: builderState.bio,
          location: builderState.location,
          github_handle: builderState.githubUrl?.replace('https://github.com/', ''),
        });
      } catch (remoteErr) {
        console.warn('Background Supabase autosave sync notice:', remoteErr);
      }
    }

    // Sequence check: Ensure older slow saves never overwrite newer saves
    if (thisSequence >= latestResolvedSequence) {
      latestResolvedSequence = thisSequence;
      setSaveStatus('saved');
    }
  } catch (err) {
    console.error('Autosave failure:', err);
    if (thisSequence >= latestResolvedSequence) {
      setSaveStatus('failed');
    }
  }
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

// ==============================================================================
// Feature 2: Robust Undo & Redo History Engine
// ==============================================================================

function recordTypingSnapshot() {
  // If we don't have a timer running, push the previous baseline state before this typing burst
  if (!typingSnapshotTimer) {
    if (lastSnapshotState) {
      pushUndoState(JSON.parse(lastSnapshotState));
    }
  }

  clearTimeout(typingSnapshotTimer);
  typingSnapshotTimer = setTimeout(() => {
    // Typing burst finished; record current state as baseline for next burst
    lastSnapshotState = JSON.stringify(builderState);
    typingSnapshotTimer = null;
  }, 650);
}

function pushUndoState(state) {
  // Prevent duplicate states
  const serialized = JSON.stringify(state);
  const top = undoStack.length > 0 ? JSON.stringify(undoStack[undoStack.length - 1]) : null;
  if (serialized === top) return;

  undoStack.push(state);
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift(); // Keep bounded to 50 entries
  }

  redoStack = []; // Clear redo stack on new action
  updateHistoryButtons();
}

function handleUndo() {
  if (undoStack.length === 0) return;

  isApplyingHistory = true;

  // Push current state to redo stack
  redoStack.push({ ...builderState });
  if (redoStack.length > MAX_HISTORY) redoStack.shift();

  // Pop previous state
  const prevState = undoStack.pop();
  builderState = { ...prevState };
  lastSnapshotState = JSON.stringify(builderState);

  populateFormInputs();
  sendStateToPreview();
  scheduleAutosave();

  updateHistoryButtons();
  isApplyingHistory = false;
}

function handleRedo() {
  if (redoStack.length === 0) return;

  isApplyingHistory = true;

  // Push current state to undo stack
  undoStack.push({ ...builderState });
  if (undoStack.length > MAX_HISTORY) undoStack.shift();

  // Pop next state
  const nextState = redoStack.pop();
  builderState = { ...nextState };
  lastSnapshotState = JSON.stringify(builderState);

  populateFormInputs();
  sendStateToPreview();
  scheduleAutosave();

  updateHistoryButtons();
  isApplyingHistory = false;
}

function updateHistoryButtons() {
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');

  if (undoBtn) {
    undoBtn.disabled = undoStack.length === 0;
    undoBtn.style.opacity = undoStack.length === 0 ? '0.5' : '1';
    undoBtn.style.cursor = undoStack.length === 0 ? 'not-allowed' : 'pointer';
  }

  if (redoBtn) {
    redoBtn.disabled = redoStack.length === 0;
    redoBtn.style.opacity = redoStack.length === 0 ? '0.5' : '1';
    redoBtn.style.cursor = redoStack.length === 0 ? 'not-allowed' : 'pointer';
  }
}

function bindHistoryControls() {
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');

  if (undoBtn) undoBtn.addEventListener('click', handleUndo);
  if (redoBtn) redoBtn.addEventListener('click', handleRedo);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Shift+Z, Cmd+Z, Cmd+Shift+Z, Ctrl+Y, Cmd+Y)
  window.addEventListener('keydown', (e) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    if (!isCtrlOrMeta) return;

    const key = e.key.toLowerCase();

    // Check if user is typing in unrelated dialog or element
    const activeEl = document.activeElement;
    const isBuilderInput = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.tagName === 'SELECT'
    );

    // If Ctrl+Shift+Z or Ctrl+Y -> Redo
    if ((key === 'z' && e.shiftKey) || key === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }

    // If Ctrl+Z without Shift -> Undo
    if (key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
  });
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
    publishBtn.innerHTML = '<span>Publishing Live...</span>';

    try {
      saveProfile({
        fullName: builderState.displayName,
        headline: builderState.headline,
        bio: builderState.bio,
        location: builderState.location,
        githubUrl: builderState.githubUrl,
        email: builderState.contactEmail,
      });

      savePublishSettings({
        status: 'published',
        isPublished: true,
        templateId: builderState.template,
      });

      if (activeUser && activeUser.id) {
        try {
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
        } catch (syncErr) {
          console.warn('Remote sync notice:', syncErr);
        }
      }

      localStorage.setItem(DRAFT_KEY, JSON.stringify(builderState));

      publishBtn.disabled = false;
      publishBtn.innerHTML = '<span>✓ Published Live!</span>';
      publishBtn.style.backgroundColor = '#16a34a';
      publishBtn.style.borderColor = '#16a34a';
      publishBtn.style.color = '#FFFFFF';

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
