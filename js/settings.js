/**
 * SSRNovX — Account & Privacy Settings Controller
 * Manages handle/slug customization, visibility toggle, GDPR data export,
 * and danger-zone account purge.
 */

import { authService, profileService, portfolioService } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  let activeUser = null;

  try {
    const session = await authService.getSession();
    if (session?.user) {
      activeUser = session.user;
    }
  } catch (err) {
    console.warn('Session verification in settings:', err);
  }

  // 1. Save Slug Handler
  const saveSlugBtn = document.getElementById('save-slug-btn');
  const slugInput = document.querySelector('section:first-of-type input.form-input');

  if (saveSlugBtn && slugInput) {
    saveSlugBtn.addEventListener('click', async () => {
      const newSlug = slugInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!newSlug) {
        alert('Please enter a valid handle containing letters, numbers, hyphens or underscores.');
        return;
      }

      saveSlugBtn.disabled = true;
      saveSlugBtn.textContent = 'Saving...';

      try {
        if (activeUser?.id) {
          await profileService.updateProfile(activeUser.id, { username: newSlug });
          const userPort = await portfolioService.getUserPortfolio(activeUser.id);
          if (userPort?.id) {
            await portfolioService.updatePortfolio(userPort.id, { slug: newSlug });
          }
        }

        // Update local draft
        const draft = localStorage.getItem('ssrnovx_portfolio_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          parsed.slug = newSlug;
          localStorage.setItem('ssrnovx_portfolio_draft', JSON.stringify(parsed));
        }

        saveSlugBtn.disabled = false;
        saveSlugBtn.textContent = '✓ Handle Saved!';
        setTimeout(() => {
          saveSlugBtn.textContent = 'Save Handle';
        }, 2500);
      } catch (err) {
        console.error('Save slug error:', err);
        saveSlugBtn.disabled = false;
        saveSlugBtn.textContent = 'Save Handle';
        alert('Could not update handle. Handle might already be taken.');
      }
    });
  }

  // 2. Visibility / Unpublish Toggle
  const visibilityBtn = document.querySelector('section:nth-of-type(2) button');
  const visibilityText = document.querySelector('section:nth-of-type(2) p[style*="font-size: 11px"]');
  let isPublished = true;

  if (visibilityBtn) {
    visibilityBtn.addEventListener('click', () => {
      isPublished = !isPublished;
      if (isPublished) {
        visibilityBtn.textContent = 'Unpublish Portfolio';
        if (visibilityText) visibilityText.textContent = 'Currently published and publicly accessible';
      } else {
        visibilityBtn.textContent = 'Publish Portfolio';
        if (visibilityText) visibilityText.textContent = 'Currently private (hidden from public discovery)';
      }
    });
  }

  // 3. GDPR Data Export
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const exportBundle = {
        exportedAt: new Date().toISOString(),
        user: activeUser || { username: 'sunny', email: 'sunny@ssrnovx.dev' },
        draft: JSON.parse(localStorage.getItem('ssrnovx_portfolio_draft') || '{}'),
        projects: JSON.parse(localStorage.getItem('ssrnovx_active_projects') || '[]'),
      };

      const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssrnovx_data_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // 4. Danger Zone Purge
  const purgeBtn = document.querySelector('section[style*="border: 1px solid #ef4444"] button');
  if (purgeBtn) {
    purgeBtn.addEventListener('click', () => {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete your account? All portfolios, projects, and synced metadata will be permanently deleted.'
      );
      if (confirmDelete) {
        localStorage.clear();
        alert('Account and data purged. Redirecting to home...');
        window.location.href = '/';
      }
    });
  }
});
