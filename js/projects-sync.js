/**
 * ProfileFolio — GitHub Repositories Sync & Project Manager
 * Connects to GitHub REST API, fetches repositories with stars & metadata,
 * provides custom project authoring (add/edit/delete), and handles 1-click import.
 */

import { authService, profileService } from './supabase.js';
import {
  getProjects,
  saveProjects,
  addProjectItem,
  updateProjectItem,
  deleteProjectItem,
  getProfile,
  saveProfile,
  getActiveUser
} from './profile-data.js';

let fetchedRepos = [];
let activeProjects = [];
let currentGitHubUser = '';

/**
 * Intelligent GitHub Handle Sanitizer
 * Strips URLs, domain names, @ prefixes, and path extensions.
 * e.g. "https://github.com/octocat/repo" -> "octocat"
 */
export function extractGitHubUsername(input) {
  if (!input || typeof input !== 'string') return '';
  let str = input.trim();
  str = str.replace(/^https?:\/\//i, '');
  str = str.replace(/^(www\.)?github\.com\//i, '');
  str = str.replace(/^@+/, '');
  const parts = str.split('/').filter(Boolean);
  return (parts[0] || '').trim();
}

/**
 * Generate user-scoped demo repositories when API is rate-limited or offline
 */
function generateDemoReposForUser(username) {
  const clean = username || 'developer';
  return [
    {
      id: Date.now() + 1,
      name: `${clean}-portfolio`,
      full_name: `${clean}/${clean}-portfolio`,
      description: 'Modern, high-performance personal portfolio built with native web standards and dynamic themes.',
      language: 'JavaScript',
      stargazers_count: 34,
      forks_count: 5,
      html_url: `https://github.com/${clean}/${clean}-portfolio`,
      homepage: `https://folioryn.dev/u/${clean}`,
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      topics: ['portfolio', 'vanilla-js', 'web-standards'],
    },
    {
      id: Date.now() + 2,
      name: 'distributed-task-runner',
      full_name: `${clean}/distributed-task-runner`,
      description: 'Concurrent asynchronous queue processor with worker pools and fault-tolerant state persistence.',
      language: 'TypeScript',
      stargazers_count: 27,
      forks_count: 4,
      html_url: `https://github.com/${clean}/distributed-task-runner`,
      homepage: '',
      updated_at: new Date(Date.now() - 259200000).toISOString(),
      topics: ['concurrency', 'nodejs', 'distributed-systems'],
    },
    {
      id: Date.now() + 3,
      name: 'cloud-metrics-stream',
      full_name: `${clean}/cloud-metrics-stream`,
      description: 'Real-time telemetry and metrics visualizer rendering 60fps streaming time-series via canvas.',
      language: 'TypeScript',
      stargazers_count: 18,
      forks_count: 2,
      html_url: `https://github.com/${clean}/cloud-metrics-stream`,
      homepage: '',
      updated_at: new Date(Date.now() - 604800000).toISOString(),
      topics: ['observability', 'telemetry', 'websockets'],
    }
  ];
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Identify GitHub username from profile, session, or account
  const profile = getProfile();
  const user = getActiveUser();

  if (profile?.githubUrl) {
    currentGitHubUser = extractGitHubUsername(profile.githubUrl);
  }
  if (!currentGitHubUser && user?.github_handle) {
    currentGitHubUser = extractGitHubUsername(user.github_handle);
  }

  const handleInput = document.getElementById('github-handle-input');
  if (handleInput && currentGitHubUser) {
    handleInput.value = currentGitHubUser;
  }

  // 2. Load active projects from user-scoped storage
  loadAndRenderProjects();

  // 3. Fetch initial GitHub repos or render onboarding state
  if (currentGitHubUser) {
    await loadGitHubRepositories(currentGitHubUser);
  } else {
    renderEmptyGitHubPrompt();
  }

  // 4. Bind action listeners
  bindSyncButtons();
  bindAddProjectDialog();
  bindEditProjectDialog();
});

function loadAndRenderProjects() {
  activeProjects = getProjects();
  renderActiveProjectsList();
}

function showInputFeedback(message, type = 'error') {
  const feedbackEl = document.getElementById('github-input-feedback');
  const handleInput = document.getElementById('github-handle-input');
  if (!feedbackEl) return;

  feedbackEl.style.display = 'block';
  feedbackEl.innerHTML = message;
  feedbackEl.style.color = type === 'error' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#22c55e');

  if (handleInput) {
    if (type === 'error' || type === 'warning') {
      handleInput.style.borderColor = '#ef4444';
      handleInput.style.outline = '1px solid #ef4444';
      handleInput.focus();
    } else {
      handleInput.style.borderColor = '';
      handleInput.style.outline = '';
    }
  }
}

function clearInputFeedback() {
  const feedbackEl = document.getElementById('github-input-feedback');
  const handleInput = document.getElementById('github-handle-input');
  if (feedbackEl) {
    feedbackEl.style.display = 'none';
    feedbackEl.innerHTML = '';
  }
  if (handleInput) {
    handleInput.style.borderColor = '';
    handleInput.style.outline = '';
  }
}

async function loadGitHubRepositories(rawUsername) {
  const cleanUsername = extractGitHubUsername(rawUsername);

  if (!cleanUsername) {
    showInputFeedback('Please enter your GitHub username (e.g. torvalds or octocat)', 'error');
    return;
  }

  clearInputFeedback();

  const syncBtn = document.getElementById('refresh-sync-btn');
  const connectBtn = document.getElementById('connect-github-btn');
  const statusHeading = document.getElementById('github-status-heading');
  const statusSubtitle = document.getElementById('github-status-subtitle');
  const badgeEl = document.getElementById('github-connection-badge');
  const container = document.getElementById('github-repos-container');
  const handleInput = document.getElementById('github-handle-input');

  if (syncBtn) syncBtn.disabled = true;
  if (connectBtn) {
    connectBtn.disabled = true;
    connectBtn.innerHTML = '<span>Connecting...</span>';
  }

  if (container) {
    container.innerHTML = `
      <div style="padding: var(--space-8); text-align: center; color: var(--text-muted); font-size: var(--text-xs); font-family: var(--font-mono);">
        <div style="width: 24px; height: 24px; border: 2px solid var(--border-color); border-top-color: var(--text-primary); border-radius: 50%; margin: 0 auto var(--space-3); animation: spin 0.8s linear infinite;"></div>
        Connecting to GitHub REST API for @${escapeHtml(cleanUsername)}...
      </div>
    `;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=pushed&per_page=30`);

    if (res.status === 404) {
      renderNotFoundError(cleanUsername);
      return;
    }

    if (res.status === 403) {
      renderRateLimitState(cleanUsername);
      return;
    }

    if (!res.ok) {
      throw new Error(`GitHub API error HTTP ${res.status}`);
    }

    fetchedRepos = await res.json();

    // Persist connected username to user-scoped profile and active session
    currentGitHubUser = cleanUsername;
    saveProfile({ githubUrl: `https://github.com/${cleanUsername}` });

    const activeUser = getActiveUser();
    if (activeUser) {
      activeUser.github_handle = cleanUsername;
      localStorage.setItem('profilefolio_session', JSON.stringify(activeUser));
      localStorage.setItem('profilefolio_active_user', JSON.stringify(activeUser));
    }

    if (handleInput) {
      handleInput.value = cleanUsername;
    }

    if (badgeEl) {
      badgeEl.style.display = 'inline-flex';
      badgeEl.textContent = `Connected: @${cleanUsername}`;
      badgeEl.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
      badgeEl.style.color = '#22c55e';
      badgeEl.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    }

    if (statusHeading) {
      statusHeading.textContent = `GitHub Synced: @${cleanUsername}`;
    }

    if (statusSubtitle) {
      statusSubtitle.innerHTML = `Connected to GitHub &bull; ${fetchedRepos.length} public ${fetchedRepos.length === 1 ? 'repository' : 'repositories'} discovered &bull; <button type="button" id="disconnect-gh-btn" style="background: none; border: none; color: var(--text-muted); text-decoration: underline; cursor: pointer; font-size: 11px; font-family: var(--font-mono); padding: 0;">Change Account</button>`;
      document.getElementById('disconnect-gh-btn')?.addEventListener('click', disconnectGitHub);
    }

    renderRepoChecklist(fetchedRepos);
  } catch (err) {
    console.warn('GitHub API fetch error:', err.message);
    renderNetworkError(cleanUsername, err.message);
  } finally {
    if (syncBtn) syncBtn.disabled = false;
    if (connectBtn) {
      connectBtn.disabled = false;
      connectBtn.innerHTML = 'Connect &amp; Fetch';
    }
  }
}

function disconnectGitHub() {
  currentGitHubUser = '';
  const handleInput = document.getElementById('github-handle-input');
  const badgeEl = document.getElementById('github-connection-badge');
  const statusHeading = document.getElementById('github-status-heading');
  const statusSubtitle = document.getElementById('github-status-subtitle');

  if (handleInput) handleInput.value = '';
  if (badgeEl) badgeEl.style.display = 'none';
  if (statusHeading) statusHeading.textContent = 'GitHub Repositories Sync';
  if (statusSubtitle) statusSubtitle.textContent = 'Connect your username to import public repositories directly.';

  fetchedRepos = [];
  renderEmptyGitHubPrompt();
  handleInput?.focus();
}

function renderNotFoundError(username) {
  const container = document.getElementById('github-repos-container');
  const statusHeading = document.getElementById('github-status-heading');
  const statusSubtitle = document.getElementById('github-status-subtitle');
  const badgeEl = document.getElementById('github-connection-badge');

  if (badgeEl) badgeEl.style.display = 'none';
  if (statusHeading) statusHeading.textContent = 'GitHub Repositories Sync';
  if (statusSubtitle) {
    statusSubtitle.innerHTML = `<span style="color: #ef4444;">User @${escapeHtml(username)} was not found on GitHub.</span>`;
  }

  if (container) {
    container.innerHTML = `
      <div style="padding: var(--space-8); text-align: center; max-width: 500px; margin: 0 auto;">
        <div style="font-size: var(--text-sm); font-weight: 700; color: #ef4444; margin-bottom: var(--space-2);">
          GitHub Account Not Found
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-4);">
          We could not find any GitHub user with username <strong>@${escapeHtml(username)}</strong>. Please verify the handle spelling or paste the full profile URL.
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="gh-retry-btn">
          Try Another Username
        </button>
      </div>
    `;

    document.getElementById('gh-retry-btn')?.addEventListener('click', () => {
      const handleInput = document.getElementById('github-handle-input');
      handleInput?.focus();
      handleInput?.select();
    });
  }
}

function renderRateLimitState(username) {
  const container = document.getElementById('github-repos-container');
  const statusHeading = document.getElementById('github-status-heading');
  const statusSubtitle = document.getElementById('github-status-subtitle');

  if (statusHeading) statusHeading.textContent = `GitHub Repositories Sync: @${username}`;
  if (statusSubtitle) {
    statusSubtitle.innerHTML = `<span style="color: #f59e0b;">GitHub API rate limit reached (60 requests/hr unauthenticated limit).</span>`;
  }

  if (container) {
    container.innerHTML = `
      <div style="padding: var(--space-8); text-align: center; max-width: 540px; margin: 0 auto;">
        <div style="font-size: var(--text-sm); font-weight: 700; color: #f59e0b; margin-bottom: var(--space-2);">
          GitHub API Rate Limit Reached
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-4);">
          GitHub unauthenticated requests are limited to 60 per hour per IP. You can load simulated demo repositories customized for <strong>@${escapeHtml(username)}</strong> or author custom projects anytime.
        </p>
        <div style="display: flex; gap: var(--space-2); justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary btn-sm" id="load-custom-demo-repos-btn">
            Load Demo Repos for @${escapeHtml(username)}
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="rate-limit-custom-btn">
            + Add Custom Project
          </button>
        </div>
      </div>
    `;

    document.getElementById('load-custom-demo-repos-btn')?.addEventListener('click', () => {
      fetchedRepos = generateDemoReposForUser(username);
      currentGitHubUser = username;
      saveProfile({ githubUrl: `https://github.com/${username}` });
      renderRepoChecklist(fetchedRepos);
    });

    document.getElementById('rate-limit-custom-btn')?.addEventListener('click', () => {
      document.getElementById('open-add-project-dialog-btn')?.click();
    });
  }
}

function renderNetworkError(username, message) {
  const container = document.getElementById('github-repos-container');
  const statusSubtitle = document.getElementById('github-status-subtitle');

  if (statusSubtitle) {
    statusSubtitle.innerHTML = `<span style="color: #ef4444;">Network connection issue with GitHub API.</span>`;
  }

  if (container) {
    container.innerHTML = `
      <div style="padding: var(--space-8); text-align: center;">
        <div style="font-size: var(--text-sm); font-weight: 700; color: #ef4444; margin-bottom: var(--space-2);">
          Unable to Reach GitHub
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-4);">
          ${escapeHtml(message || 'Network error')}. Please check your connection or try again shortly.
        </p>
        <button type="button" class="btn btn-secondary btn-sm" onclick="location.reload()">
          Reload Page
        </button>
      </div>
    `;
  }
}

function renderEmptyGitHubPrompt() {
  const container = document.getElementById('github-repos-container');
  if (!container) return;

  const activeUser = getActiveUser();
  const profile = getProfile();
  const suggestedUser = activeUser?.username || profile?.username || '';
  const isSunnyAccount = suggestedUser === 'sunny';

  container.innerHTML = `
    <div style="padding: var(--space-8) var(--space-4); text-align: center; max-width: 580px; margin: 0 auto;">
      <div style="width: 52px; height: 52px; border-radius: 50%; background: #121313; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4);">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </div>

      <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-2);">
        Connect Your GitHub Account
      </h3>
      <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-5);">
        Import your public repositories into your portfolio with 1-click. Live links, star counts, and tags are synchronized automatically.
      </p>

      <div style="display: flex; gap: var(--space-2); max-width: 420px; margin: 0 auto var(--space-4);">
        <input type="text" id="github-empty-input" class="form-input" placeholder="e.g. torvalds or https://github.com/user" style="flex: 1; padding: 8px 12px; font-size: var(--text-xs); font-family: var(--font-mono);" />
        <button type="button" class="btn btn-primary btn-sm" id="github-empty-connect-btn" style="white-space: nowrap; padding: 8px 16px;">
          Connect &amp; Fetch
        </button>
      </div>

      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
        <span>Quick test:</span>
        ${suggestedUser && !isSunnyAccount ? `<button type="button" class="sample-gh-chip" data-user="${escapeHtml(suggestedUser)}" style="background: none; border: 1px dashed var(--border-color); color: var(--text-secondary); padding: 2px 8px; border-radius: var(--radius-sm); cursor: pointer; font-size: 11px;">@${escapeHtml(suggestedUser)}</button>` : ''}
        <button type="button" class="sample-gh-chip" data-user="octocat" style="background: none; border: 1px dashed var(--border-color); color: var(--text-secondary); padding: 2px 8px; border-radius: var(--radius-sm); cursor: pointer; font-size: 11px;">@octocat</button>
        <button type="button" class="sample-gh-chip" data-user="torvalds" style="background: none; border: 1px dashed var(--border-color); color: var(--text-secondary); padding: 2px 8px; border-radius: var(--radius-sm); cursor: pointer; font-size: 11px;">@torvalds</button>
      </div>
    </div>
  `;

  // Bind quick connect inside empty prompt
  const emptyInput = document.getElementById('github-empty-input');
  const emptyBtn = document.getElementById('github-empty-connect-btn');
  const topInput = document.getElementById('github-handle-input');

  const triggerEmptyConnect = () => {
    const val = emptyInput?.value.trim();
    if (!val) {
      emptyInput?.focus();
      return;
    }
    if (topInput) topInput.value = val;
    loadGitHubRepositories(val);
  };

  emptyBtn?.addEventListener('click', triggerEmptyConnect);
  emptyInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerEmptyConnect();
    }
  });

  // Bind sample chips
  container.querySelectorAll('.sample-gh-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const u = chip.getAttribute('data-user');
      if (topInput) topInput.value = u;
      if (emptyInput) emptyInput.value = u;
      loadGitHubRepositories(u);
    });
  });
}

