/**
 * BuildLab — Education & Academic Profile Controller
 * TechSpace BuildLab B04
 */

import { getEducation, addEducationItem, deleteEducationItem, saveEducation } from './profile-data.js';

document.addEventListener('DOMContentLoaded', () => {
  renderEducationList();
  initAddEducationForm();
});

function renderEducationList() {
  const container = document.getElementById('education-list-container');
  if (!container) return;

  const list = getEducation();

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-10); background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
        <p style="color: var(--text-secondary); margin-bottom: var(--space-4);">No education records added yet.</p>
        <button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('add-education-dialog').showModal()">
          + Add Your First Education Record
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((item) => `
    <article class="floating-card" style="margin-bottom: var(--space-4); background: var(--bg-surface); border: 1px solid var(--border-color);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2); flex-wrap: wrap; gap: var(--space-2);">
        <div>
          <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px;">
            <span class="badge" style="text-transform: capitalize; font-size: 10px;">${item.institutionType || 'University'}</span>
            <span class="badge" style="font-family: var(--font-mono); font-size: 10px;">${item.startDate} &ndash; ${item.currentlyStudying ? 'Present' : (item.endDate || 'Completed')}</span>
            ${item.displayOnPortfolio !== false ? '<span style="font-size: 10px; color: #27c93f; font-family: var(--font-mono);">&#10003; Public</span>' : '<span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">&#128274; Hidden</span>'}
          </div>
          <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0;">
            ${escapeHtml(item.institution)}
          </h3>
          <p style="font-size: var(--text-xs); color: var(--accent-primary); margin: 0; font-weight: 600;">
            ${escapeHtml(item.qualification)} &bull; ${escapeHtml(item.fieldOfStudy || '')}
          </p>
        </div>

        <div style="display: flex; gap: var(--space-2);">
          <button type="button" class="btn btn-secondary btn-sm delete-edu-btn" data-id="${item.id}" style="padding: 4px 10px; font-size: 11px;">
            Delete
          </button>
        </div>
      </div>

      <!-- Grade / Score Callout -->
      ${item.gradeValue ? `
        <div style="display: inline-flex; align-items: center; gap: 6px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); padding: 4px 10px; border-radius: var(--radius-sm); margin: var(--space-2) 0; font-family: var(--font-mono); font-size: var(--text-xs);">
          <span style="color: var(--text-muted);">${item.gradeType || 'CGPA'}:</span>
          <strong style="color: var(--accent-primary); font-weight: 700;">${escapeHtml(item.gradeValue)} ${item.gradeScale ? `/ ${escapeHtml(item.gradeScale)}` : ''}</strong>
        </div>
      ` : ''}

      ${item.coursework ? `
        <div style="margin-top: var(--space-2); font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-relaxed);">
          <strong>Coursework:</strong> ${escapeHtml(item.coursework)}
        </div>
      ` : ''}

      ${item.achievements ? `
        <div style="margin-top: var(--space-1); font-size: var(--text-xs); color: var(--text-muted); line-height: var(--leading-relaxed);">
          <strong>Achievements:</strong> ${escapeHtml(item.achievements)}
        </div>
      ` : ''}
    </article>
  `).join('');

  // Attach delete handlers
  container.querySelectorAll('.delete-edu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this education record?')) {
        deleteEducationItem(id);
        renderEducationList();
        showToast('Education record deleted');
      }
    });
  });
}

function initAddEducationForm() {
  const form = document.getElementById('add-education-form');
  const dialog = document.getElementById('add-education-dialog');
  const openBtn = document.getElementById('open-add-dialog-btn');
  const closeBtn = document.getElementById('close-add-dialog-btn');
  const currentlyStudyingCheckbox = document.getElementById('edu-currently-studying');
  const endDateInput = document.getElementById('edu-end-date');

  if (openBtn && dialog) {
    openBtn.addEventListener('click', () => dialog.showModal());
  }

  if (closeBtn && dialog) {
    closeBtn.addEventListener('click', () => dialog.close());
  }

  if (currentlyStudyingCheckbox && endDateInput) {
    currentlyStudyingCheckbox.addEventListener('change', (e) => {
      endDateInput.disabled = e.target.checked;
      if (e.target.checked) endDateInput.value = '';
    });
  }

  if (form && dialog) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const institution = document.getElementById('edu-institution').value.trim();
      const institutionType = document.getElementById('edu-type').value;
      const qualification = document.getElementById('edu-qualification').value.trim();
      const fieldOfStudy = document.getElementById('edu-field').value.trim();
      const startDate = document.getElementById('edu-start-date').value;
      const endDate = document.getElementById('edu-end-date').value;
      const currentlyStudying = document.getElementById('edu-currently-studying').checked;
      const gradeType = document.getElementById('edu-grade-type').value;
      const gradeValue = document.getElementById('edu-grade-val').value.trim();
      const gradeScale = document.getElementById('edu-grade-scale').value.trim();
      const coursework = document.getElementById('edu-coursework').value.trim();
      const achievements = document.getElementById('edu-achievements').value.trim();
      const displayOnPortfolio = document.getElementById('edu-display').checked;

      if (!institution || !qualification) {
        alert('Please fill in institution and qualification/degree.');
        return;
      }

      addEducationItem({
        institution,
        institutionType,
        qualification,
        fieldOfStudy,
        startDate,
        endDate,
        currentlyStudying,
        gradeType,
        gradeValue,
        gradeScale,
        coursework,
        achievements,
        displayOnPortfolio
      });

      form.reset();
      dialog.close();
      renderEducationList();
      showToast('Education record added successfully!');
    });
  }
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
