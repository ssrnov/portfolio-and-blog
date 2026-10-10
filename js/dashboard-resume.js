/**
 * BuildLab — Dynamic ATS Resume Builder Controller
 * Synchronizes user data (Profile, Education with CGPA, Categorized Skills, Projects, Experience)
 * directly with the real-time A4 document canvas and handles ATS Vector PDF print triggers.
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
  if (email) items.push(`<span>${escapeHtml(email)}</span>`);
  if (phone) items.push(`<span>${escapeHtml(phone)}</span>`);
  if (loc) items.push(`<span>${escapeHtml(loc)}</span>`);
  if (profile?.githubUrl) {
    const cleanGh = profile.githubUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    items.push(`<span>${escapeHtml(cleanGh)}</span>`);
  }
  const username = profile?.username || 'user';
  items.push(`<span>folioryn.dev/u/${escapeHtml(username)}</span>`);

  if (bar) {
    bar.innerHTML = items.join(' <span>&bull;</span> ');
  }
}

function renderA4Canvas({ profile, education, skills, experiences, certifications, projects }) {
  const canvas = document.getElementById('a4-canvas');
  if (!canvas) return;

  // Group skills by category
  const skillsByCategory = {};
  (skills || []).forEach(s => {
    const cat = s.category || 'Competencies';
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(s.name);
  });

  const featuredProjects = (projects || []).slice(0, 3);
  const contactItems = [];
  if (profile.email) contactItems.push(`<span>${escapeHtml(profile.email)}</span>`);
  if (profile.phone) contactItems.push(`<span>${escapeHtml(profile.phone)}</span>`);
  if (profile.location) contactItems.push(`<span>${escapeHtml(profile.location)}</span>`);
  if (profile.githubUrl) {
    const cleanGh = profile.githubUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    contactItems.push(`<span>${escapeHtml(cleanGh)}</span>`);
  }
  contactItems.push(`<span>folioryn.dev/u/${escapeHtml(profile.username || 'user')}</span>`);

  canvas.innerHTML = `
    <!-- Header -->
    <header class="a4-header" style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 class="a4-name" id="preview-resume-name" style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 4px 0; color: #000;">
        ${escapeHtml(profile.fullName || 'Developer')}
      </h2>
      <div id="preview-resume-role" style="font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">
        ${escapeHtml(profile.headline || 'Software Engineer — Full-Stack & Systems')}
      </div>
      <div class="a4-contact-bar" id="preview-contact-bar" style="font-size: 10px; color: #555; display: flex; justify-content: center; flex-wrap: wrap; gap: 6px;">
        ${contactItems.join(' <span>&bull;</span> ')}
      </div>
    </header>

    <!-- Professional Summary -->
    <section style="margin-bottom: 14px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Professional Summary
      </h3>
      <p id="preview-resume-summary" style="font-size: 10.5px; line-height: 1.5; color: #222; margin: 0;">
        ${escapeHtml(profile.bio || 'Building software applications, scalable architectures, and modern web interfaces with native web standards.')}
      </p>
    </section>

    <!-- Education & Academics -->
    <section style="margin-bottom: 14px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Education &amp; Academic Qualifications
      </h3>
      ${(education && education.length > 0) ? education.map(edu => `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #000;">
            <span>${escapeHtml(edu.institution)}</span>
            <span>${escapeHtml(edu.startDate)} &ndash; ${escapeHtml(edu.currentlyStudying ? 'Present' : edu.endDate)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #333; font-weight: 600; margin-top: 2px;">
            <span>${escapeHtml(edu.qualification)} in ${escapeHtml(edu.fieldOfStudy)}</span>
            ${edu.gradeValue ? `<span style="font-weight: 700; color: #111;">${escapeHtml(edu.gradeType || 'CGPA')}: ${escapeHtml(edu.gradeValue)} ${edu.gradeScale ? `/ ${escapeHtml(edu.gradeScale)}` : ''}</span>` : ''}
          </div>
          ${edu.coursework ? `
            <p style="font-size: 9.5px; color: #444; line-height: 1.4; margin: 3px 0 0 0;">
              <strong>Coursework:</strong> ${escapeHtml(edu.coursework)}
            </p>
          ` : ''}
          ${edu.achievements ? `
            <p style="font-size: 9.5px; color: #444; line-height: 1.4; margin: 2px 0 0 0;">
              <strong>Honors:</strong> ${escapeHtml(edu.achievements)}
            </p>
          ` : ''}
        </div>
      `).join('') : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No education records added yet. Add them in the Education manager.</p>
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
            <li style="margin-bottom: 2px;">
              <strong style="text-transform: capitalize;">${escapeHtml(cat)}:</strong> ${escapeHtml(list.join(', '))}
            </li>
          `).join('')}
        </ul>
      ` : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No technical competencies added yet. Add them in the Skills manager.</p>
      `}
    </section>

    <!-- Work & Engineering Experience -->
    <section style="margin-bottom: 14px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Engineering Experience
      </h3>
      ${(experiences && experiences.length > 0) ? experiences.map(exp => `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #000;">
            <span>${escapeHtml(exp.organization)}</span>
            <span>${escapeHtml(exp.startDate)} &ndash; ${escapeHtml(exp.currentlyActive ? 'Present' : exp.endDate)}</span>
          </div>
          <div style="font-size: 10.5px; color: #333; font-style: italic; margin-bottom: 3px;">
            ${escapeHtml(exp.role)} &bull; ${escapeHtml(exp.location || 'Remote')}
          </div>
          <p style="font-size: 10px; line-height: 1.45; color: #222; margin: 0;">
            ${escapeHtml(exp.description)}
          </p>
        </div>
      `).join('') : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No work experience entries added yet. Add them in the Experience manager.</p>
      `}
    </section>

    <!-- Featured Projects -->
    <section style="margin-bottom: 12px;">
      <h3 class="a4-section-title" style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
        Selected Projects
      </h3>
      ${featuredProjects.length > 0 ? featuredProjects.map(proj => `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #000;">
            <span>${escapeHtml(proj.title)}</span>
            <span style="font-family: monospace; font-size: 9.5px; color: #444;">${escapeHtml(proj.repo_url?.replace('https://', '') || '')}</span>
          </div>
          ${proj.tags && proj.tags.length ? `
            <div style="font-size: 9.5px; color: #555; margin-bottom: 2px;">
              <strong>Stack:</strong> ${escapeHtml(Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags)}
            </div>
          ` : ''}
          <p style="font-size: 10px; line-height: 1.4; color: #222; margin: 0;">
            ${escapeHtml(proj.description || '')}
          </p>
        </div>
      `).join('') : `
        <p style="font-size: 10px; color: #666; font-style: italic; margin: 0;">No showcase projects added yet. Add them in the Projects manager.</p>
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
            <li>
              <strong>${escapeHtml(c.title)}</strong> &ndash; ${escapeHtml(c.issuer)} (${escapeHtml(c.issueDate || 'Verified')})
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
