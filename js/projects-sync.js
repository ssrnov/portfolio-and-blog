/**
 * SSRNovX — GitHub Repositories Sync & Project Manager
 * Connects to GitHub REST API, fetches repositories with stars & metadata,
 * and converts them into portfolio project records with 1-click import.
 */

import { authService, profileService, portfolioService, projectService } from './supabase.js';

// Default mock repositories if offline or GitHub API rate-limited
const FALLBACK_REPOS = [
  {
    id: 991,
    name: 'task-engine',
    full_name: 'ssrnov/task-engine',
    description: 'Asynchronous background task runner with priority queueing and worker pool concurrency.',
    language: 'Node.js',
    stargazers_count: 42,
    forks_count: 8,
    html_url: 'https://github.com/ssrnov',
    homepage: '',
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    topics: ['nodejs', 'redis', 'concurrency'],
  },
  {
    id: 992,
    name: 'cloud-metrics',
    full_name: 'ssrnov/cloud-metrics',
    description: 'Real-time cloud observability dashboard featuring live streaming metrics via WebSockets.',
    language: 'JavaScript',
    stargazers_count: 28,
    forks_count: 4,
    html_url: 'https://github.com/ssrnov',
    homepage: 'https://ssrnovx.dev',
    updated_at: new Date(Date.now() - 345600000).toISOString(),
    topics: ['websockets', 'canvas', 'telemetry'],
  },
  {
    id: 993,
    name: 'crypto-vault',
    full_name: 'ssrnov/crypto-vault',
    description: 'Client-side end-to-end cryptographic secret store using Web Crypto API and AES-256-GCM.',
    language: 'TypeScript',
    stargazers_count: 19,
    forks_count: 2,
    html_url: 'https://github.com/ssrnov',
    homepage: '',
    updated_at: new Date(Date.now() - 604800000).toISOString(),
    topics: ['web-crypto', 'security', 'zero-knowledge'],
  },
  {
    id: 994,
    name: 'mini-canvas-collab',
    full_name: 'ssrnov/mini-canvas-collab',
    description: 'Real-time collaborative drawing canvas with conflict-free stroke synchronization.',
    language: 'TypeScript',
    stargazers_count: 14,
    forks_count: 1,
    html_url: 'https://github.com/ssrnov',
    homepage: '',
    updated_at: new Date(Date.now() - 864000000).toISOString(),
    topics: ['canvas', 'realtime'],
  },
];

const LOCAL_PROJECTS_KEY = 'ssrnovx_active_projects';

let fetchedRepos = [];
let activeProjects = [];
let currentGitHubUser = 'ssrnov';

document.addEventListener('DOMContentLoaded', async () => {
  // Load session or saved GitHub handle
  try {
    const session = await authService.getSession();
    if (session?.user) {
      const profile = await profileService.getProfile(session.user.id);
      if (profile?.github_handle) {
        currentGitHubUser = profile.github_handle;
      }
    }
  } catch (err) {
    console.warn('Session retrieval in projects sync:', err);
  }

  // Load existing projects from storage
  loadActiveProjects();

  // Fetch initial repositories
  await loadGitHubRepositories(currentGitHubUser);

  // Bind Buttons
  bindSyncButtons();
});

