/**
 * Folioryn — Account & Privacy Settings Controller
 * Handles:
 * - Profile details editor (names, headline, bio, location, contact, social links)
 * - Publishing Status Tri-State (Published, Draft, Unpublished)
 * - Tokenized Private Preview Generator (24-hour expiring preview link)
 * - One-Click Portfolio Duplication
 * - Data Backup (JSON Export) & Restore (JSON Import with validation, preview & rollback)
 * - Inbound Contact Messages Inbox (view, read/unread, delete, clear)
 * - Account Purging
 */

import { authService, profileService, portfolioService } from './supabase.js';
import {
  getProfile,
  saveProfile,
  getEducation,
  getSkills,
  getExperiences,
  getCertifications,
  getProjects,
  getPublishSettings,
  savePublishSettings,
  getActiveUser,
  generatePreviewToken,
  revokePreviewToken,
  duplicatePortfolio,
  exportProfileData,
  validateImportData,
  importProfileData,
  rollbackLastImport,
  getContactMessages,
  deleteContactMessage,
  markContactMessageRead,
  clearAllContactMessages
} from './profile-data.js';

let pendingImportBundle = null;

document.addEventListener('DOMContentLoaded', async () => {
  let activeUser = getActiveUser();

  try {
    const session = await authService.getSession();
    if (session?.user) {
      activeUser = session.user;
    }
  } catch (err) {
    console.warn('Session verification in settings:', err);
  }

  // Strictly block entry if not logged in
  if (!activeUser) {
    const target = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login/?redirect=${target}&auth=required`);
    return;
  }

  const profile = getProfile();
  const publishSettings = getPublishSettings();

  // 1. Hydrate Long-Form Profile Form Fields
  hydrateProfileForm(profile, activeUser);

  // 2. Setup Publishing Controls & Private Preview Token
  setupPublishingControls(profile, publishSettings);

  // 3. Setup Portfolio Duplication (Feature 4)
  setupPortfolioDuplication();

  // 4. Setup Profile Import & Export Engine (Feature 9)
  setupImportExport(profile, activeUser);

  // 5. Setup Inbound Contact Messages Inbox (Feature 6)
  renderContactMessagesList();

  // 6. Setup Danger Zone Purge
  setupDangerZone(activeUser);
});

function hydrateProfileForm(profile, activeUser) {
  const profileForm = document.getElementById('profile-details-form');
  const inputFullName = document.getElementById('settings-full-name');
  const inputDisplayName = document.getElementById('settings-display-name');
  const inputSlug = document.getElementById('settings-slug');
  const inputHeadline = document.getElementById('settings-headline');
  const inputBio = document.getElementById('settings-bio');
  const bioCharCount = document.getElementById('bio-char-count');
  const inputEmail = document.getElementById('settings-email');
  const inputPhone = document.getElementById('settings-phone');
  const inputLocation = document.getElementById('settings-location');
  const inputOrganization = document.getElementById('settings-organization');
  const selectAvailability = document.getElementById('settings-availability');
  const inputGithub = document.getElementById('settings-github');
  const inputLinkedin = document.getElementById('settings-linkedin');
  const inputTwitter = document.getElementById('settings-twitter');
  const inputWebsite = document.getElementById('settings-website');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const saveStatus = document.getElementById('profile-save-status');
  const viewLiveBtn = document.getElementById('settings-view-live-btn');

  if (inputFullName) inputFullName.value = profile.fullName || activeUser?.display_name || '';
  if (inputDisplayName) inputDisplayName.value = profile.displayName || profile.fullName || activeUser?.display_name || '';
  if (inputSlug) inputSlug.value = profile.username || activeUser?.username || 'sunny';
  if (inputHeadline) inputHeadline.value = profile.headline || activeUser?.headline || '';
  if (inputBio) {
    inputBio.value = profile.bio || activeUser?.bio || '';
    if (bioCharCount) bioCharCount.textContent = `${inputBio.value.length} / 500 chars`;
  }
  if (inputEmail) inputEmail.value = profile.email || activeUser?.email || '';
  if (inputPhone) inputPhone.value = profile.phone || activeUser?.phone || '';
  if (inputLocation) inputLocation.value = profile.location || activeUser?.location || '';
  if (inputOrganization) inputOrganization.value = profile.organization || '';
  if (selectAvailability && profile.availability) selectAvailability.value = profile.availability;
  if (inputGithub) inputGithub.value = profile.githubUrl || (activeUser?.github_handle ? `https://github.com/${activeUser.github_handle}` : '');
  if (inputLinkedin) inputLinkedin.value = profile.linkedinUrl || activeUser?.linkedin_url || '';
  if (inputTwitter) inputTwitter.value = profile.twitterUrl || (activeUser?.twitter_handle ? `https://x.com/${activeUser.twitter_handle}` : '');
  if (inputWebsite) inputWebsite.value = profile.websiteUrl || activeUser?.website_url || '';

  const currentSlug = (inputSlug?.value || profile.username || 'sunny').trim().toLowerCase();
  if (viewLiveBtn) viewLiveBtn.href = `/u/${currentSlug}`;

  inputBio?.addEventListener('input', () => {
    if (bioCharCount) bioCharCount.textContent = `${inputBio.value.length} / 500 chars`;
  });

  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = inputFullName?.value.trim() || '';
    const displayName = inputDisplayName?.value.trim() || fullName;
    const rawSlug = (inputSlug?.value.trim() || profile.username || 'user').toLowerCase().replace(/[^a-z0-9-_]/g, '');
    const headline = inputHeadline?.value.trim() || '';
    const bio = inputBio?.value.trim() || '';
    const email = inputEmail?.value.trim() || '';
    const phone = inputPhone?.value.trim() || '';
    const location = inputLocation?.value.trim() || '';
    const organization = inputOrganization?.value.trim() || '';
    const availability = selectAvailability?.value || 'Open to opportunities';
    const githubUrl = inputGithub?.value.trim() || '';
    const linkedinUrl = inputLinkedin?.value.trim() || '';
    const twitterUrl = inputTwitter?.value.trim() || '';
    const websiteUrl = inputWebsite?.value.trim() || '';

    if (!fullName || !rawSlug || !headline) {
      alert('Please fill out all required fields marked with an asterisk (*).');
      return;
    }

    if (saveProfileBtn) {
      saveProfileBtn.disabled = true;
      saveProfileBtn.textContent = 'Saving Changes...';
    }

    try {
      saveProfile({
        fullName,
        displayName,
        username: rawSlug,
        headline,
        bio,
        email,
        phone,
        location,
        organization,
        availability,
        githubUrl,
        linkedinUrl,
        twitterUrl,
        websiteUrl,
        portfolioUrl: `https://folioryn.dev/u/${rawSlug}`
      });

      savePublishSettings({ publicSlug: rawSlug });

      if (activeUser?.id && activeUser.id !== 'usr_mock_sunny_9921') {
        try {
          await profileService.updateProfile(activeUser.id, {
            display_name: displayName,
            headline,
            bio,
            location,
            github_handle: githubUrl?.replace('https://github.com/', ''),
            linkedin_url: linkedinUrl,
            twitter_handle: twitterUrl?.replace('https://x.com/', '').replace('https://twitter.com/', ''),
            website_url: websiteUrl,
          });
        } catch (remoteErr) {
          console.warn('Supabase remote profile sync notice:', remoteErr);
        }
      }

      if (viewLiveBtn) viewLiveBtn.href = `/u/${rawSlug}`;

      if (saveStatus) {
        saveStatus.style.display = 'block';
        saveStatus.textContent = '✓ Profile details saved successfully!';
        setTimeout(() => { saveStatus.style.display = 'none'; }, 3500);
      }

      if (saveProfileBtn) {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = '<span>✓ Saved Successfully!</span>';
        setTimeout(() => { saveProfileBtn.innerHTML = '<span>Save Profile Details</span>'; }, 2500);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      alert('Could not update profile details.');
      if (saveProfileBtn) {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = '<span>Save Profile Details</span>';
      }
    }
  });
}

function setupPublishingControls(profile, publishSettings) {
  const statusSelect = document.getElementById('settings-publish-status-select');
  const saveStatusBtn = document.getElementById('save-status-btn');
  const descText = document.getElementById('settings-visibility-description');
  const generateTokenBtn = document.getElementById('generate-preview-token-btn');
  const tokenBox = document.getElementById('preview-token-display-box');
  const tokenInput = document.getElementById('preview-token-url-input');
  const copyTokenBtn = document.getElementById('copy-preview-token-btn');
  const revokeTokenBtn = document.getElementById('revoke-preview-token-btn');

  const currentStatus = publishSettings.status || (publishSettings.isPublished !== false ? 'published' : 'draft');
  if (statusSelect) statusSelect.value = currentStatus;

  const updateDesc = (status) => {
    if (!descText) return;
    if (status === 'published') {
      descText.textContent = 'Currently published live and publicly discoverable';
      descText.style.color = '#22c55e';
    } else if (status === 'draft') {
      descText.textContent = 'Saved as Private Draft (Hidden from search engines and community)';
      descText.style.color = '#eab308';
    } else {
      descText.textContent = 'Currently Unpublished / Offline (Public visitors receive unavailable notice)';
      descText.style.color = '#ef4444';
    }
  };
  updateDesc(currentStatus);

  saveStatusBtn?.addEventListener('click', () => {
    const newStatus = statusSelect?.value || 'published';
    savePublishSettings({ status: newStatus });
    updateDesc(newStatus);
    alert(`Portfolio status updated to: ${newStatus.toUpperCase()}`);
  });

  // Check if active preview token already exists
  const slug = profile.username || 'user';
  if (publishSettings.previewToken && tokenBox && tokenInput) {
    const isExpired = publishSettings.previewTokenExpiresAt && new Date(publishSettings.previewTokenExpiresAt).getTime() < Date.now();
    if (!isExpired) {
      tokenBox.style.display = 'block';
      tokenInput.value = `${window.location.origin}/u/${encodeURIComponent(slug)}?preview_token=${encodeURIComponent(publishSettings.previewToken)}`;
    }
  }

  generateTokenBtn?.addEventListener('click', () => {
    const res = generatePreviewToken(slug);
    if (tokenBox && tokenInput) {
      tokenBox.style.display = 'block';
      tokenInput.value = `${window.location.origin}${res.previewUrl}`;
    }
  });

  copyTokenBtn?.addEventListener('click', () => {
    if (tokenInput && tokenInput.value) {
      navigator.clipboard.writeText(tokenInput.value).then(() => {
        const orig = copyTokenBtn.textContent;
        copyTokenBtn.textContent = 'Copied!';
        setTimeout(() => { copyTokenBtn.textContent = orig; }, 2000);
      });
    }
  });

  revokeTokenBtn?.addEventListener('click', () => {
    revokePreviewToken();
    if (tokenBox) tokenBox.style.display = 'none';
    if (tokenInput) tokenInput.value = '';
    alert('Private preview token revoked.');
  });
}

function setupPortfolioDuplication() {
  const dupBtn = document.getElementById('duplicate-settings-btn');
  if (!dupBtn) return;

  dupBtn.addEventListener('click', () => {
    const confirmDup = window.confirm(
      'Duplicate Portfolio: This will create an independent editable draft copy with a distinct URL. Your original portfolio remains unchanged. Proceed?'
    );
    if (!confirmDup) return;

    dupBtn.disabled = true;
    dupBtn.textContent = 'Creating Duplicate...';

    try {
      const result = duplicatePortfolio();
      alert(`✓ Portfolio successfully duplicated!\n\nNew Draft Copy: /u/${result.slug}\nTitle: ${result.title}\n\nThe duplicate has been saved as a Draft.`);
      window.location.href = `/dashboard/builder/`;
    } catch (err) {
      console.error('Duplication error:', err);
      alert(err.message || 'Could not duplicate portfolio.');
    } finally {
      dupBtn.disabled = false;
      dupBtn.textContent = 'Duplicate Current Portfolio';
    }
  });
}

function setupImportExport(profile, activeUser) {
  const exportBtn = document.getElementById('export-data-btn');
  const importInput = document.getElementById('import-file-input');
  const modal = document.getElementById('import-preview-modal');
  const summaryBox = document.getElementById('import-summary-content');
  const cancelBtn = document.getElementById('cancel-import-btn');
  const confirmBtn = document.getElementById('confirm-import-btn');
  const rollbackBtn = document.getElementById('rollback-import-btn');

  // Check if rollback is available
  const uid = activeUser.id || (activeUser.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  if (rollbackBtn && localStorage.getItem(`folioryn_import_rollback_${uid}`)) {
    rollbackBtn.style.display = 'inline-flex';
  }

  // 1. Export JSON
  exportBtn?.addEventListener('click', () => {
    const bundle = exportProfileData();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folioryn_backup_${profile.username || 'user'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // 2. Select file to import
  importInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const validation = validateImportData(parsed);

        if (!validation.valid) {
          alert(`Import Validation Failed:\n\n${validation.errors.join('\n')}`);
          importInput.value = '';
          return;
        }

        // Store parsed bundle and display preview summary modal
        pendingImportBundle = parsed;
        if (summaryBox) {
          summaryBox.innerHTML = `
            <div><strong>Schema Version:</strong> ${parsed.schemaVersion}</div>
            <div><strong>Profile Name:</strong> ${escapeHtml(validation.summary.profileName)}</div>
            <div><strong>Featured Projects:</strong> ${validation.summary.projectCount} records</div>
            <div><strong>Technical Skills:</strong> ${validation.summary.skillCount} competencies</div>
            <div><strong>Education Entries:</strong> ${validation.summary.educationCount} records</div>
            <div><strong>Work Experiences:</strong> ${validation.summary.experienceCount} records</div>
            <div><strong>Blog Articles:</strong> ${validation.summary.articleCount} posts</div>
          `;
        }

        if (modal) modal.style.display = 'flex';
      } catch (err) {
        alert('Invalid JSON file format. Please upload a valid Folioryn JSON backup.');
        importInput.value = '';
      }
    };
    reader.readAsText(file);
  });

  // 3. Confirm Import
  confirmBtn?.addEventListener('click', () => {
    if (!pendingImportBundle) return;

    const strategy = document.querySelector('input[name="import-strategy"]:checked')?.value || 'merge';
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Importing...';

    try {
      const res = importProfileData(pendingImportBundle, strategy);
      alert(`✓ Import Applied Successfully via ${strategy.toUpperCase()} strategy!\n\nA safety rollback point has been created.`);
      if (modal) modal.style.display = 'none';
      window.location.reload();
    } catch (err) {
      console.error('Import execution error:', err);
      alert(err.message || 'Error applying import.');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Apply Import';
      if (importInput) importInput.value = '';
    }
  });

  // 4. Cancel Import
  cancelBtn?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
    pendingImportBundle = null;
    if (importInput) importInput.value = '';
  });

  // 5. Rollback Last Import
  rollbackBtn?.addEventListener('click', () => {
    const confirmRollback = window.confirm(
      'Restore Safety Snapshot: This will revert your portfolio records back to the state immediately preceding your last import. Proceed?'
    );
    if (!confirmRollback) return;

    const success = rollbackLastImport();
    if (success) {
      alert('✓ Prior profile state successfully restored.');
      window.location.reload();
    } else {
      alert('Could not find rollback snapshot.');
    }
  });

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      modal.style.display = 'none';
      pendingImportBundle = null;
      if (importInput) importInput.value = '';
    }
  });
}