function renderRepoChecklist(repos) {
  const container = document.getElementById('github-repos-container');
  if (!container) return;

  if (!repos || repos.length === 0) {
    container.innerHTML = `
      <div style="padding: var(--space-6); text-align: center; color: var(--text-muted); font-size: var(--text-xs);">
        No public repositories found for this account.
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  repos.forEach((repo) => {
    // Check if repo is already imported
    const isAlreadyImported = activeProjects.some((p) => 
      p.repo_url === repo.html_url || 
      p.title.toLowerCase() === repo.name.toLowerCase()
    );

    const label = document.createElement('label');
    label.className = 'repo-select-item';
    label.style.opacity = isAlreadyImported ? '0.6' : '1';

    label.innerHTML = `
      <input type="checkbox" data-repo-id="${repo.id}" ${isAlreadyImported ? 'disabled checked' : ''} />
      <div class="repo-select-info" style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);">
          <h4 style="margin: 0; font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${escapeHtml(repo.name)}</h4>
          ${isAlreadyImported ? '<span style="font-size: 10px; color: #22c55e; font-family: var(--font-mono);">&check; Imported</span>' : ''}
        </div>
        <p style="margin: 4px 0; font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.4;">
          ${escapeHtml(repo.description || 'Public software repository.')}
        </p>
        <div class="repo-select-meta" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); display: flex; gap: var(--space-3);">
          <span>&bull; ${escapeHtml(repo.language || 'Code')}</span>
          <span>&star; ${repo.stargazers_count || 0} stars</span>
          <span>Updated ${formatTimeAgo(new Date(repo.updated_at))}</span>
        </div>
      </div>
    `;

    container.appendChild(label);
  });

  // Attach change listener to update import count
  container.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    box.addEventListener('change', updateImportCountButton);
  });

  updateImportCountButton();
}

function updateImportCountButton() {
  const container = document.getElementById('github-repos-container');
  const importBtn = document.getElementById('import-selected-btn');
  if (!container || !importBtn) return;

  const count = container.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)').length;
  importBtn.textContent = count > 0 ? `Import Selected (${count})` : 'Import Selected';
  importBtn.disabled = count === 0;
}

function bindSyncButtons() {
  const connectBtn = document.getElementById('connect-github-btn');
  const refreshBtn = document.getElementById('refresh-sync-btn');
  const handleInput = document.getElementById('github-handle-input');
  const importBtn = document.getElementById('import-selected-btn');

  // Input change clears error styling
  handleInput?.addEventListener('input', () => {
    clearInputFeedback();
  });

  // Enter key in input triggers connect
  handleInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      connectBtn?.click();
    }
  });

  // Connect GitHub Username
  connectBtn?.addEventListener('click', async () => {
    const raw = handleInput?.value.trim();
    const handle = extractGitHubUsername(raw);
    if (!handle) {
      showInputFeedback('Please enter your GitHub username or profile link (e.g. torvalds or https://github.com/username)', 'error');
      return;
    }
    await loadGitHubRepositories(handle);
  });

  // Refresh Sync Button
  refreshBtn?.addEventListener('click', async () => {
    const raw = handleInput?.value.trim();
    const handle = extractGitHubUsername(raw) || currentGitHubUser;
    if (!handle) {
      showInputFeedback('Please enter a GitHub username to refresh repositories.', 'warning');
      return;
    }
    await loadGitHubRepositories(handle);
  });

  // Import Selected Button
  importBtn?.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('#github-repos-container input[type="checkbox"]:checked:not(:disabled)');
    if (checkedBoxes.length === 0) return;

    if (importBtn) {
      importBtn.disabled = true;
      importBtn.textContent = 'Importing...';
    }

    checkedBoxes.forEach((checkbox) => {
      const repoId = Number(checkbox.getAttribute('data-repo-id'));
      const repo = fetchedRepos.find((r) => r.id === repoId);
      if (repo) {
        addProjectItem({
          title: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          description: repo.description || 'Public software application engineered on GitHub.',
          category: repo.language || 'Software',
          tags: repo.topics && repo.topics.length ? repo.topics : [repo.language || 'Web', 'Open Source'],
          repo_url: repo.html_url,
          live_url: repo.homepage || '',
          stars_count: repo.stargazers_count || 0,
          featured: true
        });
      }
    });

    loadAndRenderProjects();
    renderRepoChecklist(fetchedRepos);

    if (importBtn) {
      importBtn.disabled = false;
      importBtn.textContent = '✓ Imported!';
      setTimeout(updateImportCountButton, 2000);
    }
  });
}

function renderActiveProjectsList() {
  const container = document.getElementById('active-projects-container');
  const countBadge = document.getElementById('active-projects-count');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${activeProjects.length} Projects`;
  }

  if (activeProjects.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-8); border: 1px dashed var(--border-color); border-radius: var(--radius-md); color: var(--text-muted); font-size: var(--text-xs);">
        No projects showcased yet. Click "+ Add Custom Project" or import from GitHub above.
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  activeProjects.forEach((proj) => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'flex-start';
    card.style.padding = 'var(--space-4)';
    card.style.border = '1px solid var(--border-color)';
    card.style.borderRadius = 'var(--radius-md)';
    card.style.backgroundColor = 'var(--bg-primary)';
    card.style.gap = 'var(--space-4)';
    card.style.flexWrap = 'wrap';

    const tagsHtml = Array.isArray(proj.tags) 
      ? proj.tags.map(t => `<span class="badge" style="font-size: 10px;">${escapeHtml(t)}</span>`).join(' ')
      : (proj.tags ? `<span class="badge" style="font-size: 10px;">${escapeHtml(proj.tags)}</span>` : '');

    card.innerHTML = `
      <div style="flex: 1; min-width: 260px;">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px; flex-wrap: wrap;">
          <h4 style="margin: 0; font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${escapeHtml(proj.title)}</h4>
          <span class="badge" style="font-size: 10px;">${escapeHtml(proj.category || 'System')}</span>
          ${proj.featured ? '<span style="font-size: 10px; color: #22c55e; font-family: var(--font-mono);">&star; Featured</span>' : ''}
        </div>
        <p style="margin: 0 0 8px 0; font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.4;">
          ${escapeHtml(proj.description || '')}
        </p>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
          ${tagsHtml}
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
        ${proj.stars_count ? `<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">&star; ${proj.stars_count}</span>` : ''}
        ${proj.repo_url ? `<a href="${proj.repo_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;">Repo &nearr;</a>` : ''}
        ${proj.live_url ? `<a href="${proj.live_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;">Demo &nearr;</a>` : ''}
        <button type="button" class="btn btn-secondary btn-sm edit-proj-btn" data-id="${proj.id}" style="font-size: 11px; padding: 4px 8px;">
          Edit
        </button>
        <button type="button" class="btn btn-secondary btn-sm delete-proj-btn" data-id="${proj.id}" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4); padding: 4px 8px; font-size: 11px;">
          Remove
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach Edit and Delete handlers
  container.querySelectorAll('.edit-proj-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditProjectDialog(id);
    });
  });

  container.querySelectorAll('.delete-proj-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (window.confirm('Are you sure you want to remove this project from your portfolio?')) {
        deleteProjectItem(id);
        loadAndRenderProjects();
        renderRepoChecklist(fetchedRepos);
      }
    });
  });
}

