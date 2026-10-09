/**
 * SSRNovX Portfolio & Blog — Projects Gallery Module
 * Search, category filtering, thumbnail generation, and responsive card rendering
 */

import { fetchProjects } from './data.js';

let allProjects = [];
let currentCategory = 'all';
let searchQuery = '';

export async function initProjects() {
  allProjects = await fetchProjects();

  // 1. Initialize Full Projects Grid (on /projects)
  const fullGrid = document.getElementById('projects-grid');
  if (fullGrid) {
    const searchInput = document.getElementById('project-search');
    const filterButtons = document.querySelectorAll('#project-filters .filter-btn');

    renderFilteredProjects();

    // Bind Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderFilteredProjects();
      });
    }

    // Bind Filter Buttons with accessible state
    filterButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentCategory = btn.getAttribute('data-category') || 'all';
        renderFilteredProjects();
      });
    });
  }

  // 2. Initialize Featured Projects Preview (on Home page /)
  const featuredGrid = document.getElementById('featured-projects-grid');
  if (featuredGrid) {
    renderFeaturedProjects(featuredGrid);
  }
}

/**
 * Generates an SVG architectural blueprint/wireframe thumbnail placeholder
 * tailored to each project's domain without external dependencies.
 */
function getProjectThumbnailSvg(category, title) {
  const cat = (category || '').toLowerCase();
  
  if (cat === 'backend') {
    return `
      <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="400" height="225" fill="var(--bg-secondary)" />
        <line x1="20" y1="20" x2="380" y2="20" stroke="var(--border-color)" stroke-dasharray="4 4" />
        <line x1="20" y1="205" x2="380" y2="205" stroke="var(--border-color)" stroke-dasharray="4 4" />
        <rect x="50" y="60" width="80" height="100" rx="4" stroke="currentColor" stroke-width="1.5" />
        <text x="90" y="115" fill="currentColor" font-family="monospace" font-size="10" text-anchor="middle">QUEUE</text>
        <path d="M130 110 H180" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" />
        <rect x="180" y="45" width="100" height="135" rx="4" stroke="currentColor" stroke-width="1.5" />
        <text x="230" y="105" fill="currentColor" font-family="monospace" font-size="10" text-anchor="middle">WORKER POOL</text>
        <text x="230" y="125" fill="var(--text-muted)" font-family="monospace" font-size="9" text-anchor="middle">x4 Threads</text>
        <path d="M280 110 H320" stroke="currentColor" stroke-width="1.5" />
        <circle cx="340" cy="110" r="15" stroke="currentColor" stroke-width="1.5" />
        <text x="340" y="113" fill="currentColor" font-family="monospace" font-size="9" text-anchor="middle">ACK</text>
      </svg>
    `;
  }

  if (cat === 'tools') {
    return `
      <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="400" height="225" fill="var(--bg-secondary)" />
        <rect x="40" y="35" width="320" height="155" rx="6" stroke="currentColor" stroke-width="1.5" />
        <line x1="40" y1="65" x2="360" y2="65" stroke="var(--border-color)" />
        <circle cx="56" cy="50" r="4" fill="currentColor" />
        <circle cx="70" cy="50" r="4" fill="currentColor" />
        <circle cx="84" cy="50" r="4" fill="currentColor" />
        <text x="60" y="95" fill="currentColor" font-family="monospace" font-size="11">$ algo-sim --run pathfinding</text>
        <text x="60" y="120" fill="var(--text-muted)" font-family="monospace" font-size="10">&gt; Dijkstra: 48 nodes visited (0.42ms)</text>
        <text x="60" y="140" fill="var(--text-muted)" font-family="monospace" font-size="10">&gt; A* Heuristic: 19 nodes visited (0.16ms)</text>
        <text x="60" y="165" fill="currentColor" font-family="monospace" font-size="11">&gt; Optimal Path Found [OK]</text>
      </svg>
    `;
  }

  if (cat === 'security') {
    return `
      <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="400" height="225" fill="var(--bg-secondary)" />
        <path d="M200 40 L280 75 V130 C280 175 200 205 200 205 C200 205 120 175 120 130 V75 Z" stroke="currentColor" stroke-width="1.5" />
        <circle cx="200" cy="115" r="16" stroke="currentColor" stroke-width="1.5" />
        <path d="M200 131 V150" stroke="currentColor" stroke-width="2" />
        <text x="200" y="175" fill="var(--text-muted)" font-family="monospace" font-size="9" text-anchor="middle">AES-256-GCM / PBKDF2</text>
      </svg>
    `;
  }

  // Default: Web / Full-Stack Interface Wireframe
  return `
    <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="400" height="225" fill="var(--bg-secondary)" />
      <rect x="40" y="30" width="320" height="165" rx="6" stroke="currentColor" stroke-width="1.5" />
      <line x1="40" y1="58" x2="360" y2="58" stroke="var(--border-color)" />
      <circle cx="56" cy="44" r="3.5" fill="currentColor" />
      <circle cx="70" cy="44" r="3.5" fill="currentColor" />
      <circle cx="84" cy="44" r="3.5" fill="currentColor" />
      <rect x="58" y="75" width="90" height="14" rx="2" fill="var(--border-color)" />
      <rect x="58" y="100" width="284" height="20" rx="3" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" />
      <rect x="58" y="132" width="135" height="45" rx="4" stroke="currentColor" stroke-width="1.2" />
      <rect x="207" y="132" width="135" height="45" rx="4" stroke="currentColor" stroke-width="1.2" />
    </svg>
  `;
}

