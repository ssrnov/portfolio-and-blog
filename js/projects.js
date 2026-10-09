/**
 * SSRNovX Portfolio & Blog — Projects Gallery Module
 * Search, category filtering, and dynamic card rendering
 */

import { fetchProjects } from './data.js';

let allProjects = [];
let currentCategory = 'all';
let searchQuery = '';

export async function initProjects() {
  const container = document.getElementById('projects-grid');
  const searchInput = document.getElementById('project-search');
  const filterButtons = document.querySelectorAll('#project-filters .filter-btn');

  if (!container) return;

  allProjects = await fetchProjects();
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
        <p class="empty-state-title">No matching projects found</p>
        <p>Try adjusting your search query or switching to "All" categories.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (project) => `
    <article class="project-card" data-category="${project.category.toLowerCase()}">
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
          <span aria-hidden="true">↗</span>
        </a>
        <a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-card">
          <span>Live Demo</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  `
    )
    .join('');
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
