/**
 * Folioryn — Dynamic Multi-Tenant Public Portfolio Engine
 * Resolves /u/:username and ?u=:username routes, queries Supabase/multi-user storage,
 * enforces published/draft visibility gates, renders template archetypes dynamically,
 * and displays clean user-scoped states without leaking demo data.
 */

import { portfolioService, contactService } from './supabase.js';
import { getUserDataBySlug, getActiveUser } from './profile-data.js';

document.addEventListener('DOMContentLoaded', async () => {
  const username = extractUsernameSlug();
  if (!username) {
    window.location.href = '/templates/';
    return;
  }

  // Check for template override query param (from template showroom preview)
  const urlParams = new URLSearchParams(window.location.search);
  const templateOverride = urlParams.get('template');

  try {
    // 1. Retrieve user data via multi-tenant resolver
    let userData = getUserDataBySlug(username);

    // Fallback to Supabase portfolio query if not found locally
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
          certifications: [],
          publishSettings: {
            isPublished: dbPort.is_published !== false,
            templateId: dbPort.template_id || 'minimal-professional'
          }
        };
      }
    }

    if (!userData) {
      renderNotFoundState(username);
      return;
    }

    // 2. Enforce Visibility Gate: Check if portfolio is published
    const isPublished = userData.publishSettings?.isPublished !== false;
    const isOwnerSession = isCurrentSessionOwner(username);

    if (!isPublished && !isOwnerSession) {
      renderPrivatePortfolioState(username);
      return;
    }

    // 3. Render Portfolio with template
    const templateId = templateOverride || userData.publishSettings?.templateId || 'minimal-professional';
    renderPortfolio(userData, username, templateId);

    // 4. Bind Public Contact Form
    bindPublicContactForm(username);

  } catch (err) {
    console.error('Error rendering public portfolio:', err);
    renderNotFoundState(username);
  }
});

function isCurrentSessionOwner(username) {
  try {
    const raw = localStorage.getItem('profilefolio_session') || localStorage.getItem('ssrnovx_mock_session');
    if (!raw) return false;
    const user = JSON.parse(raw);
    return (user.username || '').toLowerCase() === username.toLowerCase();
  } catch (e) {
    return false;
  }
}

function extractUsernameSlug() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const segments = path.split('/');
  
  // Format: /u/:username
  const uIndex = segments.indexOf('u');
  if (uIndex !== -1 && segments[uIndex + 1]) {
    const seg = decodeURIComponent(segments[uIndex + 1]);
    if (seg && seg !== 'index.html') return seg.toLowerCase();
  }

  // Fallback to query param: ?u=username or ?username=username
  const params = new URLSearchParams(window.location.search);
  if (params.get('u')) return params.get('u').trim().toLowerCase();
  if (params.get('username')) return params.get('username').trim().toLowerCase();

  // If on /u/sunny specifically, default to sunny
  if (window.location.pathname.includes('/u/sunny')) return 'sunny';

  // If user is currently logged in and on /u/, show THEIR portfolio
  const activeUser = getActiveUser();
  if (activeUser?.username) return activeUser.username.toLowerCase();

  return null;
}

