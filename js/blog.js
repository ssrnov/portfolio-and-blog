/**
 * SSRNovX Portfolio & Blog — Blog Engine Module
 * Dynamic listing, tag filtering, search, and accessible modal article reader
 */

import { fetchBlogPosts } from './data.js';

let allPosts = [];
let currentTag = 'all';
let searchQuery = '';

export async function initBlog() {
  allPosts = await fetchBlogPosts();

  // 1. Full Blog Page (/blog)
  const fullGrid = document.getElementById('blog-grid');
  if (fullGrid) {
    const searchInput = document.getElementById('blog-search');
    const filterButtons = document.querySelectorAll('#blog-filters .filter-btn');

    renderFilteredPosts();

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderFilteredPosts();
      });
    }

    // Tag filter buttons
    filterButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentTag = btn.getAttribute('data-tag') || 'all';
        renderFilteredPosts();
      });
    });
  }

  // 2. Home Page Featured Preview (if element exists)
  const featuredGrid = document.getElementById('featured-blog-grid');
  if (featuredGrid) {
    renderFeaturedBlog(featuredGrid);
  }

  // 3. Modal listeners (if modal container exists on the page)
  initModalListeners();
  checkInitialUrlHash();

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
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
          <path d="M6 6h10"></path>
          <path d="M6 10h10"></path>
        </svg>
        <p class="empty-state-title">No matching articles found</p>
        <p class="empty-state-desc">Try adjusting your search query or switching back to the "All" topic filter.</p>
        <button type="button" class="btn btn-secondary btn-card" id="reset-blog-filters">
          Reset Search &amp; Filters
        </button>
      </div>
    `;

    const resetBtn = document.getElementById('reset-blog-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const searchInput = document.getElementById('blog-search');
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        currentTag = 'all';

        const filterButtons = document.querySelectorAll('#blog-filters .filter-btn');
        filterButtons.forEach((b) => {
          const isAll = b.getAttribute('data-tag') === 'all';
          b.classList.toggle('active', isAll);
          b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });

        renderFilteredPosts();
      });
    }

    return;
  }

  container.innerHTML = filtered.map((post) => buildArticleCardHtml(post)).join('');
  attachArticleCardListeners(container);
}

function renderFeaturedBlog(container) {
  container.innerHTML = allPosts.slice(0, 2).map((post) => buildArticleCardHtml(post)).join('');
  attachArticleCardListeners(container);
}

function buildArticleCardHtml(post) {
  // Direct link URL: sample article page or slug
  const articleUrl = '/blog/sample-article/';

  return `
    <article class="blog-card" data-slug="${escapeHtml(post.slug)}">
      <div>
        <div class="blog-meta">
          <span class="project-category-tag">${escapeHtml(post.category)}</span>
          <span>&bull;</span>
          <time datetime="${post.date}">${escapeHtml(post.date)}</time>
          <span>&bull;</span>
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
      <div style="margin-top: 1rem; display: flex; align-items: center; justify-content: space-between;">
        <a href="${articleUrl}" class="read-article-btn">
          Read full article &rarr;
        </a>
        <button type="button" class="btn btn-secondary btn-card preview-modal-btn" data-slug="${post.slug}" title="Quick modal preview">
          Quick View
        </button>
      </div>
    </article>
  `;
}

function attachArticleCardListeners(container) {
  container.querySelectorAll('.preview-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
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
  meta.textContent = `${post.date} • ${post.readTime} • Category: ${post.category}`;
  body.innerHTML = post.content;

  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (window.location.hash !== `#blog/${slug}`) {
    history.pushState(null, '', `#blog/${slug}`);
  }

  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.focus();
}

function closeArticleModal() {
  const modal = document.getElementById('article-modal');
  if (!modal || !modal.classList.contains('is-active')) return;

  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (window.location.hash.startsWith('#blog/')) {
    history.pushState(null, '', window.location.pathname);
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
