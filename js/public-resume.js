/**
 * Folioryn — Public ATS Resume Viewer & Controller
 * Enables any external visitor, recruiter, or interviewer to view and directly download
 * an ATS-compliant PDF resume without requiring platform authentication or dashboard access.
 */

import { getUserDataBySlug, getActiveUser } from './profile-data.js';
import { portfolioService } from './supabase.js';
import { renderA4Canvas } from './dashboard-resume.js';
import { downloadAtsResumePdf } from './resume-pdf-generator.js';

document.addEventListener('DOMContentLoaded', async () => {
  const username = extractUsernameSlug();
  const urlParams = new URLSearchParams(window.location.search);
  const autoDownload = urlParams.get('download') === 'true' || urlParams.get('download') === '1';

  try {
    let userData = getUserDataBySlug(username);

    // Fallback to Supabase if not present in local store
    if (!userData) {
      const dbPort = await portfolioService.getPortfolioBySlug(username);
      if (dbPort) {
        userData = {
          profile: {
            fullName: dbPort.profiles?.display_name || dbPort.title,
            username: dbPort.slug,
            headline: dbPort.profiles?.headline || 'Software Engineer',
            bio: dbPort.profiles?.bio || '',
            location: dbPort.profiles?.location || '',
            githubUrl: dbPort.profiles?.github_handle ? `https://github.com/${dbPort.profiles.github_handle}` : '',
            email: dbPort.profiles?.email || 'contact@folioryn.dev',
          },
          education: dbPort.education || [],
          skills: dbPort.skills || [],
          projects: dbPort.projects || [],
          experiences: dbPort.experiences || [],
          certifications: []
        };
      }
    }

    if (!userData) {
      renderNotFoundResume(username);
      return;
    }

    const profile = userData.profile || {};
    const displayName = profile.fullName || profile.displayName || username;

    // 1. Update Title & Header Identity
    document.title = `${displayName} — ATS Resume (PDF) | Folioryn`;
    
    const nameEl = document.getElementById('resume-person-name');
    if (nameEl) {
      nameEl.textContent = `${displayName} — ATS Resume`;
    }

    const backLink = document.getElementById('back-to-portfolio-link');
    if (backLink) {
      backLink.href = `/u/${encodeURIComponent(username)}`;
    }

    // 2. Render Full ATS Document Canvas
    renderA4Canvas({
      profile: userData.profile,
      education: userData.education,
      skills: userData.skills,
      experiences: userData.experiences,
      certifications: userData.certifications,
      projects: userData.projects
    });

    // 3. Bind Direct PDF Download
    const downloadBtn = document.getElementById('public-download-pdf-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadAtsResumePdf(userData, username);
      });
    }

    // 4. Bind Print / Save Action
    const printBtn = document.getElementById('public-print-pdf-btn');
    if (printBtn) {
      printBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.print();
      });
    }

    // 5. Dashboard Edit Link (Only for the actual resume owner)
    const isOwner = isCurrentSessionOwner(username);
    const ownerBtn = document.getElementById('owner-edit-resume-btn');
    if (ownerBtn) {
      ownerBtn.style.display = isOwner ? 'inline-flex' : 'none';
    }

    // 6. Auto-download if requested via URL
    if (autoDownload) {
      setTimeout(() => {
        downloadAtsResumePdf(userData, username);
      }, 500);
    }

  } catch (err) {
    console.error('Error loading public ATS resume:', err);
    renderNotFoundResume(username);
  }
});

function isCurrentSessionOwner(username) {
  try {
    const raw = localStorage.getItem('profilefolio_session') || localStorage.getItem('ssrnovx_mock_session');
    if (!raw) return false;
    const user = JSON.parse(raw);
    const sessionUser = (user.username || '').toLowerCase();
    const targetUser = (username || '').toLowerCase();
    if (sessionUser === targetUser) return true;
    if ((sessionUser === 'sunny' || sessionUser === 'ssrnov') && (targetUser === 'sunny' || targetUser === 'ssrnov')) return true;
    if ((user.github_handle || '').toLowerCase() === targetUser) return true;
    return false;
  } catch (e) {
    return false;
  }
}

function extractUsernameSlug() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const segments = path.split('/');
  
  // Format: /u/:username/resume
  const uIndex = segments.indexOf('u');
  if (uIndex !== -1 && segments[uIndex + 1] && segments[uIndex + 1] !== 'resume') {
    return decodeURIComponent(segments[uIndex + 1]).toLowerCase();
  }

  // Fallback to search param: ?u=username
  const params = new URLSearchParams(window.location.search);
  if (params.get('u')) return params.get('u').trim().toLowerCase();
  if (params.get('username')) return params.get('username').trim().toLowerCase();

  // Active session fallback or default
  const activeUser = getActiveUser();
  if (activeUser?.username) return activeUser.username.toLowerCase();

  return 'ssrnov';
}

function renderNotFoundResume(username) {
  const canvas = document.getElementById('a4-canvas');
  if (canvas) {
    canvas.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #333;">
        <h2 style="font-size: 20px; margin-bottom: 8px;">Resume Not Found</h2>
        <p style="font-size: 13px; color: #666; margin-bottom: 20px;">Could not locate a public portfolio dataset for "@${username}".</p>
        <a href="/templates/" class="btn btn-secondary" style="color: #000; border: 1px solid #333; padding: 6px 16px; border-radius: 4px; text-decoration: none;">Browse Templates</a>
      </div>
    `;
  }
}