function renderContactMessagesList() {
  const listContainer = document.getElementById('contact-messages-list');
  const clearAllBtn = document.getElementById('clear-all-messages-btn');
  if (!listContainer) return;

  const messages = getContactMessages();

  if (messages.length === 0) {
    listContainer.innerHTML = `
      <div style="padding: var(--space-6); border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); font-size: var(--text-xs);">
        No inbound inquiries received yet. Messages submitted via your public portfolio contact form will appear here.
      </div>
    `;
    if (clearAllBtn) clearAllBtn.style.display = 'none';
    return;
  }

  if (clearAllBtn) {
    clearAllBtn.style.display = 'inline-block';
    clearAllBtn.onclick = () => {
      if (window.confirm('Clear all received messages? This cannot be undone.')) {
        clearAllContactMessages();
        renderContactMessagesList();
      }
    };
  }

  listContainer.innerHTML = messages.map(msg => {
    const dateFormatted = msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Recent';
    return `
      <div style="padding: var(--space-4); border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-primary); display: flex; flex-direction: column; gap: var(--space-2);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: var(--text-sm); color: var(--text-primary);">${escapeHtml(msg.sender_name)}</strong>
              <span class="badge" style="font-size: 10px; ${msg.is_read ? '' : 'color: #22c55e; border-color: rgba(34, 197, 94, 0.4);'}">
                ${msg.is_read ? 'Read' : 'New Inbound'}
              </span>
            </div>
            <a href="mailto:${escapeHtml(msg.sender_email)}" style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-primary); text-decoration: underline;">
              ${escapeHtml(msg.sender_email)}
            </a>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);">${dateFormatted}</span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.__toggleMsgRead('${msg.id}', ${!msg.is_read})" style="font-size: 10px; padding: 2px 6px;">
              ${msg.is_read ? 'Mark Unread' : 'Mark Read'}
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.__deleteMsg('${msg.id}')" style="font-size: 10px; padding: 2px 6px; color: #ef4444;">
              Delete
            </button>
          </div>
        </div>

        <div style="font-size: var(--text-xs); font-weight: 600; color: var(--text-primary);">
          ${escapeHtml(msg.subject || 'Portfolio Inquiry')}
        </div>

        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin: 0; background-color: var(--bg-secondary); padding: var(--space-3); border-radius: var(--radius-sm); white-space: pre-wrap;">
${escapeHtml(msg.message)}
        </p>
      </div>
    `;
  }).join('');

  // Attach global message action handlers
  window.__toggleMsgRead = (id, newRead) => {
    markContactMessageRead(id, newRead);
    renderContactMessagesList();
  };

  window.__deleteMsg = (id) => {
    if (window.confirm('Delete this message?')) {
      deleteContactMessage(id);
      renderContactMessagesList();
    }
  };
}

function setupDangerZone(activeUser) {
  const purgeBtn = document.querySelector('section[style*="border: 1px solid #ef4444"] button');
  purgeBtn?.addEventListener('click', () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? All portfolios, projects, and personal data will be permanently deleted.'
    );
    if (confirmDelete) {
      try {
        const rawUsers = localStorage.getItem('profilefolio_users');
        if (rawUsers && activeUser?.id) {
          const users = JSON.parse(rawUsers).filter(u => u.id !== activeUser.id);
          localStorage.setItem('profilefolio_users', JSON.stringify(users));
        }
      } catch (e) {
        console.warn('User removal notice:', e);
      }

      localStorage.removeItem('profilefolio_session');
      localStorage.removeItem('ssrnovx_mock_session');
      localStorage.removeItem('buildlab_session');
      localStorage.removeItem('profilefolio_active_user');

      alert('Account and data purged. Redirecting to home...');
      window.location.href = '/';
    }
  });
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
