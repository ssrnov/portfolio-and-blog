/**
 * ProfileFolio — Dashboard Overview Controller
 * Synchronizes user authentication session, calculates real profile completion %,
 * loads recent projects & blog articles, handles link copy, and manages publishing status.
 */

import { authService, profileService, portfolioService } from './supabase.js';
import {
  getProfile,
  getEducation,
  getSkills,
  getExperiences,
  getProjects,
  getPublishSettings,
  getBlogArticles,
  calculateProfileCompletion,
  getProfileCompletionDetails,
  duplicatePortfolio,
  getContactMessages,
  deleteContactMessage,
  markContactMessageRead
} from './profile-data.js';

document.addEventListener('DOMContentLoaded', async () => {
  let activeUser = null;

  try {
    const session = await authService.getSession();
    if (session && session.user) {
      activeUser = session.user;
    }
  } catch (err) {
    console.warn('Session check in dashboard:', err);
  }

  // Strictly block entry if not logged in
  if (!activeUser) {
    const target = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login/?redirect=${target}&auth=required`);
    return;
  }

  // Load user data from user-scoped storage and backend
  const profile = getProfile();
  const education = getEducation();
  const skills = getSkills();
  const experiences = getExperiences();
  const publishSettings = getPublishSettings();

  // Populate UI
  updateDashboardUI(profile, publishSettings, education, skills, experiences);
  populateInboundMessages();
  populateRecentProjects();
  populateRecentArticles();
  setupInboundMessages();
  setupSignOut();
  setupCopyLink();
  setupDuplicatePortfolio();
});


function updateDashboardUI(profile, publishSettings, education, skills, experiences) {
  const username = profile?.username || 'sunny';
  const fullName = profile?.fullName || profile?.display_name || 'Sunny';
  const initial = fullName.charAt(0).toUpperCase() || 'P';

  // Sidebar User Information
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar) sidebarAvatar.textContent = initial;

  const sidebarDisplayName = document.getElementById('sidebar-display-name');
  if (sidebarDisplayName) sidebarDisplayName.textContent = fullName;

  const sidebarUsernameHandle = document.getElementById('sidebar-username-handle');
  if (sidebarUsernameHandle) sidebarUsernameHandle.textContent = `/u/${username}`;

  // Welcome Greeting
  const welcomeGreeting = document.getElementById('welcome-greeting');
  if (welcomeGreeting) {
    welcomeGreeting.textContent = `Welcome back, ${fullName.split(' ')[0]}`;
  }

  // Calculate Real Profile Completion % & Actionable Suggestions (Feature 8)
  const completionDetails = getProfileCompletionDetails();
  const percentage = completionDetails.percentage;
  const elPercentage = document.getElementById('completion-percentage');
  const elBar = document.getElementById('completion-progress-bar');
  if (elPercentage) elPercentage.textContent = `${percentage}%`;
  if (elBar) elBar.style.width = `${percentage}%`;

  // Render Actionable Suggestions with Section Jump Links
  const checklistContainer = document.getElementById('dashboard-checklist-container');
  if (checklistContainer) {
    checklistContainer.innerHTML = completionDetails.suggestions.map(s => `
      <a href="${s.link}" class="badge" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: var(--radius-sm); border: 1px solid ${s.done ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-color)'}; background: ${s.done ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-secondary)'}; color: ${s.done ? '#22c55e' : 'var(--text-secondary)'};" title="Click to complete this section">
        <span>${s.done ? '✓' : '+'}</span>
        <span>${escapeHtml(s.title)}</span>
      </a>
    `).join('');
  }

  // Publish Status
  const isPublished = publishSettings?.isPublished !== false;
  const statusBadge = document.getElementById('live-publish-status-badge');
  const statusText = document.getElementById('live-publish-status-text');
  if (statusText) {
    statusText.textContent = isPublished ? 'Published & Live' : 'Draft Mode (Unpublished)';
  }
  if (statusBadge) {
    const dot = statusBadge.querySelector('.pulse-dot');
    if (dot) dot.style.backgroundColor = isPublished ? '#22c55e' : '#eab308';
  }

  // Template Tag
  const templateTag = document.getElementById('current-template-tag');
  if (templateTag && publishSettings?.templateId) {
    const formatted = publishSettings.templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    templateTag.textContent = `Template: ${formatted}`;
  }

  // Portfolio Title
  const portTitle = document.getElementById('portfolio-title-display');
  if (portTitle) {
    const headline = profile?.headline || 'Software Engineer Portfolio';
    portTitle.textContent = `${fullName} — ${headline}`;
  }

  // Public Links
  const publicLink = document.getElementById('public-portfolio-link');
  if (publicLink) {
    publicLink.textContent = `folioryn.dev/u/${username} ↗`;
    publicLink.href = `/u/${username}`;
  }

  const viewLiveBtn = document.getElementById('view-live-action-btn');
  if (viewLiveBtn) {
    viewLiveBtn.href = `/u/${username}`;
  }

  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.setAttribute('data-slug', username);
  }

  // Update Dynamic Activity Items
  const act1 = document.getElementById('activity-item-1');
  if (act1) {
    act1.innerHTML = `&bull; Profile published live to <a href="/u/${username}" target="_blank" style="color: var(--text-primary); text-decoration: underline;">/u/${username}</a>`;
  }

  const act2 = document.getElementById('activity-item-2');
  if (act2) {
    if (education && education.length > 0) {
      const topEdu = education[0];
      act2.textContent = `• Academic record saved: ${topEdu.institution} ${topEdu.gradeValue ? `• ${topEdu.gradeType || 'CGPA'} ${topEdu.gradeValue}` : ''}`;
    } else {
      act2.textContent = `• Active session established for @${username}`;
    }
  }
}

function populateRecentProjects() {
  const container = document.getElementById('dashboard-recent-projects-list');
  if (!container) return;

  const projects = getProjects();

  if (projects.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-4); color: var(--text-muted); font-size: 11px;">
        No projects showcased yet. <a href="/dashboard/projects/" style="color: var(--text-primary); text-decoration: underline;">Add your first project</a>.
      </div>
    `;
    return;
  }

  container.innerHTML = projects.slice(0, 3).map(p => `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
      <div style="min-width: 0;">
        <h4 style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.title)}</h4>
        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.description || '')}</p>
      </div>
      <a href="/dashboard/projects/" class="btn btn-secondary btn-sm" style="font-size: 10px; padding: 4px 8px; flex-shrink: 0;">Edit</a>
    </div>
  `).join('');
}

