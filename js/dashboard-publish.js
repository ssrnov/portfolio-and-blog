/**
 * BuildLab — Publish & Sharing Controller
 * TechSpace BuildLab B04
 */

import { getProfile, getEducation, getSkills, getPublishSettings, savePublishSettings } from './profile-data.js';

document.addEventListener('DOMContentLoaded', () => {
  initPublishControls();
  renderChecklist();
  renderQRCode();
  initSectionToggles();
});

function initPublishControls() {
  const profile = getProfile();
  const settings = getPublishSettings();

  const slug = profile.username || 'sunny';
  const fullUrl = `${window.location.origin}/u/${slug}`;

  // Update URL displays
  const urlDisplay = document.getElementById('public-url-display');
  const openLinkBtn = document.getElementById('open-portfolio-btn');
  const copyBtn = document.getElementById('copy-url-btn');
  const statusBadge = document.getElementById('publish-status-badge');
  const publishToggle = document.getElementById('publish-status-toggle');

  if (urlDisplay) urlDisplay.textContent = fullUrl;
  if (openLinkBtn) openLinkBtn.href = `/u/${slug}`;

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('Public portfolio link copied to clipboard!');
      });
    });
  }

  // Publish Status Toggle
  if (publishToggle && statusBadge) {
    publishToggle.checked = settings.isPublished !== false;
    updateStatusVisuals(publishToggle.checked, statusBadge);

    publishToggle.addEventListener('change', (e) => {
      const isPublished = e.target.checked;
      savePublishSettings({ isPublished });
      updateStatusVisuals(isPublished, statusBadge);
      showToast(isPublished ? 'Portfolio is now LIVE and accessible!' : 'Portfolio unpublished. Set to private draft.');
    });
  }

  // Social Share Buttons
  const shareLinkedIn = document.getElementById('share-linkedin');
  const shareTwitter = document.getElementById('share-twitter');
  const shareWhatsapp = document.getElementById('share-whatsapp');

  if (shareLinkedIn) {
    shareLinkedIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
  }
  if (shareTwitter) {
    shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my professional portfolio and projects on BuildLab: ')}&url=${encodeURIComponent(fullUrl)}`;
  }
  if (shareWhatsapp) {
    shareWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out my portfolio: ' + fullUrl)}`;
  }
}

function updateStatusVisuals(isPublished, badge) {
  if (isPublished) {
    badge.innerHTML = '<span class="pulsing-dot"></span> <span style="color: #27c93f;">Published &amp; Live</span>';
    badge.style.borderColor = 'rgba(39, 201, 63, 0.4)';
  } else {
    badge.innerHTML = '<span style="color: #ff5f56;">&#9679; Unpublished (Draft Only)</span>';
    badge.style.borderColor = 'rgba(255, 95, 86, 0.4)';
  }
}

function renderChecklist() {
  const profile = getProfile();
  const education = getEducation();
  const skills = getSkills();

  const items = [
    { label: "Valid username slug", done: !!profile.username },
    { label: "Professional headline & bio", done: !!(profile.headline && profile.bio) },
    { label: "Academic or education history added", done: education.length > 0 },
    { label: "Technical skills matrix populated", done: skills.length > 0 }
  ];

  const container = document.getElementById('publish-checklist-container');
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div style="display: flex; align-items: center; gap: 8px; font-size: var(--text-xs); margin-bottom: 6px;">
      <span style="color: ${item.done ? '#27c93f' : '#ffbd2e'}; font-weight: 700;">
        ${item.done ? '&#10003;' : '&#9679;'}
      </span>
      <span style="color: ${item.done ? 'var(--text-primary)' : 'var(--text-muted)'};">
        ${item.label}
      </span>
    </div>
  `).join('');
}

function renderQRCode() {
  const qrContainer = document.getElementById('qr-code-canvas');
  if (!qrContainer) return;

  // Clean SVG QR Code vector representation
  qrContainer.innerHTML = `
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style="background: #ffffff; padding: 10px; border-radius: var(--radius-md);">
      <!-- Outer positioning squares -->
      <rect x="10" y="10" width="34" height="34" rx="4" fill="#000000"/>
      <rect x="16" y="16" width="22" height="22" rx="2" fill="#ffffff"/>
      <rect x="22" y="22" width="10" height="10" rx="1" fill="#000000"/>

      <rect x="96" y="10" width="34" height="34" rx="4" fill="#000000"/>
      <rect x="102" y="16" width="22" height="22" rx="2" fill="#ffffff"/>
      <rect x="108" y="22" width="10" height="10" rx="1" fill="#000000"/>

      <rect x="10" y="96" width="34" height="34" rx="4" fill="#000000"/>
      <rect x="16" y="102" width="22" height="22" rx="2" fill="#ffffff"/>
      <rect x="22" y="108" width="10" height="10" rx="1" fill="#000000"/>

      <!-- Matrix data bits -->
      <rect x="52" y="16" width="6" height="6" fill="#000000"/>
      <rect x="64" y="24" width="6" height="6" fill="#000000"/>
      <rect x="76" y="16" width="6" height="6" fill="#000000"/>
      <rect x="52" y="32" width="6" height="6" fill="#000000"/>

      <rect x="16" y="52" width="6" height="6" fill="#000000"/>
      <rect x="28" y="64" width="6" height="6" fill="#000000"/>
      <rect x="36" y="76" width="6" height="6" fill="#000000"/>
      
      <rect x="56" y="56" width="28" height="28" rx="2" fill="#8297FF"/>
      <circle cx="70" cy="70" r="6" fill="#08090B"/>

      <rect x="96" y="56" width="6" height="6" fill="#000000"/>
      <rect x="110" y="70" width="6" height="6" fill="#000000"/>
      <rect x="120" y="60" width="6" height="6" fill="#000000"/>

      <rect x="56" y="96" width="6" height="6" fill="#000000"/>
      <rect x="70" y="110" width="6" height="6" fill="#000000"/>
      <rect x="84" y="96" width="6" height="6" fill="#000000"/>
      <rect x="100" y="110" width="6" height="6" fill="#000000"/>
      <rect x="114" y="96" width="6" height="6" fill="#000000"/>
    </svg>
  `;
}

function initSectionToggles() {
  const settings = getPublishSettings();
  const visibility = settings.sectionVisibility || {};

  const toggleInputs = document.querySelectorAll('.section-visibility-toggle');
  toggleInputs.forEach(input => {
    const section = input.getAttribute('data-section');
    if (visibility[section] !== undefined) {
      input.checked = visibility[section];
    }

    input.addEventListener('change', () => {
      visibility[section] = input.checked;
      savePublishSettings({ sectionVisibility: visibility });
      showToast(`Updated visibility for ${section}`);
    });
  });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'dashboard-toast';
  toast.textContent = msg;
  toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: var(--bg-surface); border: 1px solid var(--accent-primary); color: var(--text-primary); padding: 10px 18px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-size: 13px; z-index: 9999;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