function renderPortfolio(data, username, templateId) {
  const profile = data.profile || {};
  const displayName = profile.fullName || profile.displayName || profile.display_name || username;
  const headline = profile.headline || 'Software Engineer & Builder';
  const bio = profile.bio || 'Building software applications with modern web standards.';

  // 1. Update Document Title & SEO
  document.title = `${displayName} (@${username}) | Folioryn`;

  // 2. Apply Template Archetype Style
  document.documentElement.setAttribute('data-template', templateId);
  document.body.className = `template-${templateId}`;

  // 3. Text & Bio Targets
  document.querySelectorAll('[data-builder-target="display_name"]').forEach((el) => {
    el.textContent = displayName;
  });

  document.querySelectorAll('[data-builder-target="headline"]').forEach((el) => {
    el.textContent = headline;
  });

  document.querySelectorAll('[data-builder-target="bio"]').forEach((el) => {
    el.textContent = bio;
  });

  if (profile.location) {
    document.querySelectorAll('[data-builder-target="location"]').forEach((el) => {
      el.textContent = profile.location;
    });
  }

  // 4. Links
  if (profile.githubUrl) {
    document.querySelectorAll('[data-builder-target="github_url"]').forEach((el) => {
      el.setAttribute('href', profile.githubUrl);
      el.style.display = '';
    });
  } else {
    document.querySelectorAll('[data-builder-target="github_url"]').forEach((el) => {
      el.style.display = 'none';
    });
  }

  const effectiveEmail = profile.email || '';
  if (effectiveEmail) {
    document.querySelectorAll('[data-builder-target="contact_email"]').forEach((el) => {
      el.setAttribute('href', `mailto:${effectiveEmail}`);
      el.style.display = '';
      if (el.textContent.includes('Email:')) {
        el.textContent = `Email: ${effectiveEmail}`;
      }
    });
  } else {
    document.querySelectorAll('[data-builder-target="contact_email"]').forEach((el) => {
      el.style.display = 'none';
    });
  }

  // 5. Update Header Slug Mark
  document.querySelectorAll('.logo-text').forEach((el) => {
    el.textContent = username;
  });

  // 6. Dynamic Hero Highlights
  renderHighlightsBar(data, username);

  // 7. Render Dynamic Education
  renderEducationSection(data.education, username);

  // 8. Render Dynamic Projects
  renderProjectsSection(data.projects, username);

  // 9. Render Dynamic Skills
  renderSkillsSection(data.skills, username);
}

function renderHighlightsBar(data, username) {
  const bar = document.getElementById('hero-highlights-bar');
  if (!bar) return;

  const projectCount = (data.projects || []).length;
  const skillCount = (data.skills || []).length;
  const eduCount = (data.education || []).length;
  const status = data.profile?.availability || 'Open to Work';

  bar.innerHTML = `
    <div>
      <div style="font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">${projectCount} Showcase</div>
      <div style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase;">Public Projects</div>
    </div>
    <div>
      <div style="font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">${skillCount} Skills</div>
      <div style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase;">Technical Stack</div>
    </div>
    <div>
      <div style="font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">${eduCount} Records</div>
      <div style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase;">Academics &amp; Certs</div>
    </div>
    <div>
      <div style="font-family: var(--font-mono); font-size: var(--text-base); font-weight: 800; color: var(--text-primary); line-height: 1.4;">${escapeHtml(status)}</div>
      <div style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase;">Status</div>
    </div>
  `;
}

function renderEducationSection(educationList, username) {
  const section = document.getElementById('education');
  if (!section) return;

  const container = document.getElementById('portfolio-education-container') ||
                    section.querySelector('.container > div[style*="flex-direction: column"]');
  if (!container) return;

  const isSunny = username === 'sunny';

  if (!educationList || educationList.length === 0) {
    if (!isSunny) {
      container.innerHTML = `
        <div style="padding: var(--space-8); border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); background-color: var(--bg-surface);">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: var(--text-secondary); font-size: var(--text-sm);">No academic records added yet</p>
          <span style="font-size: 11px; font-family: var(--font-mono);">Education details will appear here once added in the dashboard.</span>
        </div>
      `;
    }
    return;
  }

  container.innerHTML = educationList
    .filter(item => item.displayOnPortfolio !== false)
    .map(item => `
      <div style="padding: var(--space-6); border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-surface); margin-bottom: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="badge" style="font-size: 10px; margin-bottom: 4px; display: inline-block; text-transform: capitalize;">${escapeHtml(item.institutionType || 'University')}</span>
            <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); margin: 0;">${escapeHtml(item.institution)}</h3>
            <p style="font-size: var(--text-sm); color: var(--accent-primary); font-weight: 600; margin: 2px 0 0 0;">${escapeHtml(item.qualification)} &bull; ${escapeHtml(item.fieldOfStudy || '')}</p>
          </div>
          <div style="text-align: right;">
            <span class="badge" style="font-family: var(--font-mono);">${item.startDate} &ndash; ${item.currentlyStudying ? 'Present' : (item.endDate || 'Completed')}</span>
            ${item.gradeValue ? `
              <div style="margin-top: 4px; font-family: var(--font-mono); font-size: 12px; color: var(--accent-primary); font-weight: 700;">
                ${escapeHtml(item.gradeType || 'CGPA')}: ${escapeHtml(item.gradeValue)} ${item.gradeScale ? `/ ${escapeHtml(item.gradeScale)}` : ''}
              </div>
            ` : ''}
          </div>
        </div>
        ${item.coursework ? `
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-relaxed); margin: var(--space-3) 0 0 0;">
            <strong>Coursework:</strong> ${escapeHtml(item.coursework)}
          </p>
        ` : ''}
        ${item.achievements ? `
          <p style="font-size: var(--text-xs); color: var(--text-muted); line-height: var(--leading-relaxed); margin: 4px 0 0 0;">
            <strong>Honors:</strong> ${escapeHtml(item.achievements)}
          </p>
        ` : ''}
      </div>
    `).join('');
}