function populateRecentArticles() {
  const container = document.getElementById('dashboard-recent-articles-list');
  if (!container) return;

  const articles = getBlogArticles();

  if (articles.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-4); color: var(--text-muted); font-size: 11px;">
        No articles drafted yet. <a href="/dashboard/blog/" style="color: var(--text-primary); text-decoration: underline;">Write an article</a>.
      </div>
    `;
    return;
  }

  container.innerHTML = articles.slice(0, 3).map(a => `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
      <div style="min-width: 0;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
          <h4 style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(a.title)}</h4>
          <span class="badge" style="font-size: 9px; padding: 1px 6px; flex-shrink: 0; ${a.isPublished ? 'color: #22c55e;' : ''}">${a.isPublished ? 'Published' : 'Draft'}</span>
        </div>
        <p style="font-size: 11px; color: var(--text-muted); margin: 0; font-family: var(--font-mono);">/blog/${escapeHtml(a.slug)}</p>
      </div>
      <a href="/dashboard/blog/" class="btn btn-secondary btn-sm" style="font-size: 10px; padding: 4px 8px; flex-shrink: 0;">Manage</a>
    </div>
  `).join('');
}

function setupSignOut() {
  const btn = document.getElementById('signout-btn');
  btn?.addEventListener('click', async () => {
    try {
      await authService.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    window.location.href = '/login/';
  });
}

function setupCopyLink() {
  const copyBtn = document.getElementById('copy-link-btn');
  copyBtn?.addEventListener('click', () => {
    const slug = copyBtn.getAttribute('data-slug') || 'sunny';
    const fullUrl = `${window.location.origin}/u/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Link';
        }, 2000);
      });
    }
  });
}

function setupDuplicatePortfolio() {
  const dupBtn = document.getElementById('duplicate-portfolio-btn');
  if (!dupBtn) return;

  dupBtn.addEventListener('click', async () => {
    const confirmed = window.confirm(
      'Duplicate Portfolio: This will create an independent editable draft copy with a unique URL slug. Proceed?'
    );
    if (!confirmed) return;

    dupBtn.disabled = true;
    dupBtn.textContent = 'Duplicating...';

    try {
      const result = duplicatePortfolio();
      alert(`✓ Portfolio successfully duplicated!\n\nNew Draft Copy: /u/${result.slug}\nTitle: ${result.title}`);
      window.location.reload();
    } catch (err) {
      console.error('Portfolio duplication error:', err);
      alert(err.message || 'Could not duplicate portfolio.');
    } finally {
      dupBtn.disabled = false;
      dupBtn.textContent = 'Duplicate';
    }
  });
}