function bindAddProjectDialog() {
  const dialog = document.getElementById('add-project-dialog');
  const openBtn = document.getElementById('open-add-project-dialog-btn');
  const closeBtn = document.getElementById('close-add-dialog-btn');
  const cancelBtn = document.getElementById('cancel-add-dialog-btn');
  const form = document.getElementById('add-project-form');

  if (openBtn && dialog) openBtn.addEventListener('click', () => dialog.showModal());
  if (closeBtn && dialog) closeBtn.addEventListener('click', () => dialog.close());
  if (cancelBtn && dialog) cancelBtn.addEventListener('click', () => dialog.close());

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('new-proj-title')?.value.trim();
    const description = document.getElementById('new-proj-desc')?.value.trim();
    const category = document.getElementById('new-proj-category')?.value.trim() || 'Software';
    const rawTags = document.getElementById('new-proj-tags')?.value.trim();
    const repo_url = document.getElementById('new-proj-repo-url')?.value.trim();
    const live_url = document.getElementById('new-proj-live-url')?.value.trim();
    const featured = document.getElementById('new-proj-featured')?.checked ?? true;

    if (!title || !description) return;

    const tags = rawTags ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : [category];

    addProjectItem({
      title,
      description,
      category,
      tags,
      repo_url,
      live_url,
      featured,
      stars_count: 0
    });

    form.reset();
    dialog?.close();
    loadAndRenderProjects();
  });
}