function renderProjectsSection(projectsList, username) {
  const section = document.getElementById('projects');
  if (!section) return;

  const grid = document.getElementById('portfolio-projects-container') ||
               section.querySelector('.container > div[style*="display: grid"]');
  if (!grid) return;

  const isSunny = username === 'sunny';

  if (!projectsList || projectsList.length === 0) {
    if (!isSunny) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: var(--space-10) var(--space-6); border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); background-color: var(--bg-surface);">
          <p style="margin: 0 0 6px 0; font-weight: 700; font-size: var(--text-base); color: var(--text-primary);">No public projects showcased yet</p>
          <p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary);">Projects added from GitHub or the dashboard will be displayed here.</p>
        </div>
      `;
    }
    return;
  }

  grid.innerHTML = projectsList.map(proj => {
    const tagsHtml = Array.isArray(proj.tags)
      ? proj.tags.map(t => `<span class="badge" style="font-size: 10px;">${escapeHtml(t)}</span>`).join(' ')
      : '';

    const repo = proj.repo_url || proj.githubUrl || '';
    const live = proj.live_url || proj.liveUrl || '';

    return `
      <article class="project-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-6); background-color: var(--bg-surface); display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3);">
          <span class="badge" style="font-family: var(--font-mono); font-size: 11px;">${escapeHtml(proj.category || 'Software')}</span>
          ${proj.stars_count ? `<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">&star; ${proj.stars_count}</span>` : ''}
        </div>
        <h3 style="font-size: var(--text-xl); font-weight: 700; margin-bottom: var(--space-2); color: var(--text-primary);">
          ${escapeHtml(proj.title)}
        </h3>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-4); flex-grow: 1;">
          ${escapeHtml(proj.description || '')}
        </p>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: var(--space-4);">
          ${tagsHtml}
        </div>
        <div style="display: flex; gap: var(--space-3); border-top: 1px solid var(--border-subtle); padding-top: var(--space-4); margin-top: auto;">
          ${repo ? `<a href="${repo}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-card" style="font-size: var(--text-xs); padding: 4px 12px;">GitHub &nearr;</a>` : ''}
          ${live ? `<a href="${live}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-card" style="font-size: var(--text-xs); padding: 4px 12px;">Live Demo &nearr;</a>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function renderSkillsSection(skillsList, username) {
  const section = document.getElementById('skills');
  if (!section) return;

  const grid = document.getElementById('portfolio-skills-container') ||
               section.querySelector('.container > div[style*="display: grid"]');
  if (!grid) return;

  const isSunny = username === 'sunny';

  if (!skillsList || skillsList.length === 0) {
    if (!isSunny) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: var(--space-8); border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); background-color: var(--bg-surface);">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: var(--text-secondary); font-size: var(--text-sm);">No technical skills added yet</p>
          <span style="font-size: 11px; font-family: var(--font-mono);">Skills matrix will appear here once configured.</span>
        </div>
      `;
    }
    return;
  }

  // Group skills by category
  const categories = {};
  skillsList.forEach(s => {
    const cat = s.category || 'Competencies';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(s);
  });

  grid.innerHTML = Object.entries(categories).map(([catName, items]) => `
    <div style="padding: var(--space-6); border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-surface);">
      <h3 style="font-size: var(--text-base); font-weight: 700; margin-bottom: var(--space-4); color: var(--text-primary); text-transform: capitalize;">
        ${escapeHtml(catName)}
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${items.map(i => `
          <span class="badge" style="font-size: 11px; padding: 4px 8px;">
            ${escapeHtml(i.name)}
            ${i.proficiency ? `<span style="color: var(--text-muted); font-size: 10px;"> &bull; ${escapeHtml(i.proficiency)}</span>` : ''}
          </span>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function bindPublicContactForm(username) {
  const form = document.getElementById('public-contact-form') || document.getElementById('portfolio-contact-form');
  const statusEl = document.getElementById('contact-form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    const senderName = nameInput?.value.trim();
    const senderEmail = emailInput?.value.trim();
    const subject = subjectInput?.value.trim() || 'Portfolio Inquiry';
    const message = messageInput?.value.trim();

    if (!senderName || !senderEmail || !message) {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#ef4444';
        statusEl.textContent = 'Please fill out all required fields.';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Message...';
    }

    try {
      await contactService.submitMessage(username, {
        senderName,
        senderEmail,
        subject,
        message
      });

      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#22c55e';
        statusEl.textContent = '✓ Message received! The portfolio owner has been notified.';
      }
      form.reset();
    } catch (err) {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#ef4444';
        statusEl.textContent = 'Could not send message. Please try again.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span> <span aria-hidden="true">&rarr;</span>';
      }
    }
  });
}

