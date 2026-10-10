/**
 * BuildLab — Skills Matrix Controller
 * TechSpace BuildLab B04
 */

import { getSkills, addSkillItem, deleteSkillItem } from './profile-data.js';

const CATEGORY_NAMES = {
  languages: "Programming Languages",
  frontend: "Frontend & Web",
  backend: "Backend & Systems",
  databases: "Databases & Storage",
  cloud: "Cloud & DevOps",
  design: "UI/UX & Design",
  tools: "Tools & Methodologies",
  other: "Other Competencies"
};

document.addEventListener('DOMContentLoaded', () => {
  renderSkillsMatrix();
  initAddSkillForm();
  initPresetButtons();
});

function renderSkillsMatrix() {
  const container = document.getElementById('skills-matrix-container');
  if (!container) return;

  const skills = getSkills();

  // Group by category
  const grouped = {};
  Object.keys(CATEGORY_NAMES).forEach(cat => grouped[cat] = []);

  skills.forEach(skill => {
    const cat = skill.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(skill);
  });

  let html = '';

  Object.entries(CATEGORY_NAMES).forEach(([catKey, catTitle]) => {
    const items = grouped[catKey] || [];
    if (items.length === 0) return;

    html += `
      <div class="floating-card" style="margin-bottom: var(--space-4); background: var(--bg-surface); padding: var(--space-5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
          <h3 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin: 0; text-transform: uppercase; font-family: var(--font-mono);">
            ${catTitle} (${items.length})
          </h3>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
          ${items.map(item => `
            <div style="display: inline-flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 4px 10px; border-radius: var(--radius-sm); font-size: var(--text-xs);">
              <span style="font-weight: 600; color: var(--text-primary);">${escapeHtml(item.name)}</span>
              ${item.proficiency ? `<span style="font-size: 10px; color: var(--accent-primary); font-family: var(--font-mono);">${escapeHtml(item.proficiency)}</span>` : ''}
              ${item.years ? `<span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(item.years)}y</span>` : ''}
              <button type="button" class="delete-skill-btn" data-id="${item.id}" aria-label="Delete ${escapeHtml(item.name)}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0; font-size: 14px; line-height: 1;">&times;</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  if (skills.length === 0) {
    html = `
      <div style="text-align: center; padding: var(--space-8); background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
        <p style="color: var(--text-secondary); margin-bottom: var(--space-4);">No skills added yet. Use the presets below or add custom skills.</p>
      </div>
    `;
  }

  container.innerHTML = html;

  // Attach delete handlers
  container.querySelectorAll('.delete-skill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteSkillItem(id);
      renderSkillsMatrix();
      showToast('Skill removed');
    });
  });
}

function initAddSkillForm() {
  const form = document.getElementById('add-skill-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('skill-name');
    const categorySelect = document.getElementById('skill-category');
    const proficiencySelect = document.getElementById('skill-proficiency');
    const yearsInput = document.getElementById('skill-years');

    const name = nameInput.value.trim();
    if (!name) return;

    addSkillItem({
      name,
      category: categorySelect.value,
      proficiency: proficiencySelect.value,
      years: yearsInput.value.trim()
    });

    nameInput.value = '';
    yearsInput.value = '';
    renderSkillsMatrix();
    showToast(`Added ${name} to your skills`);
  });
}

function initPresetButtons() {
  const container = document.getElementById('skill-presets-container');
  if (!container) return;

  const PRESETS = [
    { name: "TypeScript", cat: "languages", prof: "Advanced" },
    { name: "Python", cat: "languages", prof: "Advanced" },
    { name: "React", cat: "frontend", prof: "Expert" },
    { name: "Node.js", cat: "backend", prof: "Expert" },
    { name: "PostgreSQL", cat: "databases", prof: "Advanced" },
    { name: "Docker", cat: "cloud", prof: "Intermediate" },
    { name: "AWS", cat: "cloud", prof: "Intermediate" },
    { name: "Figma", cat: "design", prof: "Advanced" },
    { name: "Git", cat: "tools", prof: "Expert" }
  ];

  container.innerHTML = PRESETS.map(p => `
    <button type="button" class="btn btn-secondary btn-sm preset-pill" data-name="${p.name}" data-cat="${p.cat}" data-prof="${p.prof}" style="font-size: 11px; padding: 4px 10px;">
      + ${p.name}
    </button>
  `).join('');

  container.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const name = pill.getAttribute('data-name');
      const cat = pill.getAttribute('data-cat');
      const prof = pill.getAttribute('data-prof');

      addSkillItem({
        name,
        category: cat,
        proficiency: prof,
        years: "2"
      });

      pill.disabled = true;
      pill.style.opacity = '0.5';
      renderSkillsMatrix();
      showToast(`Added ${name}`);
    });
  });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'dashboard-toast';
  toast.textContent = msg;
  toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: var(--bg-surface); border: 1px solid var(--accent-primary); color: var(--text-primary); padding: 10px 18px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-size: 13px; z-index: 9999; animation: fadeIn 0.2s ease;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