function renderFilteredProjects() {
  const container = document.getElementById('projects-grid');
  const countDisplay = document.getElementById('projects-count');
  if (!container) return;

  const filtered = allProjects.filter((project) => {
    const matchesCategory =
      currentCategory === 'all' ||
      project.category.toLowerCase() === currentCategory.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      project.title.toLowerCase().includes(searchQuery) ||
      project.description.toLowerCase().includes(searchQuery) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

    return matchesCategory && matchesSearch;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${allProjects.length} projects`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p class="empty-state-title">No matching projects found</p>
        <p class="empty-state-desc">Try clearing your search query or switching to a different category filter.</p>
        <button type="button" class="btn btn-secondary btn-card" id="reset-project-filters">
          Reset Search &amp; Filters
        </button>
      </div>
    `;

    const resetBtn = document.getElementById('reset-project-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const searchInput = document.getElementById('project-search');
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        currentCategory = 'all';

        const filterButtons = document.querySelectorAll('#project-filters .filter-btn');
        filterButtons.forEach((b) => {
          const isAll = b.getAttribute('data-category') === 'all';
          b.classList.toggle('active', isAll);
          b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });

        renderFilteredProjects();
      });
    }

    return;
  }

  container.innerHTML = filtered.map((project) => buildProjectCardHtml(project)).join('');
}

function renderFeaturedProjects(container) {
  const featured = allProjects.filter((p) => p.featured).slice(0, 3);
  const projectsToDisplay = featured.length > 0 ? featured : allProjects.slice(0, 3);
  container.innerHTML = projectsToDisplay.map((project) => buildProjectCardHtml(project)).join('');
}

function buildProjectCardHtml(project) {
  return `
    <article class="project-card" data-category="${project.category.toLowerCase()}">
      <div class="project-card-thumb">
        ${getProjectThumbnailSvg(project.category, project.title)}
      </div>
      <div class="project-card-content">
        <div>
          <div class="project-card-header">
            <span class="project-category-tag">${escapeHtml(project.category)}</span>
            <span class="project-year">${escapeHtml(project.year)}</span>
          </div>
          <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
          <p class="project-card-desc">${escapeHtml(project.description)}</p>
          <div class="project-tags" aria-label="Technologies used">
            ${project.tags
              .map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`)
              .join('')}
          </div>
        </div>
        <div class="project-card-actions">
          <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-card">
            <span>Source Code</span>
            <span aria-hidden="true">&nearr;</span>
          </a>
          <a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-card">
            <span>Live Demo</span>
            <span aria-hidden="true">&nearr;</span>
          </a>
        </div>
      </div>
    </article>
  `;
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
