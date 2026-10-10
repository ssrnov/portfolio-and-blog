/**
 * Folioryn — Markdown Blog Engine & Parser
 * Converts markdown to semantic HTML with XSS sanitization, syntax formatting,
 * reading time calculation, and user-scoped draft & publish persistence.
 */

import { authService } from './supabase.js';
import { getBlogArticles, saveBlogArticles, getActiveUser } from './profile-data.js';

let articles = [];
let currentArticleIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  loadArticles();
  setupEditorListeners();
  renderArticlesList();
  if (articles.length > 0) {
    loadArticleIntoEditor(0);
  } else {
    resetEditorFields();
  }
});

function loadArticles() {
  articles = getBlogArticles();
}

function saveArticles() {
  saveBlogArticles(articles);
}

function resetEditorFields() {
  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const tagsInput = document.getElementById('post-tags');
  const excerptInput = document.getElementById('post-excerpt');
  const markdownTextarea = document.getElementById('post-markdown');
  const previewContainer = document.getElementById('markdown-preview-pane');
  const readingTimeEl = document.getElementById('reading-time-indicator');

  if (titleInput) titleInput.value = '';
  if (slugInput) slugInput.value = '';
  if (tagsInput) tagsInput.value = '';
  if (excerptInput) excerptInput.value = '';
  if (markdownTextarea) markdownTextarea.value = '';
  if (readingTimeEl) readingTimeEl.textContent = '0 min read • 0 words';
  if (previewContainer) {
    previewContainer.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Start typing markdown on the left...</p>';
  }
}

function setupEditorListeners() {
  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const markdownTextarea = document.getElementById('post-markdown');
  const publishBtn = document.getElementById('publish-post-btn');
  const draftBtn = document.getElementById('save-draft-btn');
  const deleteBtn = document.getElementById('delete-post-btn');
  const newPostBtn = document.getElementById('new-post-btn');

  // Live Auto Slug Generator from Title
  titleInput?.addEventListener('input', (e) => {
    if (!slugInput?.getAttribute('data-manual')) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    updateLivePreview();
    updateViewPublicLink();
  });

  slugInput?.addEventListener('input', () => {
    slugInput.setAttribute('data-manual', 'true');
    updateViewPublicLink();
  });

  // Markdown Textarea Live Preview & Reading Time
  markdownTextarea?.addEventListener('input', () => {
    updateLivePreview();
  });

  // Publish Button
  publishBtn?.addEventListener('click', () => {
    saveCurrentEditorState(true);
    publishBtn.textContent = '✓ Published!';
    setTimeout(() => {
      publishBtn.textContent = 'Publish Article';
    }, 2000);
    renderArticlesList();
    updateViewPublicLink();
  });

  // Save Draft Button
  draftBtn?.addEventListener('click', () => {
    saveCurrentEditorState(false);
    draftBtn.textContent = '✓ Saved Draft!';
    setTimeout(() => {
      draftBtn.textContent = 'Save Draft';
    }, 2000);
    renderArticlesList();
    updateViewPublicLink();
  });

  // Delete Article Button
  deleteBtn?.addEventListener('click', () => {
    if (!articles[currentArticleIndex]) return;
    const title = articles[currentArticleIndex].title || 'this article';
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      articles.splice(currentArticleIndex, 1);
      currentArticleIndex = 0;
      saveArticles();
      renderArticlesList();
      if (articles.length > 0) {
        loadArticleIntoEditor(0);
      } else {
        resetEditorFields();
      }
    }
  });

  // New Post Button
  newPostBtn?.addEventListener('click', () => {
    saveCurrentEditorState();
    const newPost = {
      id: 'post_' + Date.now(),
      title: 'New Technical Article',
      slug: 'new-technical-article-' + Math.floor(Math.random() * 1000),
      tags: 'Engineering',
      excerpt: 'Brief overview of this technical post.',
      content: '# New Technical Article\n\nWrite your markdown content here...',
      isPublished: false,
      updatedAt: new Date().toISOString(),
    };
    articles.unshift(newPost);
    currentArticleIndex = 0;
    saveArticles();
    renderArticlesList();
    loadArticleIntoEditor(0);
  });
}

function saveCurrentEditorState(publishOverride) {
  const title = document.getElementById('post-title')?.value.trim() || 'Untitled';
  const slug = document.getElementById('post-slug')?.value.trim() || 'untitled';
  const tags = document.getElementById('post-tags')?.value.trim() || '';
  const excerpt = document.getElementById('post-excerpt')?.value.trim() || '';
  const content = document.getElementById('post-markdown')?.value || '';

  if (!articles[currentArticleIndex]) {
    // If no articles exist yet, create one
    if (!title && !content) return;
    const newPost = {
      id: 'post_' + Date.now(),
      title: title || 'New Technical Article',
      slug: slug || 'new-article',
      tags,
      excerpt,
      content,
      isPublished: Boolean(publishOverride),
      updatedAt: new Date().toISOString()
    };
    articles.push(newPost);
    currentArticleIndex = 0;
    saveArticles();
    return;
  }

  const isPublished = publishOverride !== undefined 
    ? publishOverride 
    : articles[currentArticleIndex].isPublished;

  articles[currentArticleIndex] = {
    ...articles[currentArticleIndex],
    title,
    slug,
    tags,
    excerpt,
    content,
    isPublished,
    updatedAt: new Date().toISOString(),
  };

  saveArticles();
}