function renderPrivatePortfolioState(username) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <section class="section-py" style="padding-top: var(--space-24); padding-bottom: var(--space-24); text-align: center;">
      <div class="container" style="max-width: 640px; margin: 0 auto;">
        <span class="badge" style="font-family: var(--font-mono); margin-bottom: var(--space-4); border-color: rgba(255, 95, 86, 0.4); color: #ff5f56;">
          &bull; Private Portfolio Draft
        </span>
        <h1 style="font-size: var(--text-4xl); font-weight: 800; color: var(--text-primary); margin-bottom: var(--space-4);">
          @${escapeHtml(username)}'s Portfolio is Private
        </h1>
        <p style="font-size: var(--text-base); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-8);">
          This portfolio is currently saved as an unpublished draft by the author and is not available for public discovery.
        </p>
        <div style="display: flex; justify-content: center; gap: var(--space-4); flex-wrap: wrap;">
          <a href="/" class="btn btn-primary btn-card">Explore Folioryn &rarr;</a>
          <a href="/login/" class="btn btn-secondary btn-card">Author Sign In</a>
        </div>
      </div>
    </section>
  `;
}

function renderNotFoundState(username) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <section class="section-py" style="padding-top: var(--space-24); padding-bottom: var(--space-24); text-align: center;">
      <div class="container" style="max-width: 640px; margin: 0 auto;">
        <span class="badge" style="font-family: var(--font-mono); margin-bottom: var(--space-4);">404 &bull; Profile Not Found</span>
        <h1 style="font-size: var(--text-4xl); font-weight: 800; color: var(--text-primary); margin-bottom: var(--space-4);">
          @${escapeHtml(username)} is not registered yet
        </h1>
        <p style="font-size: var(--text-base); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-8);">
          The developer handle <strong>/u/${escapeHtml(username)}</strong> is available. Create your developer portfolio with 1-click GitHub import and claim this URL now.
        </p>
        <div style="display: flex; justify-content: center; gap: var(--space-4); flex-wrap: wrap;">
          <a href="/signup/" class="btn btn-primary btn-card">Claim /u/${escapeHtml(username)} &rarr;</a>
          <a href="/explore/" class="btn btn-secondary btn-card">Browse Community Directory</a>
        </div>
      </div>
    </section>
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
