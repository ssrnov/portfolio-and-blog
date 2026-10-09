/**
 * SSRNovX — Studio Dashboard Controller
 * Synchronizes user authentication session, profile data, and studio metrics.
 */

import { authService, profileService, portfolioService } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  let activeUser = null;

  try {
    const session = await authService.getSession();
    if (!session || !session.user) {
      // Redirect to login if unauthenticated
      window.location.href = '/login/';
      return;
    }
    activeUser = session.user;
  } catch (err) {
    console.error('Session retrieval error:', err);
    window.location.href = '/login/';
    return;
  }

  // Load Profile and Portfolio
  try {
    const profile = await profileService.getProfile(activeUser.id);
    const portfolio = await portfolioService.getUserPortfolio(activeUser.id);
    updateDashboardUI(profile || activeUser, portfolio);
  } catch (err) {
    console.warn('Dashboard data fetch fallback:', err);
    updateDashboardUI(activeUser, null);
  }

  // Wire Sidebar Sign Out Button
  setupSignOut();

  // Wire Share / Copy Link Button
  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const slug = copyBtn.getAttribute('data-slug') || 'sunny';
      const fullUrl = `${window.location.origin}/u/${slug}`;
      navigator.clipboard?.writeText(fullUrl);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Link';
      }, 2000);
    });
  }
});

function updateDashboardUI(user, portfolio) {
  const username = user?.username || 'sunny';
  const displayName = user?.display_name || user?.user_metadata?.full_name || 'Sunny / SSRNovX';
  const initial = displayName.charAt(0).toUpperCase() || 'S';

  // Sidebar User Snippet
  const userAvatar = document.querySelector('.user-avatar-small');
  if (userAvatar) userAvatar.textContent = initial;

  const userInfoH4 = document.querySelector('.user-info-text h4');
  if (userInfoH4) userInfoH4.textContent = displayName;

  const userInfoP = document.querySelector('.user-info-text p');
  if (userInfoP) userInfoP.textContent = `/u/${username}`;

  // Overview Header Greeting
  const greetingH1 = document.querySelector('.dashboard-main h1');
  if (greetingH1 && displayName) {
    greetingH1.textContent = `Welcome back, ${displayName.split(' ')[0]}`;
  }

  // Public Link in Overview Card
  const liveUrlText = document.querySelector('.active-portfolio-card strong');
  if (liveUrlText && username) {
    liveUrlText.textContent = `ssrnovx.dev/u/${username}`;
  }

  const liveLinkAnchor = document.querySelector('.active-portfolio-card a[target="_blank"]');
  if (liveLinkAnchor && username) {
    liveLinkAnchor.href = `/u/${username}`;
  }

  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn && username) {
    copyBtn.setAttribute('data-slug', username);
  }
}

function setupSignOut() {
  const sidebarFooter = document.querySelector('.sidebar-footer');
  if (sidebarFooter && !document.getElementById('signout-btn')) {
    const signOutBtn = document.createElement('button');
    signOutBtn.id = 'signout-btn';
    signOutBtn.type = 'button';
    signOutBtn.className = 'btn btn-secondary';
    signOutBtn.style.width = '100%';
    signOutBtn.style.marginTop = 'var(--space-3)';
    signOutBtn.style.fontSize = '11px';
    signOutBtn.style.padding = '4px 8px';
    signOutBtn.innerHTML = '<span>Sign Out</span>';

    signOutBtn.addEventListener('click', async () => {
      try {
        signOutBtn.disabled = true;
        signOutBtn.textContent = 'Signing out...';
        await authService.signOut();
      } catch (err) {
        console.error('Logout error:', err);
        window.location.href = '/login/';
      }
    });

    sidebarFooter.appendChild(signOutBtn);
  }
}
