/**
 * BuildLab — Privacy-Conscious Portfolio Analytics Controller
 * TechSpace BuildLab B04
 */

import { getAnalytics } from './profile-data.js';

document.addEventListener('DOMContentLoaded', () => {
  renderAnalyticsDashboard();
});

function renderAnalyticsDashboard() {
  const data = getAnalytics();

  // Metric KPI Cards
  const totalViewsEl = document.getElementById('metric-total-views');
  const uniqueRefEl = document.getElementById('metric-unique-ref');
  const projectClicksEl = document.getElementById('metric-project-clicks');
  const resumeDownloadsEl = document.getElementById('metric-resume-downloads');

  if (totalViewsEl) totalViewsEl.textContent = Number(data.totalViews || 0).toLocaleString();
  if (uniqueRefEl) uniqueRefEl.textContent = Number(data.uniqueReferrers || 0).toLocaleString();
  if (projectClicksEl) projectClicksEl.textContent = Number(data.projectClicks || 0).toLocaleString();
  if (resumeDownloadsEl) resumeDownloadsEl.textContent = Number(data.resumeDownloads || 0).toLocaleString();

  // Referrers List
  const referrersContainer = document.getElementById('referrers-list-container');
  if (referrersContainer && data.referrers) {
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
  }

  // Device Breakdown
  const devDesktop = document.getElementById('dev-desktop-pct');
  const devMobile = document.getElementById('dev-mobile-pct');
  const devTablet = document.getElementById('dev-tablet-pct');

  if (devDesktop && data.devices) devDesktop.textContent = `${data.devices.desktop}%`;
  if (devMobile && data.devices) devMobile.textContent = `${data.devices.mobile}%`;
  if (devTablet && data.devices) devTablet.textContent = `${data.devices.tablet}%`;

  // Recent Events Feed
  const eventsContainer = document.getElementById('recent-events-container');
  if (eventsContainer && data.recentEvents) {
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
  }
}
