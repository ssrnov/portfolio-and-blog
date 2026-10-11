/**
 * ProfileFolio — Dynamic Public Article Reader
 * Resolves /blog/sample-article/?slug=:slug or /blog/:slug, queries published articles,
 * and renders title, metadata, and formatted markdown content.
 */

import { DEFAULT_BLOG_ARTICLES } from './profile-data.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  let slug = params.get('slug') || params.get('id') || params.get('post');

  // Also support extracting slug from pathname e.g. /blog/sample-article/my-slug or /blog/my-slug
  if (!slug) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'blog') {
      const last = parts[parts.length - 1].replace(/\.html$/, '');
      if (last && last !== 'sample-article' && last !== 'post' && last !== 'index') {
        slug = last;
      }
    }
  }

  try {
    const raw = localStorage.getItem('profilefolio_blog_articles') || 
                localStorage.getItem('ssrnovx_blog_articles');
    let articles = raw ? JSON.parse(raw) : [];
    
    // Find matching post by slug or ID (case-insensitive)
    let post = null;
    const matchFn = (a) => {
      if (!a) return false;
      if (!slug) return false;
      const target = slug.toLowerCase();
      return (a.slug && a.slug.toLowerCase() === target) || (a.id && String(a.id).toLowerCase() === target);
    };

    if (slug) {
      post = articles.find(matchFn);

      if (!post && Array.isArray(DEFAULT_BLOG_ARTICLES)) {
        post = DEFAULT_BLOG_ARTICLES.find(matchFn);
      }

      if (!post) {
        try {
          const res = await fetch('/data/blog.json');
          if (res.ok) {
            const fallback = await res.json();
            if (Array.isArray(fallback)) {
              post = fallback.find(matchFn);
            }
          }
        } catch (err) {}
      }
    }

    // If no slug requested or no specific post found, default to first available article
    if (!post && Array.isArray(DEFAULT_BLOG_ARTICLES) && DEFAULT_BLOG_ARTICLES.length > 0) {
      post = DEFAULT_BLOG_ARTICLES[0];
    }

    if (!post) return;

    // Update document title & SEO
    document.title = `${post.title} | ProfileFolio`;

    // Update Header Pill
    const categoryPill = document.querySelector('.category-pill');
    if (categoryPill) {
      const rawTags = post.tags || post.category || 'Technical Engineering';
      categoryPill.textContent = Array.isArray(rawTags) ? rawTags.join(' • ') : String(rawTags);
    }

    // Update Title
    const titleEl = document.querySelector('.article-title');
    if (titleEl) {
      titleEl.textContent = post.title;
    }

    // Update Meta Bar
    const metaBar = document.querySelector('.article-meta-bar');
    if (metaBar) {
      const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      const dateVal = post.updatedAt || post.publishedAt || post.date;
      const formattedDate = dateVal
        ? new Date(dateVal).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'October 2026';

      metaBar.innerHTML = `
        <time datetime="${dateVal || ''}">${formattedDate}</time>
        <span>&bull;</span>
        <span>${minutes} min read</span>
        <span>&bull;</span>
        <span>${words} words</span>
        <span>&bull;</span>
        <span>By @${post.authorUsername || 'ssrnov'}</span>
      `;
    }

    // Update Body Content
    const bodyEl = document.querySelector('.article-body');
    if (bodyEl && post.content) {
      bodyEl.innerHTML = parseMarkdownToHTML(post.content);
    }

    // Update Tags in Footer
    const tagsContainer = document.querySelector('.article-footer .project-tags');
    if (tagsContainer) {
      const rawTags = post.tags || post.category;
      const tagList = Array.isArray(rawTags)
        ? rawTags
        : (typeof rawTags === 'string' ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : []);
      if (tagList.length > 0) {
        tagsContainer.innerHTML = tagList.map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join(' ');
      }
    }

  } catch (err) {
    console.warn('Error hydrating dynamic article:', err);
  }
});

function parseMarkdownToHTML(md) {
  if (!md) return '';

  // If already HTML (e.g. from static blog.json), wrap and return directly
  const trimmed = md.trim();
  if (trimmed.startsWith('<p>') || trimmed.startsWith('<div>') || (trimmed.includes('</p>') && !trimmed.includes('## '))) {
    return `<div class="parsed-markdown-content" style="line-height: 1.8; color: var(--text-secondary);">${md}</div>`;
  }

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: var(--text-lg); font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: var(--text-2xl); font-weight: 800; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: var(--text-3xl); font-weight: 900; margin-top: 2rem; margin-bottom: 1rem; color: var(--text-primary);">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent-primary); padding-left: 1rem; margin: 1.5rem 0; color: var(--text-secondary); font-style: italic; background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-sm);">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong style="color: var(--text-primary); font-weight: 700;">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em style="color: var(--text-secondary);">$1</em>');

  // Inline Code
  html = html.replace(/\`([^`]+)\`/gim, '<code style="font-family: var(--font-mono); font-size: 0.88em; background: #191A1A; border: 1px solid #292A2A; padding: 2px 6px; border-radius: 4px; color: var(--code-text);">$1</code>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.35rem; color: var(--text-secondary); list-style-type: disc;">$1</li>');

  // Paragraphs
  html = html.replace(/\n\s*\n/g, '</p><p style="line-height: 1.8; margin-bottom: 1.25rem; color: var(--text-secondary); font-size: var(--text-base);"><p>');

  return `<div class="parsed-markdown-content" style="line-height: 1.8; color: var(--text-secondary);">${html}</div>`;
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
