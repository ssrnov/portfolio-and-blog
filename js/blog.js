/**
 * SSRNovX Portfolio & Blog — Blog Engine Module
 * Dynamic listing, tag filtering, search, and accessible modal article reader
 */

import { fetchBlogPosts } from './data.js';

let allPosts = [];
let currentTag = 'all';
let searchQuery = '';

export async function initBlog() {
  const container = document.getElementById('blog-grid');
  const searchInput = document.getElementById('blog-search');
  const filterButtons = document.querySelectorAll('#blog-filters .filter-btn');

  if (!container) return;

  allPosts = await fetchBlogPosts();
  renderFilteredPosts();
  initModalListeners();
  checkInitialUrlHash();

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderFilteredPosts();
    });
  }

  // Tag filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentTag = btn.getAttribute('data-tag') || 'all';
      renderFilteredPosts();
    });
  });

  // Listen for hash change for deep-linking
  window.addEventListener('hashchange', checkInitialUrlHash);
}

function renderFilteredPosts() {
  const container = document.getElementById('blog-grid');
  const countDisplay = document.getElementById('blog-count');
  if (!container) return;

  const filtered = allPosts.filter((post) => {
    const matchesTag =
      currentTag === 'all' ||
      post.tags.some((t) => t.toLowerCase() === currentTag.toLowerCase()) ||
      post.category.toLowerCase() === currentTag.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery) ||
      post.excerpt.toLowerCase().includes(searchQuery) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery));

    return matchesTag && matchesSearch;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${allPosts.length} articles`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">No articles match your query</p>
        <p>Try searching for topics like "JavaScript", "Architecture", or "Performance".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (post) => `
    <article class="blog-card">
      <div>
        <div class="blog-meta">
          <time datetime="${post.date}">${escapeHtml(post.date)}</time>
          <span>•</span>
          <span>${escapeHtml(post.readTime)}</span>
        </div>
        <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
        <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="project-tags" aria-label="Article tags">
          ${post.tags
            .map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`)
            .join('')}
        </div>
      </div>
      <div style="margin-top: 1rem;">
        <button type="button" class="read-article-btn" data-slug="${post.slug}">
          Read full article &rarr;
        </button>
      </div>
    </article>
  `
    )
    .join('');

  // Attach click listeners to read buttons
  container.querySelectorAll('.read-article-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-slug');
      openArticleModal(slug);
    });
  });
}

function openArticleModal(slug) {
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) return;

  const modal = document.getElementById('article-modal');
  const title = document.getElementById('modal-article-title');
  const meta = document.getElementById('modal-article-meta');
  const body = document.getElementById('modal-article-body');

  if (!modal || !title || !meta || !body) return;

  title.textContent = post.title;
  meta.textContent = `${post.date} • ${post.readTime} • Tags: ${post.tags.join(', ')}`;
  body.innerHTML = post.content;

  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Update hash for shareability without full reload
  if (window.location.hash !== `#blog/${slug}`) {
    history.pushState(null, '', `#blog/${slug}`);
  }

  // Focus close button for accessibility
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.focus();
}

function closeArticleModal() {
  const modal = document.getElementById('article-modal');
  if (!modal || !modal.classList.contains('is-active')) return;

  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Clear blog hash if set
  if (window.location.hash.startsWith('#blog/')) {
    history.pushState(null, '', window.location.pathname + '#blog');
  }
}

function initModalListeners() {
  const modal = document.getElementById('article-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeArticleModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeArticleModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeArticleModal();
    }
  });
}

function checkInitialUrlHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#blog/')) {
    const slug = hash.replace('#blog/', '');
    openArticleModal(slug);
  }
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
