/**
 * BuildLab — Dynamic ATS Resume Builder Controller
 * Synchronizes user data (Profile, Education with CGPA, Categorized Skills, Projects, Experience)
 * directly with the real-time A4 document canvas and handles ATS Vector PDF print triggers.
 * Ensures all project repositories and live demos are clickable PDF link annotations.
 */

import {
  getProfile,
  getEducation,
  getSkills,
  getExperiences,
  getCertifications,
  getProjects
} from './profile-data.js';

document.addEventListener('DOMContentLoaded', () => {
  initResumeBuilder();
});

function initResumeBuilder() {
  const profile = getProfile();
  const education = getEducation();
  const skills = getSkills();
  const experiences = getExperiences();
  const certifications = getCertifications();
  const projects = getProjects();

  // Populate Editor Inputs
  const inputName = document.getElementById('resume-input-name');
  const inputRole = document.getElementById('resume-input-role');
  const inputEmail = document.getElementById('resume-input-email');
  const inputPhone = document.getElementById('resume-input-phone');
  const inputLocation = document.getElementById('resume-input-location');
  const inputSummary = document.getElementById('resume-input-summary');

  if (inputName) inputName.value = profile.fullName || 'Developer';
  if (inputRole) inputRole.value = profile.headline || 'Full-Stack Software Engineer & Systems Architect';
  if (inputEmail) inputEmail.value = profile.email || '';
  if (inputPhone) inputPhone.value = profile.phone || '';
  if (inputLocation) inputLocation.value = profile.location || '';
  if (inputSummary) inputSummary.value = profile.bio || 'Building software applications, scalable architectures, and modern web interfaces with native web standards.';

  // Render Initial Canvas
  renderA4Canvas({
    profile,
    education,
    skills,
    experiences,
    certifications,
    projects
  });

  // Attach Two-Way Input Listeners
  attachInputListeners(profile);

  // PDF Print Trigger
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  downloadPdfBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.print();
  });
}

function attachInputListeners(profile) {
  const fields = [
    { id: 'resume-input-name', target: 'preview-resume-name' },
    { id: 'resume-input-role', target: 'preview-resume-role' },
    { id: 'resume-input-summary', target: 'preview-resume-summary' }
  ];

  fields.forEach(({ id, target }) => {
    const el = document.getElementById(id);
    const targetEl = document.getElementById(target);
    if (el && targetEl) {
      el.addEventListener('input', () => {
        targetEl.textContent = el.value;
      });
    }
  });

  // Re-render contact bar on edit
  const contactInputs = ['resume-input-email', 'resume-input-phone', 'resume-input-location'];
  contactInputs.forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => updateContactBar(profile));
  });
}

function updateContactBar(profile) {
  const email = document.getElementById('resume-input-email')?.value || profile?.email || '';
  const phone = document.getElementById('resume-input-phone')?.value || profile?.phone || '';
  const loc = document.getElementById('resume-input-location')?.value || profile?.location || '';
  const bar = document.getElementById('preview-contact-bar');

  const items = [];
  if (email) {
    items.push(`<a href="mailto:${escapeHtml(email)}" style="color: #000; text-decoration: underline;">${escapeHtml(email)}</a>`);
  }
  if (phone) {
    items.push(`<a href="tel:${escapeHtml(phone)}" style="color: #000; text-decoration: none;">${escapeHtml(phone)}</a>`);
  }
  if (loc) {
    items.push(`<span>${escapeHtml(loc)}</span>`);
  }
  if (profile?.githubUrl) {
    const cleanGh = profile.githubUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const fullGh = profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`;
    items.push(`<a href="${escapeHtml(fullGh)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">${escapeHtml(cleanGh)}</a>`);
  }
  const username = profile?.username || 'user';
  items.push(`<a href="/u/${escapeHtml(username)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">folioryn.dev/u/${escapeHtml(username)}</a>`);

  if (profile?.linkedinUrl) {
    const cleanLi = profile.linkedinUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const fullLi = profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`;
    items.push(`<a href="${escapeHtml(fullLi)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">${escapeHtml(cleanLi)}</a>`);
  }

  if (bar) {
    bar.innerHTML = items.join(' <span>&bull;</span> ');
  }
}

