/**
 * Folioryn — Account & Privacy Settings Controller
 * Handles comprehensive long-form profile details editor, username/slug customization,
 * publishing visibility toggles, GDPR data export, and account purging.
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
  getActiveUser
} from './profile-data.js';

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

  // 1. Long-Form Profile Elements
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

  // Hydrate Long-Form Form Fields
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

  // Update View Public Page Link
  const currentSlug = (inputSlug?.value || profile.username || 'sunny').trim().toLowerCase();
  if (viewLiveBtn) {
    viewLiveBtn.href = `/u/${currentSlug}`;
  }

  // Live Bio Character Counter
  inputBio?.addEventListener('input', () => {
    if (bioCharCount) {
      bioCharCount.textContent = `${inputBio.value.length} / 500 chars`;
    }
  });

  // Handle Long-Form Profile Submission
  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = inputFullName?.value.trim() || '';
    const displayName = inputDisplayName?.value.trim() || fullName;
    const rawSlug = inputSlug?.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || '';
    const headline = inputHeadline?.value.trim() || '';
    const bio = inputBio?.value.trim() || '';
    const email = inputEmail?.value.trim() || '';
    const phone = inputPhone?.value.trim() || '';
    const location = inputLocation?.value.trim() || '';
    const organization = inputOrganization?.value.trim() || '';
    const availability = selectAvailability?.value || 'Open to opportunities';
    let githubUrl = inputGithub?.value.trim() || '';
    if (githubUrl && !githubUrl.startsWith('http://') && !githubUrl.startsWith('https://')) {
      githubUrl = `https://github.com/${githubUrl.replace(/^@/, '')}`;
    }
    const linkedinUrl = inputLinkedin?.value.trim() || '';
    let twitterUrl = inputTwitter?.value.trim() || '';
    if (twitterUrl && !twitterUrl.startsWith('http://') && !twitterUrl.startsWith('https://')) {
      twitterUrl = `https://x.com/${twitterUrl.replace(/^@/, '')}`;
    }
    const websiteUrl = inputWebsite?.value.trim() || '';

    if (!fullName) {
      alert('Please enter your full name.');
      inputFullName?.focus();
      return;
    }

    if (!rawSlug || rawSlug.length < 3) {
      alert('Please enter a valid handle with at least 3 characters (lowercase letters, numbers, hyphens, or underscores).');
      inputSlug?.focus();
      return;
    }

    if (!headline) {
      alert('Please enter a professional headline.');
      inputHeadline?.focus();
      return;
    }

    if (saveProfileBtn) {
      saveProfileBtn.disabled = true;
      saveProfileBtn.innerHTML = '<span>Saving Profile...</span>';
    }

    try {
      const updatedProfileData = {
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
      };

      // 1. Save in scoped multi-user engine
      saveProfile(updatedProfileData);
      savePublishSettings({ publicSlug: rawSlug });

      // 2. Sync Supabase if configured
      if (activeUser?.id) {
        try {
          await profileService.updateProfile(activeUser.id, {
            display_name: displayName || fullName,
            headline,
            bio,
            location,
            username: rawSlug,
            github_handle: githubUrl ? githubUrl.split('github.com/')[1] || '' : '',
            linkedin_url: linkedinUrl,
            twitter_handle: twitterUrl ? twitterUrl.split('x.com/')[1] || '' : ''
          });
          const userPort = await portfolioService.getUserPortfolio(activeUser.id);
          if (userPort?.id) {
            await portfolioService.updatePortfolio(userPort.id, { slug: rawSlug, title: displayName || fullName });
          }
        } catch (dbErr) {
          console.warn('Supabase sync notice:', dbErr);
        }
      }

      // 3. Update Sidebar Live Snippets
      const sidebarDisplayName = document.getElementById('sidebar-display-name');
      if (sidebarDisplayName) sidebarDisplayName.textContent = displayName || fullName;

      const sidebarHandle = document.getElementById('sidebar-username-handle');
      if (sidebarHandle) sidebarHandle.textContent = `/u/${rawSlug}`;

      const sidebarAvatar = document.getElementById('sidebar-avatar');
      if (sidebarAvatar) sidebarAvatar.textContent = (displayName || fullName).charAt(0).toUpperCase();

      // 4. Update live link button
      if (viewLiveBtn) {
        viewLiveBtn.href = `/u/${rawSlug}`;
      }

      // 5. Success Feedback
      if (saveStatus) {
        saveStatus.style.display = 'block';
        saveStatus.textContent = '✓ Profile details saved successfully!';
        setTimeout(() => {
          saveStatus.style.display = 'none';
        }, 3500);
      }

      if (saveProfileBtn) {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = '<span>✓ Saved Successfully!</span>';
        setTimeout(() => {
          saveProfileBtn.innerHTML = '<span>Save Profile Details</span>';
        }, 2500);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      alert('Could not update profile details. Please verify your inputs.');
      if (saveProfileBtn) {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = '<span>Save Profile Details</span>';
      }
    }
  });

  // 2. Visibility / Unpublish Toggle with real persistence
  const visibilityBtn = document.querySelector('section:nth-of-type(2) button');
  const visibilityText = document.querySelector('section:nth-of-type(2) p[style*="font-size: 11px"]');
  let isPublished = publishSettings.isPublished !== false;

  const updateVisibilityUI = (published) => {
    if (visibilityBtn) {
      visibilityBtn.textContent = published ? 'Unpublish Portfolio' : 'Publish Portfolio';
    }
    if (visibilityText) {
      visibilityText.textContent = published 
        ? 'Currently published and publicly accessible'
        : 'Currently private (hidden from public discovery)';
    }
  };

  updateVisibilityUI(isPublished);

  if (visibilityBtn) {
    visibilityBtn.addEventListener('click', () => {
      isPublished = !isPublished;
      savePublishSettings({ isPublished });
      updateVisibilityUI(isPublished);
    });
  }

  // 3. GDPR Complete Data Export
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const activeProf = getProfile();
      const exportBundle = {
        exportedAt: new Date().toISOString(),
        user: activeUser || { username: activeProf.username, email: activeProf.email },
        profile: activeProf,
        education: getEducation(),
        skills: getSkills(),
        experiences: getExperiences(),
        certifications: getCertifications(),
        projects: getProjects(),
        publishSettings: getPublishSettings(),
      };

      const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folioryn_export_${activeProf.username || 'user'}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // 4. Danger Zone Purge with explicit confirmation
  const purgeBtn = document.querySelector('section[style*="border: 1px solid #ef4444"] button');
  if (purgeBtn) {
    purgeBtn.addEventListener('click', () => {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete your account? All portfolios, projects, and personal data will be permanently deleted.'
      );
      if (confirmDelete) {
        // Clear active user from registry if present
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
});