function loadArticleIntoEditor(index) {
  currentArticleIndex = index;
  const post = articles[index];
  if (!post) {
    resetEditorFields();
    return;
  }

  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const tagsInput = document.getElementById('post-tags');
  const excerptInput = document.getElementById('post-excerpt');
  const markdownTextarea = document.getElementById('post-markdown');

  if (titleInput) titleInput.value = post.title;
  if (slugInput) {
    slugInput.value = post.slug;
    slugInput.removeAttribute('data-manual');
  }
  if (tagsInput) tagsInput.value = post.tags;
  if (excerptInput) excerptInput.value = post.excerpt;
  if (markdownTextarea) markdownTextarea.value = post.content;

  updateLivePreview();
  updateViewPublicLink();
}

function updateViewPublicLink() {
  const post = articles[currentArticleIndex];
  const viewLink = document.getElementById('view-public-post-btn');
  if (viewLink && post) {
    viewLink.href = `/blog/sample-article/?slug=${encodeURIComponent(post.slug)}`;
  }
}

function updateLivePreview() {
  const content = document.getElementById('post-markdown')?.value || '';
  const previewContainer = document.getElementById('markdown-preview-pane');
  const readingTimeEl = document.getElementById('reading-time-indicator');

  // Calculate reading time (200 words/min average)
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  if (readingTimeEl) {
    readingTimeEl.textContent = `${minutes} min read • ${words} words`;
  }

  if (previewContainer) {
    previewContainer.innerHTML = parseMarkdownToHTML(content);
  }
}

function renderArticlesList() {
  const listContainer = document.getElementById('articles-nav-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (articles.length === 0) {
    listContainer.innerHTML = `
      <div style="padding: var(--space-6); text-align: center; color: var(--text-muted); font-size: 11px;">
        No articles drafted yet.<br/><span style="color: var(--text-secondary); margin-top: 4px; display: inline-block;">Click <strong>+ New Article</strong> to write your first post.</span>
      </div>
    `;
    return;
  }

  articles.forEach((art, idx) => {
    const item = document.createElement('div');
    item.className = `article-list-item ${idx === currentArticleIndex ? 'active' : ''}`;
    item.style.padding = 'var(--space-3)';
    item.style.border = '1px solid var(--border-color)';
    item.style.borderRadius = 'var(--radius-sm)';
    item.style.marginBottom = 'var(--space-2)';
    item.style.cursor = 'pointer';
    item.style.backgroundColor = idx === currentArticleIndex ? 'var(--bg-secondary)' : 'transparent';

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <strong style="font-size: var(--text-xs); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${escapeHtml(art.title)}</strong>
        <span class="badge" style="font-size: 9px; flex-shrink: 0; ${art.isPublished ? 'color: #22c55e;' : 'color: var(--text-muted);'}">
          ${art.isPublished ? '✓ Published' : 'Draft'}
        </span>
      </div>
      <p style="font-size: 11px; color: var(--text-muted); margin: 0; font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        /blog/${escapeHtml(art.slug)}
      </p>
    `;

    item.addEventListener('click', () => {
      saveCurrentEditorState();
      document.querySelectorAll('.article-list-item').forEach((el) => {
        el.style.backgroundColor = 'transparent';
      });
      item.style.backgroundColor = 'var(--bg-secondary)';
      loadArticleIntoEditor(idx);
    });

    listContainer.appendChild(item);
  });
}

function parseMarkdownToHTML(md) {
  if (!md) return '<p style="color: var(--text-muted); font-style: italic;">Start typing markdown on the left...</p>';

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: var(--text-base); font-weight: 700; margin-top: 1rem; color: var(--text-primary);">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: var(--text-lg); font-weight: 800; margin-top: 1.25rem; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 4px;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: var(--text-xl); font-weight: 900; margin-top: 1.5rem; color: var(--text-primary);">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 2px solid var(--accent-primary); padding-left: 8px; margin: 1rem 0; color: var(--text-secondary); font-style: italic; background: var(--bg-surface); padding: 8px 12px; border-radius: var(--radius-sm);">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong style="color: var(--text-primary); font-weight: 700;">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em style="color: var(--text-secondary);">$1</em>');

  // Code blocks & inline code
  html = html.replace(/\`\`\`(\w+)?\n([\s\S]*?)\`\`\`/gim, '<pre style="background: #191A1A; border: 1px solid #292A2A; padding: 10px; border-radius: 4px; overflow-x: auto; font-family: var(--font-mono); font-size: 11px; margin: 10px 0;"><code style="color: var(--code-text);">$2</code></pre>');
  html = html.replace(/\`([^`]+)\`/gim, '<code style="font-family: var(--font-mono); font-size: 0.9em; background: #191A1A; border: 1px solid #292A2A; padding: 2px 4px; border-radius: 3px; color: var(--code-text);">$1</code>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 1rem; color: var(--text-secondary);">$1</li>');

  // Paragraphs
  html = html.replace(/\n\s*\n/g, '</p><p style="line-height: 1.6; margin-bottom: 0.75rem; color: var(--text-secondary);"><p>');

  return `<div style="line-height: 1.6; color: var(--text-secondary);">${html}</div>`;
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
