/**
 * ProfileFolio — Privacy-Conscious Portfolio Analytics Controller
 * Handles honest visitor telemetry, privacy-safe referrer tracking,
 * and clean empty states for new and published accounts.
 */

import { getAnalytics, getProfile } from './profile-data.js';

document.addEventListener('DOMContentLoaded', () => {
  renderAnalyticsDashboard();
});

function renderAnalyticsDashboard() {
  const data = getAnalytics();
  const profile = getProfile();
  const username = profile?.username || 'sunny';

  // Metric KPI Cards
  const totalViewsEl = document.getElementById('metric-total-views');
  const uniqueRefEl = document.getElementById('metric-unique-ref');
  const projectClicksEl = document.getElementById('metric-project-clicks');
  const resumeDownloadsEl = document.getElementById('metric-resume-downloads');

  if (totalViewsEl) totalViewsEl.textContent = Number(data.totalViews || 0).toLocaleString();
  if (uniqueRefEl) uniqueRefEl.textContent = Number(data.uniqueReferrers || 0).toLocaleString();
  if (projectClicksEl) projectClicksEl.textContent = Number(data.projectClicks || 0).toLocaleString();
  if (resumeDownloadsEl) resumeDownloadsEl.textContent = Number(data.resumeDownloads || 0).toLocaleString();

  // Referrers List / Empty State
  const referrersContainer = document.getElementById('referrers-list-container');
  if (referrersContainer) {
    if (data.referrers && data.referrers.length > 0) {
      const total = data.referrers.reduce((acc, r) => acc + r.count, 0) || 1;
      referrersContainer.innerHTML = data.referrers.map(r => {
        const pct = Math.round((r.count / total) * 100);
        return `
          <div style="margin-bottom: var(--space-3);">
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
              <span style="font-family: var(--font-mono); color: var(--text-primary); font-weight: 600;">${r.source}</span>
              <span style="color: var(--text-secondary);">${r.count} views (${pct}%)</span>
            </div>
            <div style="height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: var(--accent-primary); border-radius: 3px;"></div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      referrersContainer.innerHTML = `
        <div style="text-align: center; padding: var(--space-6) var(--space-4); border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary);">
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0 0 6px 0;">No external referrers recorded yet.</p>
          <p style="font-size: 11px; color: var(--text-muted); margin: 0;">
            Share your public link <code>profilefolio.dev/u/${username}</code> on LinkedIn, GitHub, or your resume to track incoming sources.
          </p>
        </div>
      `;
    }
  }

  // Device Breakdown
  const devDesktop = document.getElementById('dev-desktop-pct');
  const devMobile = document.getElementById('dev-mobile-pct');
  const devTablet = document.getElementById('dev-tablet-pct');

  if (devDesktop && data.devices) devDesktop.textContent = `${data.devices.desktop}%`;
  if (devMobile && data.devices) devMobile.textContent = `${data.devices.mobile}%`;
  if (devTablet && data.devices) devTablet.textContent = `${data.devices.tablet}%`;

  // Recent Events Feed / Empty State
  const eventsContainer = document.getElementById('recent-events-container');
  if (eventsContainer) {
    if (data.recentEvents && data.recentEvents.length > 0) {
      eventsContainer.innerHTML = data.recentEvents.map(evt => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); font-size: var(--text-xs);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="pulsing-dot"></span>
            <span style="font-weight: 600; color: var(--text-primary);">${evt.event}</span>
            <span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 11px;">${evt.path}</span>
          </div>
          <div style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 11px;">
            ${evt.country} &bull; ${evt.time}
          </div>
        </div>
      `).join('');
    } else {
      eventsContainer.innerHTML = `
        <div style="text-align: center; padding: var(--space-6) var(--space-4); border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary);">
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0 0 6px 0;">No visitor events recorded yet.</p>
          <p style="font-size: 11px; color: var(--text-muted); margin: 0;">
            Real-time page views and resume download requests will be logged here as visitors engage with your public portfolio.
          </p>
        </div>
      `;
    }
  }
}