async function loadGitHubRepositories(username) {
  const syncBtn = document.getElementById('refresh-sync-btn');
  const bannerText = document.querySelector('.dashboard-content p[style*="font-mono"]');

  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = '<span>Fetching Repositories...</span>';
  }

  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=15`);
    if (response.ok) {
      const data = await response.json();
      fetchedRepos = Array.isArray(data) && data.length > 0 ? data : FALLBACK_REPOS;
    } else {
      console.warn('GitHub API rate limited or user not found, using cached records.');
      fetchedRepos = FALLBACK_REPOS;
    }
  } catch (err) {
    console.warn('Network error while fetching GitHub repos:', err);
    fetchedRepos = FALLBACK_REPOS;
  }

  if (bannerText) {
    bannerText.innerHTML = `Connected to @${username} &bull; ${fetchedRepos.length} repositories found`;
  }

  if (syncBtn) {
    syncBtn.disabled = false;
    syncBtn.innerHTML = '<span>Refresh All Repositories</span>';
  }

  renderRepoChecklist(fetchedRepos);
}

function renderRepoChecklist(repos) {
  const container = document.querySelector('.github-repo-grid');
  if (!container) return;

  container.innerHTML = '';

  repos.forEach((repo) => {
    const isAlreadyImported = activeProjects.some((p) => p.title.toLowerCase() === repo.name.toLowerCase());
    const label = document.createElement('label');
    label.className = 'repo-select-item';
    label.style.display = 'flex';
    label.style.alignItems = 'flex-start';
    label.style.gap = 'var(--space-3)';
    label.style.padding = 'var(--space-4)';
    label.style.border = '1px solid var(--border-color)';
    label.style.borderRadius = 'var(--radius-md)';
    label.style.backgroundColor = isAlreadyImported ? 'var(--bg-secondary)' : 'var(--bg-surface)';
    label.style.cursor = 'pointer';

    const timeAgo = formatTimeAgo(new Date(repo.updated_at));

    label.innerHTML = `
      <input type="checkbox" data-repo-id="${repo.id}" ${isAlreadyImported ? 'checked disabled' : 'checked'} style="margin-top: 4px;" />
      <div class="repo-select-info" style="flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <h4 style="margin: 0; font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${repo.full_name || repo.name}</h4>
          ${isAlreadyImported ? '<span class="brand-badge" style="font-size: 10px;">Imported</span>' : ''}
        </div>
        <p style="margin: 0 0 var(--space-2) 0; font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.4;">
          ${repo.description || 'No description provided.'}
        </p>
        <div class="repo-select-meta" style="display: flex; gap: var(--space-4); font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">
          <span>&bull; ${repo.language || 'Code'}</span>
          <span>&star; ${repo.stargazers_count || 0} stars</span>
          <span>Updated ${timeAgo}</span>
        </div>
      </div>
    `;

    container.appendChild(label);
  });

  updateImportCountButton();
}

function updateImportCountButton() {
  const importBtn = document.getElementById('import-selected-btn');
  if (!importBtn) return;

  const checkboxes = document.querySelectorAll('.github-repo-grid input[type="checkbox"]:checked:not(:disabled)');
  importBtn.textContent = `Import Selected (${checkboxes.length})`;
}

function bindSyncButtons() {
  // Checkbox toggle count listener
  document.querySelector('.github-repo-grid')?.addEventListener('change', () => {
    updateImportCountButton();
  });

  // Refresh Repos Button
  document.getElementById('refresh-sync-btn')?.addEventListener('click', async () => {
    await loadGitHubRepositories(currentGitHubUser);
  });

  // Import Selected Button
  document.getElementById('import-selected-btn')?.addEventListener('click', async () => {
    const importBtn = document.getElementById('import-selected-btn');
    const checkedBoxes = document.querySelectorAll('.github-repo-grid input[type="checkbox"]:checked:not(:disabled)');

    if (checkedBoxes.length === 0) {
      alert('Please select at least one repository to import.');
      return;
    }

    if (importBtn) {
      importBtn.disabled = true;
      importBtn.textContent = 'Importing...';
    }

    checkedBoxes.forEach((checkbox) => {
      const repoId = Number(checkbox.getAttribute('data-repo-id'));
      const repo = fetchedRepos.find((r) => r.id === repoId);
      if (repo) {
        activeProjects.push({
          id: 'proj_' + repo.id,
          title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          description: repo.description || 'Engineered scalable system.',
          category: repo.language || 'Software',
          tags: repo.topics && repo.topics.length ? repo.topics : [repo.language || 'Web', 'Open Source'],
          repo_url: repo.html_url,
          live_url: repo.homepage || '',
          stars_count: repo.stargazers_count,
        });
      }
    });

    saveActiveProjects();
    renderActiveProjectsList();
    renderRepoChecklist(fetchedRepos);

    if (importBtn) {
      importBtn.disabled = false;
      importBtn.textContent = '✓ Imported to Portfolio!';
      setTimeout(() => {
        updateImportCountButton();
      }, 2000);
    }
  });
}

function loadActiveProjects() {
  const saved = localStorage.getItem(LOCAL_PROJECTS_KEY);
  if (saved) {
    try {
      activeProjects = JSON.parse(saved);
    } catch (e) {
      activeProjects = [];
    }
  }

  if (activeProjects.length === 0) {
    // Default starting projects
    activeProjects = [
      {
        id: 'proj_1',
        title: 'Distributed Task Queue & Worker Engine',
        description: 'Fault-tolerant message queue built on Redis Streams and Node.js worker pools with dead-letter retries.',
        category: 'Backend',
        tags: ['Redis', 'Node.js', 'Concurrency'],
        repo_url: 'https://github.com/ssrnov',
        live_url: '',
        stars_count: 42,
      },
      {
        id: 'proj_2',
        title: 'Real-Time Cloud Observability Dashboard',
        description: 'Zero-dependency telemetry visualizer streaming metrics via WebSockets with canvas charts at 60fps.',
        category: 'Web',
        tags: ['JavaScript', 'WebSockets', 'Canvas'],
        repo_url: 'https://github.com/ssrnov',
        live_url: 'https://ssrnovx.dev',
        stars_count: 28,
      },
      {
        id: 'proj_3',
        title: 'Client-Side Cryptographic Vault',
        description: 'End-to-end encrypted secret store executing in-browser via Web Crypto API with AES-256-GCM.',
        category: 'Security',
        tags: ['Web Crypto', 'AES-256', 'Security'],
        repo_url: 'https://github.com/ssrnov',
        live_url: '',
        stars_count: 19,
      },
    ];
    saveActiveProjects();
  }

  renderActiveProjectsList();
}

function saveActiveProjects() {
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(activeProjects));
}

function renderActiveProjectsList() {
  const container = document.querySelector('.dashboard-content > section:last-of-type > div[style*="display: flex"]');
  if (!container) return;

  container.innerHTML = '';

  activeProjects.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';
    card.style.padding = 'var(--space-4)';
    card.style.border = '1px solid var(--border-color)';
    card.style.borderRadius = 'var(--radius-md)';
    card.style.backgroundColor = 'var(--bg-secondary)';
    card.style.gap = 'var(--space-4)';
    card.style.flexWrap = 'wrap';

    card.innerHTML = `
      <div style="flex: 1; min-width: 260px;">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 2px;">
          <h4 style="margin: 0; font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${proj.title}</h4>
          <span class="brand-badge" style="font-size: 10px;">${proj.category || 'System'}</span>
        </div>
        <p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.4;">
          ${proj.description}
        </p>
      </div>

      <div style="display: flex; align-items: center; gap: var(--space-3);">
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">&star; ${proj.stars_count || 0}</span>
        <button type="button" class="btn btn-secondary btn-card delete-proj-btn" data-index="${idx}" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4); padding: 4px 10px; font-size: 11px;">
          Remove
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach delete handlers
  container.querySelectorAll('.delete-proj-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.getAttribute('data-index'));
      activeProjects.splice(index, 1);
      saveActiveProjects();
      renderActiveProjectsList();
      renderRepoChecklist(fetchedRepos);
    });
  });
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
  return 'just now';
}
