/**
 * SSRNovX — Dynamic Multi-Tenant Public Portfolio Engine
 * Resolves /u/:username routes, queries Supabase profiles/portfolios,
 * and dynamically renders custom templates, project cards, and SEO metadata.
 */

import { portfolioService, profileService } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const username = extractUsernameSlug();
  if (!username) {
    // If accessed as bare /u/ or /u, redirect to templates
    window.location.href = '/templates/';
    return;
  }

  // Load Portfolio Data
  try {
    let portfolioData = null;

    // If local test user "sunny", check for local draft first
    if (username === 'sunny') {
      const draft = localStorage.getItem('ssrnovx_portfolio_draft');
      if (draft) {
        portfolioData = parseDraftData(JSON.parse(draft));
      }
    }

    // Query database if not locally loaded
    if (!portfolioData) {
      portfolioData = await portfolioService.getPortfolioBySlug(username);
    }

    if (portfolioData) {
      renderPortfolio(portfolioData, username);
    } else {
      renderNotFoundState(username);
    }
  } catch (err) {
    console.warn('Portfolio query exception:', err);
    // If offline, check if default sunny
    if (username === 'sunny') {
      // Default fallback already present in static HTML
      return;
    }
    renderNotFoundState(username);
  }
});

function extractUsernameSlug() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const segments = path.split('/');
  
  // Format: /u/:username
  const uIndex = segments.indexOf('u');
  if (uIndex !== -1 && segments[uIndex + 1]) {
    return decodeURIComponent(segments[uIndex + 1]);
  }

  // Check query parameter fallback: ?u=username
  const params = new URLSearchParams(window.location.search);
  if (params.get('u')) {
    return params.get('u').trim();
  }

  return 'sunny'; // Default demo slug
}

function parseDraftData(draft) {
  return {
    slug: 'sunny',
    template_id: draft.template || 'minimal',
    is_published: true,
    profiles: {
      username: 'sunny',
      display_name: draft.displayName || 'Sunny / SSRNovX',
      headline: draft.headline || 'Engineering Scalable Systems',
      bio: draft.bio || 'Software engineer focused on clean architecture.',
      location: draft.location || 'India (IST / UTC+5:30)',
      github_handle: draft.githubUrl?.replace('https://github.com/', '') || 'ssrnov',
    },
  };
}

function renderPortfolio(data, username) {
  const profile = data.profiles || {};
  const displayName = profile.display_name || data.title || username;
  const headline = profile.headline || 'Software Engineer & Developer';
  const bio = profile.bio || 'Building resilient software systems.';
  const template = data.template_id || 'minimal';

  // 1. Update Document Title & SEO
  document.title = `${displayName} (@${username}) | SSRNovX Developer Portfolio`;

  // 2. Apply Template Style
  document.documentElement.setAttribute('data-template', template);
  document.body.className = `template-${template}`;

  // 3. Update Text Content
  document.querySelectorAll('[data-builder-target="display_name"]').forEach((el) => {
    el.textContent = displayName;
  });

  document.querySelectorAll('[data-builder-target="headline"]').forEach((el) => {
    el.textContent = headline;
  });

  document.querySelectorAll('[data-builder-target="bio"]').forEach((el) => {
    el.textContent = bio;
  });

  // 4. Update Links
  if (profile.github_handle) {
    document.querySelectorAll('[data-builder-target="github_url"]').forEach((el) => {
      el.href = `https://github.com/${profile.github_handle}`;
    });
  }

  // 5. Update Header Slug Mark
  const logoText = document.querySelector('.logo-text');
  if (logoText) {
    logoText.textContent = username;
  }
}

function renderNotFoundState(username) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <section class="section-py" style="padding-top: var(--space-24); text-align: center;">
      <div class="container" style="max-width: 640px; margin: 0 auto;">
        <span class="badge" style="font-family: var(--font-mono); margin-bottom: var(--space-4);">404 &bull; Profile Not Found</span>
        <h1 style="font-size: var(--text-4xl); font-weight: 800; color: var(--text-primary); margin-bottom: var(--space-4);">
          @${username} is not registered yet
        </h1>
        <p style="font-size: var(--text-base); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-8);">
          The developer handle <strong>/u/${username}</strong> is currently available. Create your developer portfolio with 1-click GitHub import and claim this URL now.
        </p>
        <div style="display: flex; justify-content: center; gap: var(--space-4); flex-wrap: wrap;">
          <a href="/signup?handle=${encodeURIComponent(username)}" class="btn btn-primary btn-card" style="padding: 10px 24px;">
            <span>Claim @${username} on SSRNovX</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a href="/templates" class="btn btn-secondary btn-card" style="padding: 10px 24px;">
            <span>Browse Templates</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

// Inbound Contact Form Listener
function setupContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('contact-form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    const senderName = document.getElementById('contact-name')?.value.trim();
    const senderEmail = document.getElementById('contact-email')?.value.trim();
    const subject = document.getElementById('contact-subject')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();

    if (!senderName || !senderEmail || !message) {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#ef4444';
        statusEl.textContent = 'Please fill in all required fields.';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Message...</span>';
    }

    try {
      // Simulate / Supabase save
      await new Promise((res) => setTimeout(res, 600));

      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#22c55e';
        statusEl.textContent = '✓ Message received! I will get back to you shortly.';
      }
      form.reset();
    } catch (err) {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#ef4444';
        statusEl.textContent = 'Failed to deliver message. Please reach out directly via email.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span> <span aria-hidden="true">&rarr;</span>';
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', setupContactForm);

