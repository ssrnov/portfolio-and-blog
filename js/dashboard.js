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
  calculateProfileCompletion
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

  // Load user data from user-scoped storage and backend
  const profile = getProfile();
  const education = getEducation();
  const skills = getSkills();
  const experiences = getExperiences();
  const publishSettings = getPublishSettings();

  // Populate UI
  updateDashboardUI(profile, publishSettings, education, skills, experiences);
  populateRecentProjects();
  populateRecentArticles();
  setupSignOut();
  setupCopyLink();
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

  // Calculate Real Profile Completion %
  const percentage = calculateProfileCompletion();
  const elPercentage = document.getElementById('completion-percentage');
  const elBar = document.getElementById('completion-progress-bar');
  if (elPercentage) elPercentage.textContent = `${percentage}%`;
  if (elBar) elBar.style.width = `${percentage}%`;

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

  // Update Dynamic Checklist Pills
  const pillBio = document.getElementById('pill-bio');
  if (pillBio) {
    const hasBio = Boolean(profile?.bio && profile.bio.length > 15);
    pillBio.innerHTML = hasBio ? '&check; Personal Bio' : '+ Add Bio';
    pillBio.style.color = hasBio ? 'var(--text-primary)' : 'var(--text-muted)';
  }

  const pillEdu = document.getElementById('pill-education');
  if (pillEdu) {
    const hasEdu = Boolean(education && education.length > 0);
    pillEdu.innerHTML = hasEdu ? `&check; Education (${education.length})` : '+ Add Education';
    pillEdu.style.color = hasEdu ? 'var(--text-primary)' : 'var(--text-muted)';
  }

  const pillSkills = document.getElementById('pill-skills');
  if (pillSkills) {
    const hasSkills = Boolean(skills && skills.length > 0);
    pillSkills.innerHTML = hasSkills ? `&check; Skills Matrix (${skills.length})` : '+ Add Skills';
    pillSkills.style.color = hasSkills ? 'var(--text-primary)' : 'var(--text-muted)';
  }

  const pillProj = document.getElementById('pill-projects');
  if (pillProj) {
    const projects = getProjects();
    const hasProj = Boolean(projects && projects.length > 0);
    pillProj.innerHTML = hasProj ? `&check; Featured Projects (${projects.length})` : '+ Add Projects';
    pillProj.style.color = hasProj ? 'var(--text-primary)' : 'var(--text-muted)';
  }

  const pillExp = document.getElementById('pill-experience');
  if (pillExp) {
    const hasExp = Boolean(experiences && experiences.length > 0);
    pillExp.innerHTML = hasExp ? `&check; Experience (${experiences.length})` : '+ Add Experience';
    pillExp.style.color = hasExp ? 'var(--text-primary)' : 'var(--text-muted)';
  }

  const pillSocial = document.getElementById('pill-social');
  if (pillSocial) {
    const hasSocial = Boolean(profile?.githubUrl || profile?.linkedinUrl || profile?.twitterUrl);
    pillSocial.innerHTML = hasSocial ? '&check; Social Profiles Connected' : '+ Connect Social Links';
    pillSocial.style.color = hasSocial ? 'var(--text-primary)' : 'var(--text-muted)';
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