export function populateInboundMessages() {
  const container = document.getElementById('dashboard-inbound-messages-list');
  const badge = document.getElementById('dashboard-inbound-unread-badge');
  if (!container) return;

  const messages = getContactMessages();
  const unreadCount = messages.filter(m => !m.is_read).length;

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = `${unreadCount} New`;
      badge.style.display = 'inline-flex';
      badge.style.background = 'rgba(34, 197, 94, 0.15)';
      badge.style.color = '#22c55e';
      badge.style.borderColor = 'rgba(34, 197, 94, 0.4)';
    } else {
      badge.textContent = `${messages.length} Inquiries`;
      badge.style.background = 'var(--bg-secondary)';
      badge.style.color = 'var(--text-muted)';
      badge.style.borderColor = 'var(--border-color)';
    }
  }

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="padding: var(--space-8); border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); background: var(--bg-surface);">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: var(--text-secondary); font-size: var(--text-sm);">No inbound inquiries received yet</p>
        <span style="font-size: 11px; font-family: var(--font-mono);">When visitors submit the "Get In Touch" form on your public portfolio, their messages and project proposals will appear here in real time.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(msg => {
    const isUnread = !msg.is_read;
    const initial = (msg.sender_name || 'U').charAt(0).toUpperCase();
    const dateFormatted = msg.created_at ? new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';
    const replySubject = encodeURIComponent(`Re: ${msg.subject || 'Portfolio Inquiry'}`);
    const mailtoUrl = `mailto:${encodeURIComponent(msg.sender_email)}?subject=${replySubject}`;

    return `
      <div class="inbound-msg-card" data-msg-id="${escapeHtml(msg.id)}" style="background: ${isUnread ? 'var(--bg-surface)' : 'var(--bg-secondary)'}; border: 1px solid ${isUnread ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-color)'}; border-left: 4px solid ${isUnread ? '#22c55e' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); transition: all var(--transition-fast);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-primary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary); font-size: 12px; flex-shrink: 0;">
              ${escapeHtml(initial)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <strong style="font-size: var(--text-sm); color: var(--text-primary); font-weight: 700;">${escapeHtml(msg.sender_name)}</strong>
                ${isUnread ? '<span class="badge" style="font-size: 9px; padding: 1px 6px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border-color: rgba(34, 197, 94, 0.3);">New</span>' : ''}
              </div>
              <a href="mailto:${escapeHtml(msg.sender_email)}" style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-primary); text-decoration: underline;">
                ${escapeHtml(msg.sender_email)}
              </a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);">${escapeHtml(dateFormatted)}</span>
            <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="font-size: 10px; padding: 3px 8px; text-decoration: none;">
              Reply &nearr;
            </a>
            <button type="button" class="btn btn-secondary btn-sm toggle-read-btn" data-id="${escapeHtml(msg.id)}" data-current-read="${msg.is_read ? 'true' : 'false'}" style="font-size: 10px; padding: 3px 8px;">
              ${msg.is_read ? 'Mark Unread' : 'Mark Read'}
            </button>
            <button type="button" class="btn btn-secondary btn-sm delete-inbound-btn" data-id="${escapeHtml(msg.id)}" style="font-size: 10px; padding: 3px 8px; color: #ef4444;" title="Delete message">
              &times;
            </button>
          </div>
        </div>

        <div>
          <div style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            Subject: ${escapeHtml(msg.subject || 'Portfolio Inquiry')}
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; background: var(--bg-primary); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); white-space: pre-wrap;">
${escapeHtml(msg.message)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Wire up action buttons
  container.querySelectorAll('.toggle-read-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const isRead = btn.getAttribute('data-current-read') === 'true';
      markContactMessageRead(id, !isRead);
      populateInboundMessages();
    });
  });

  container.querySelectorAll('.delete-inbound-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (window.confirm('Delete this inquiry message?')) {
        deleteContactMessage(id);
        populateInboundMessages();
      }
    });
  });
}

function setupInboundMessages() {
  const refreshBtn = document.getElementById('dashboard-refresh-messages-btn');
  refreshBtn?.addEventListener('click', () => {
    populateInboundMessages();
  });

  // Cross-tab real-time sync when a contact form is submitted in another tab
  window.addEventListener('storage', (e) => {
    if (e.key && (e.key.includes('_messages') || e.key === 'profilefolio_contact_messages')) {
      populateInboundMessages();
    }
  });
}

function escapeHtml(str) {

  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