export function renderA4Canvas({ profile, education, skills, experiences, certifications, projects }) {
  const canvas = document.getElementById('a4-canvas');
  if (!canvas) return;

  // Group skills by category
  const skillsByCategory = {};
  (skills || []).forEach(s => {
    const cat = s.category || 'Competencies';
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(s.name);
  });

  const featuredProjects = (projects || []).slice(0, 4);
  const contactItems = [];
  if (profile?.email) {
    contactItems.push(`<a href="mailto:${escapeHtml(profile.email)}" style="color: #000; text-decoration: underline;">${escapeHtml(profile.email)}</a>`);
  }
  if (profile?.phone) {
    contactItems.push(`<a href="tel:${escapeHtml(profile.phone)}" style="color: #000; text-decoration: none;">${escapeHtml(profile.phone)}</a>`);
  }
  if (profile?.location) {
    contactItems.push(`<span>${escapeHtml(profile.location)}</span>`);
  }
  if (profile?.githubUrl) {
    const cleanGh = profile.githubUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const fullGh = profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`;
    contactItems.push(`<a href="${escapeHtml(fullGh)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">${escapeHtml(cleanGh)}</a>`);
  }
  const username = profile?.username || 'user';
  contactItems.push(`<a href="/u/${escapeHtml(username)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">folioryn.dev/u/${escapeHtml(username)}</a>`);

  if (profile?.linkedinUrl) {
    const cleanLi = profile.linkedinUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const fullLi = profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`;
    contactItems.push(`<a href="${escapeHtml(fullLi)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">${escapeHtml(cleanLi)}</a>`);
  }

  canvas.innerHTML = `
    <!-- Header -->
    <header class="a4-header" style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 class="a4-name" id="preview-resume-name" style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 4px 0; color: #000;">
        ${escapeHtml(profile?.fullName || 'Developer')}
      </h2>
      <div id="preview-resume-role" style="font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">
        ${escapeHtml(profile?.headline || 'Software Engineer — Full-Stack & Systems')}
      </div>
      <div class="a4-contact-bar" id="preview-contact-bar" style="font-size: 10px; color: #444; display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; overflow-wrap: anywhere; word-break: break-word;">
        ${contactItems.join(' <span>&bull;</span> ')}
      </div>
    </header>

    <!-- Professional Summary -->
    <section style="margin-bottom: 14px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Professional Summary
      </h3>
      <p id="preview-resume-summary" style="font-size: 10.5px; line-height: 1.5; color: #222; margin: 0; overflow-wrap: anywhere; word-break: break-word;">
        ${escapeHtml(profile?.bio || 'Building software applications, scalable architectures, and modern web interfaces with native web standards.')}
      </p>
    </section>

    <!-- Education & Academics -->
    <section style="margin-bottom: 14px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Education &amp; Academic Qualifications
      </h3>
      ${(education && education.length > 0) ? education.map(edu => `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #000; flex-wrap: wrap;">
            <span>${escapeHtml(edu.institution)}</span>
            <span>${escapeHtml(edu.startDate || '')} &ndash; ${escapeHtml(edu.currentlyStudying ? 'Present' : (edu.endDate || ''))}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #333; font-weight: 600; margin-top: 2px; flex-wrap: wrap;">
            <span>${escapeHtml(edu.qualification || '')}${edu.fieldOfStudy ? ` in ${escapeHtml(edu.fieldOfStudy)}` : ''}</span>
            ${edu.gradeValue ? `<span style="font-weight: 700; color: #111;">${escapeHtml(edu.gradeType || 'CGPA')}: ${escapeHtml(edu.gradeValue)} ${edu.gradeScale ? `/ ${escapeHtml(edu.gradeScale)}` : ''}</span>` : ''}
          </div>
          ${edu.coursework ? `
            <p style="font-size: 9.5px; color: #444; line-height: 1.4; margin: 3px 0 0 0; overflow-wrap: anywhere;">
              <strong>Coursework:</strong> ${escapeHtml(edu.coursework)}
            </p>
          ` : ''}
          ${edu.achievements ? `
            <p style="font-size: 9.5px; color: #444; line-height: 1.4; margin: 2px 0 0 0; overflow-wrap: anywhere;">
              <strong>Honors:</strong> ${escapeHtml(edu.achievements)}
            </p>
          ` : ''}
        </div>
      `).join('') : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No education records added yet.</p>
      `}
    </section>

    <!-- Technical Competencies -->
    <section style="margin-bottom: 14px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Technical Skills &amp; Competencies
      </h3>
      ${Object.keys(skillsByCategory).length > 0 ? `
        <ul class="a4-bullets" style="margin: 0; padding-left: 16px; font-size: 10px; line-height: 1.6; color: #222;">
          ${Object.entries(skillsByCategory).map(([cat, list]) => `
            <li style="margin-bottom: 2px; overflow-wrap: anywhere;">
              <strong style="text-transform: capitalize;">${escapeHtml(cat)}:</strong> ${escapeHtml(list.join(', '))}
            </li>
          `).join('')}
        </ul>
      ` : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No technical competencies added yet.</p>
      `}
    </section>

    <!-- Work & Engineering Experience -->
    <section style="margin-bottom: 14px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Engineering &amp; Work Experience
      </h3>
      ${(experiences && experiences.length > 0) ? experiences.map(exp => `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #000; flex-wrap: wrap;">
            <span>${escapeHtml(exp.organization || exp.company || '')}</span>
            <span>${escapeHtml(exp.startDate || '')} &ndash; ${escapeHtml(exp.currentlyActive ? 'Present' : (exp.endDate || ''))}</span>
          </div>
          <div style="font-size: 10.5px; color: #333; font-style: italic; margin-bottom: 3px;">
            ${escapeHtml(exp.role || '')}${exp.location ? ` &bull; ${escapeHtml(exp.location)}` : ''}
          </div>
          <p style="font-size: 10px; line-height: 1.45; color: #222; margin: 0; overflow-wrap: anywhere; word-break: break-word;">
            ${escapeHtml(exp.description || '')}
          </p>
        </div>
      `).join('') : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No work experience entries added yet.</p>
      `}
    </section>

    <!-- Selected Projects with Clickable URLs (Repo & Live Demo) -->
    <section style="margin-bottom: 12px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Selected Projects &amp; Systems
      </h3>
      ${featuredProjects.length > 0 ? featuredProjects.map(proj => {
        const repoUrl = proj.repo_url || proj.github_url || '';
        const liveUrl = proj.live_url || proj.demo_url || '';
        const cleanRepo = repoUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
        const cleanLive = liveUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');

        const projectLinks = [];
        if (repoUrl) {
          projectLinks.push(`<a href="${escapeHtml(repoUrl.startsWith('http') ? repoUrl : 'https://' + repoUrl)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline; font-weight: 600;">Repository: ${escapeHtml(cleanRepo)}</a>`);
        }
        if (liveUrl) {
          projectLinks.push(`<a href="${escapeHtml(liveUrl.startsWith('http') ? liveUrl : 'https://' + liveUrl)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline; font-weight: 600;">Live Demo: ${escapeHtml(cleanLive)}</a>`);
        }

        const primaryUrl = liveUrl || repoUrl;
        const formattedTitle = primaryUrl 
          ? `<a href="${escapeHtml(primaryUrl.startsWith('http') ? primaryUrl : 'https://' + primaryUrl)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: none; font-weight: 700;">${escapeHtml(proj.title)}</a>`
          : `<span>${escapeHtml(proj.title)}</span>`;

        return `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #000; flex-wrap: wrap; gap: 4px;">
              ${formattedTitle}
              ${projectLinks.length ? `<span style="font-family: monospace; font-size: 9.5px;">${projectLinks.join(' &bull; ')}</span>` : ''}
            </div>
            ${proj.tags && (Array.isArray(proj.tags) ? proj.tags.length : proj.tags) ? `
              <div style="font-size: 9.5px; color: #444; margin-top: 1px; margin-bottom: 2px;">
                <strong>Stack:</strong> ${escapeHtml(Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags)}
              </div>
            ` : ''}
            <p style="font-size: 10px; line-height: 1.4; color: #222; margin: 0; overflow-wrap: anywhere; word-break: break-word;">
              ${escapeHtml(proj.description || '')}
            </p>
          </div>
        `;
      }).join('') : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No showcase projects added yet.</p>
      `}
    </section>

    <!-- Certifications -->
    ${(certifications && certifications.length > 0) ? `
      <section>
        <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
          Certifications &amp; Credentials
        </h3>
        <ul class="a4-bullets" style="margin: 0; padding-left: 16px; font-size: 10px; line-height: 1.5; color: #222;">
          ${certifications.map(c => `
            <li style="overflow-wrap: anywhere;">
              <strong>${escapeHtml(c.title)}</strong> &ndash; ${escapeHtml(c.issuer)} (${escapeHtml(c.issueDate || 'Verified')})
              ${c.credentialUrl ? ` &bull; <a href="${escapeHtml(c.credentialUrl)}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">Verify</a>` : ''}
            </li>
          `).join('')}
        </ul>
      </section>
    ` : ''}
  `;
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
