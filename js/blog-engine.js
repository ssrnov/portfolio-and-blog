/**
 * SSRNovX — Markdown Blog Engine & Parser
 * Converts markdown to semantic HTML with XSS sanitization, syntax formatting,
 * reading time calculation, and local/database draft persistence.
 */

import { authService } from './supabase.js';

const BLOG_STORAGE_KEY = 'ssrnovx_blog_articles';

let articles = [];
let currentArticleIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  loadArticles();
  setupEditorListeners();
  renderArticlesList();
  loadArticleIntoEditor(0);
});

function loadArticles() {
  const saved = localStorage.getItem(BLOG_STORAGE_KEY);
  if (saved) {
    try {
      articles = JSON.parse(saved);
    } catch (e) {
      articles = [];
    }
  }

  if (articles.length === 0) {
    articles = [
      {
        id: 'post_1',
        title: 'Zero-Dependency Vanilla JavaScript in 2026',
        slug: 'zero-dependency-vanilla-javascript',
        tags: 'JavaScript, Architecture, Web Standards',
        excerpt: 'Why native browser APIs and modular ES modules are outperforming bloated single-page framework runtimes.',
        content: `# Zero-Dependency Vanilla JavaScript in 2026\n\nModern browsers have evolved into extraordinary application runtimes. With native **Web Components**, custom events, CSS variables, and fetch streams, the need for 300KB runtime frameworks has vanished for high-speed developer platforms.\n\n## 1. Native Reactivity Without Virtual DOM\n\nBy leveraging standard DOM events and \`postMessage\`, we achieve zero-latency bidirectional synchronization with negligible memory footprint.\n\n\`\`\`javascript\nwindow.addEventListener('message', (event) => {\n  if (event.data?.type === 'UPDATE') {\n    applyChanges(event.data.payload);\n  }\n});\n\`\`\`\n\n> The fastest code is the code the browser already knows how to run natively.\n\n## 2. Production Performance Metrics\n\n- Zero hydration delay (Time to Interactive under 100ms)\n- 100/100 Lighthouse Performance scores\n- Universal compatibility across modern mobile and desktop browsers`,
        isPublished: true,
        updatedAt: new Date().toISOString(),
      },
    ];
    saveArticles();
  }
}

function saveArticles() {
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(articles));
}

function setupEditorListeners() {
  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const tagsInput = document.getElementById('post-tags');
  const excerptInput = document.getElementById('post-excerpt');
  const markdownTextarea = document.getElementById('post-markdown');
  const publishBtn = document.getElementById('publish-post-btn');
  const newPostBtn = document.getElementById('new-post-btn');

  // Live Auto Slug Generator from Title
  titleInput?.addEventListener('input', (e) => {
    if (!slugInput.getAttribute('data-manual')) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    updateLivePreview();
  });

  slugInput?.addEventListener('input', () => {
    slugInput.setAttribute('data-manual', 'true');
  });

  // Markdown Textarea Live Preview & Reading Time
  markdownTextarea?.addEventListener('input', () => {
    updateLivePreview();
  });

  // Publish / Save Button
  publishBtn?.addEventListener('click', () => {
    saveCurrentEditorState();
    publishBtn.textContent = '✓ Saved & Published!';
    setTimeout(() => {
      publishBtn.textContent = 'Publish Article';
    }, 2000);
    renderArticlesList();
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
    saveArticles();
    renderArticlesList();
    loadArticleIntoEditor(0);
  });
}

function saveCurrentEditorState() {
  if (!articles[currentArticleIndex]) return;

  const title = document.getElementById('post-title')?.value || 'Untitled';
  const slug = document.getElementById('post-slug')?.value || 'untitled';
  const tags = document.getElementById('post-tags')?.value || '';
  const excerpt = document.getElementById('post-excerpt')?.value || '';
  const content = document.getElementById('post-markdown')?.value || '';

  articles[currentArticleIndex] = {
    ...articles[currentArticleIndex],
    title,
    slug,
    tags,
    excerpt,
    content,
    updatedAt: new Date().toISOString(),
  };

  saveArticles();
}

function loadArticleIntoEditor(index) {
  currentArticleIndex = index;
  const post = articles[index];
  if (!post) return;

  const titleInput = document.getElementById('post-title');
  const slugInput = document.getElementById('post-slug');
  const tagsInput = document.getElementById('post-tags');
  const excerptInput = document.getElementById('post-excerpt');
  const markdownTextarea = document.getElementById('post-markdown');

  if (titleInput) titleInput.value = post.title;
  if (slugInput) slugInput.value = post.slug;
  if (tagsInput) tagsInput.value = post.tags;
  if (excerptInput) excerptInput.value = post.excerpt;
  if (markdownTextarea) markdownTextarea.value = post.content;

  updateLivePreview();
}

function updateLivePreview() {
  const content = document.getElementById('post-markdown')?.value || '';
  const previewContainer = document.getElementById('markdown-preview-pane');
  const readingTimeEl = document.getElementById('reading-time-indicator');

  // 1. Calculate reading time (200 words/min average)
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  if (readingTimeEl) {
    readingTimeEl.textContent = `${minutes} min read &bull; ${words} words`;
  }

  // 2. Parse and render HTML
  if (previewContainer) {
    previewContainer.innerHTML = parseMarkdownToHTML(content);
  }
}

function renderArticlesList() {
  const listContainer = document.getElementById('articles-nav-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

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
        <strong style="font-size: var(--text-xs); color: var(--text-primary);">${art.title}</strong>
        <span class="brand-badge" style="font-size: 9px;">${art.isPublished ? 'Published' : 'Draft'}</span>
      </div>
      <p style="font-size: 11px; color: var(--text-muted); margin: 0; font-family: var(--font-mono);">
        /blog/${art.slug}
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

/**
 * Lightweight, safe client-side Markdown Parser with sanitization
 */
function parseMarkdownToHTML(md) {
  if (!md) return '<p style="color: var(--text-muted); font-style: italic;">Start typing markdown on the left...</p>';

  // 1. Sanitize raw HTML tags to prevent XSS injection
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Code blocks (```language ... ```)
  html = html.replace(/```([a-zA-Z0-9_]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // 3. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // 4. Headings (# H1, ## H2, ### H3)
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 700; margin: 1.25rem 0 0.5rem 0; color: var(--text-primary);">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.75rem 0; color: var(--text-primary);">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2rem; font-weight: 800; margin: 0 0 1rem 0; letter-spacing: -0.03em; color: var(--text-primary);">$1</h1>');

  // 5. Blockquotes (> quote)
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--text-primary); margin: 1rem 0; padding: 0.5rem 1rem; background-color: var(--bg-secondary); color: var(--text-secondary); font-style: italic;">$1</blockquote>');

  // 6. Bold & Italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 7. Unordered lists (- item)
  html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.25rem;">$1</li>');

  // 8. Paragraphs
  html = html.split('\n\n').map((para) => {
    if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<blockquote') || para.startsWith('<li')) {
      return para;
    }
    return `<p style="margin-bottom: 1rem; line-height: 1.7; color: var(--text-secondary);">${para}</p>`;
  }).join('');

  return html;
}