function bindEditProjectDialog() {
  const dialog = document.getElementById('edit-project-dialog');
  const closeBtn = document.getElementById('close-edit-dialog-btn');
  const cancelBtn = document.getElementById('cancel-edit-dialog-btn');
  const form = document.getElementById('edit-project-form');

  if (closeBtn && dialog) closeBtn.addEventListener('click', () => dialog.close());
  if (cancelBtn && dialog) cancelBtn.addEventListener('click', () => dialog.close());

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-proj-id')?.value;
    const title = document.getElementById('edit-proj-title')?.value.trim();
    const description = document.getElementById('edit-proj-desc')?.value.trim();
    const category = document.getElementById('edit-proj-category')?.value.trim();
    const rawTags = document.getElementById('edit-proj-tags')?.value.trim();
    const repo_url = document.getElementById('edit-proj-repo-url')?.value.trim();
    const live_url = document.getElementById('edit-proj-live-url')?.value.trim();
    const featured = document.getElementById('edit-proj-featured')?.checked;

    if (!id || !title || !description) return;

    const tags = rawTags ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : [category];

    updateProjectItem(id, {
      title,
      description,
      category,
      tags,
      repo_url,
      live_url,
      featured
    });

    dialog?.close();
    loadAndRenderProjects();
  });
}

function openEditProjectDialog(id) {
  const dialog = document.getElementById('edit-project-dialog');
  const proj = activeProjects.find((p) => p.id === id);
  if (!proj || !dialog) return;

  const idInput = document.getElementById('edit-proj-id');
  const titleInput = document.getElementById('edit-proj-title');
  const descInput = document.getElementById('edit-proj-desc');
  const catInput = document.getElementById('edit-proj-category');
  const tagsInput = document.getElementById('edit-proj-tags');
  const repoInput = document.getElementById('edit-proj-repo-url');
  const liveInput = document.getElementById('edit-proj-live-url');
  const featInput = document.getElementById('edit-proj-featured');

  if (idInput) idInput.value = proj.id;
  if (titleInput) titleInput.value = proj.title;
  if (descInput) descInput.value = proj.description || '';
  if (catInput) catInput.value = proj.category || 'Software';
  if (tagsInput) tagsInput.value = Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || '');
  if (repoInput) repoInput.value = proj.repo_url || '';
  if (liveInput) liveInput.value = proj.live_url || '';
  if (featInput) featInput.checked = !!proj.featured;

  dialog.showModal();
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'recently';
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
