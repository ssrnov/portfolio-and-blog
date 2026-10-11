/**
 * BuildLab — Experience & Certifications Controller
 * TechSpace BuildLab B04
 */

import {
  getExperiences,
  addExperienceItem,
  updateExperienceItem,
  deleteExperienceItem,
  getCertifications,
  addCertificationItem,
  updateCertificationItem,
  deleteCertificationItem
} from './profile-data.js';

document.addEventListener('DOMContentLoaded', () => {
  renderExperiences();
  renderCertifications();
  initExperienceForm();
  initCertificationForm();
});

function renderExperiences() {
  const container = document.getElementById('experience-list-container');
  if (!container) return;

  const list = getExperiences();

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-8); background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
        <p style="color: var(--text-secondary); margin-bottom: var(--space-4);">No work experience or internships added yet.</p>
        <button type="button" class="btn btn-primary btn-sm" id="empty-add-exp-btn">+ Add First Role</button>
      </div>
    `;
    document.getElementById('empty-add-exp-btn')?.addEventListener('click', () => openExperienceDialogForAdd());
    return;
  }

  container.innerHTML = list.map(item => `
    <article class="floating-card" style="margin-bottom: var(--space-4); background: var(--bg-surface);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2); flex-wrap: wrap; gap: var(--space-2);">
        <div>
          <span class="badge" style="font-family: var(--font-mono); font-size: 10px; margin-bottom: 4px; display: inline-block;">
            ${item.startDate} &ndash; ${item.currentlyActive ? 'Present' : (item.endDate || '')}
          </span>
          <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0;">
            ${escapeHtml(item.role)} &bull; ${escapeHtml(item.organization)}
          </h3>
          ${item.location ? `<p style="font-size: 11px; color: var(--text-muted); margin: 0;">${escapeHtml(item.location)}</p>` : ''}
        </div>

        <div style="display: flex; gap: var(--space-2);">
          <button type="button" class="btn btn-secondary btn-sm edit-exp-btn" data-id="${item.id}" style="padding: 4px 10px; font-size: 11px;">
            Edit
          </button>
          <button type="button" class="btn btn-secondary btn-sm delete-exp-btn" data-id="${item.id}" style="padding: 4px 10px; font-size: 11px; color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">
            Delete
          </button>
        </div>
      </div>

      <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-relaxed); margin: var(--space-2) 0 0 0;">
        ${escapeHtml(item.description)}
      </p>
    </article>
  `).join('');

  container.querySelectorAll('.edit-exp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = list.find(ex => ex.id === id);
      if (item) openExperienceDialogForEdit(item);
    });
  });

  container.querySelectorAll('.delete-exp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this role?')) {
        deleteExperienceItem(id);
        renderExperiences();
        showToast('Experience deleted');
      }
    });
  });
}

function openExperienceDialogForAdd() {
  const form = document.getElementById('add-exp-form');
  const dialog = document.getElementById('add-exp-dialog');
  const title = document.getElementById('exp-dialog-title');
  const editIdInput = document.getElementById('exp-edit-id');
  const submitBtn = document.getElementById('exp-submit-btn');

  if (form) form.reset();
  if (editIdInput) editIdInput.value = '';
  if (title) title.textContent = 'Add Work Experience';
  if (submitBtn) submitBtn.textContent = 'Save Experience';

  const endInput = document.getElementById('exp-end');
  if (endInput) endInput.disabled = false;

  dialog?.showModal();
}

function openExperienceDialogForEdit(item) {
  const dialog = document.getElementById('add-exp-dialog');
  const title = document.getElementById('exp-dialog-title');
  const editIdInput = document.getElementById('exp-edit-id');
  const submitBtn = document.getElementById('exp-submit-btn');

  if (editIdInput) editIdInput.value = item.id;
  if (title) title.textContent = 'Edit Work Experience';
  if (submitBtn) submitBtn.textContent = 'Update Experience';

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('exp-org', item.organization);
  setVal('exp-role', item.role);
  setVal('exp-start', item.startDate);
  setVal('exp-end', item.endDate);

  const currentCheckbox = document.getElementById('exp-current');
  const endInput = document.getElementById('exp-end');
  if (currentCheckbox) {
    currentCheckbox.checked = Boolean(item.currentlyActive);
    if (endInput) endInput.disabled = Boolean(item.currentlyActive);
  }

  setVal('exp-location', item.location);
  setVal('exp-desc', item.description);

  dialog?.showModal();
}

function renderCertifications() {
  const container = document.getElementById('certifications-list-container');
  if (!container) return;

  const list = getCertifications();

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-8); background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
        <p style="color: var(--text-secondary); margin-bottom: var(--space-4);">No certifications or awards listed.</p>
        <button type="button" class="btn btn-primary btn-sm" id="empty-add-cert-btn">+ Add Certification</button>
      </div>
    `;
    document.getElementById('empty-add-cert-btn')?.addEventListener('click', () => openCertificationDialogForAdd());
    return;
  }

  container.innerHTML = list.map(item => `
    <article class="floating-card" style="margin-bottom: var(--space-3); background: var(--bg-surface); padding: var(--space-4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
      <div>
        <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0;">${escapeHtml(item.title)}</h4>
        <p style="font-size: 11px; color: var(--text-muted); margin: 0;">
          ${escapeHtml(item.issuer)} &bull; ${item.issueDate || 'Verified'}
        </p>
      </div>

      <div style="display: flex; gap: var(--space-2); align-items: center;">
        ${item.credentialUrl ? `<a href="${item.credentialUrl}" target="_blank" rel="noopener noreferrer" class="link-inline" style="font-size: 11px;">Verify &rarr;</a>` : ''}
        <button type="button" class="btn btn-secondary btn-sm edit-cert-btn" data-id="${item.id}" style="padding: 2px 8px; font-size: 11px;">Edit</button>
        <button type="button" class="btn btn-secondary btn-sm delete-cert-btn" data-id="${item.id}" style="padding: 2px 8px; font-size: 11px; color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">Delete</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.edit-cert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = list.find(c => c.id === id);
      if (item) openCertificationDialogForEdit(item);
    });
  });

  container.querySelectorAll('.delete-cert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete certification?')) {
        deleteCertificationItem(id);
        renderCertifications();
        showToast('Certification removed');
      }
    });
  });
}

function openCertificationDialogForAdd() {
  const form = document.getElementById('add-cert-form');
  const dialog = document.getElementById('add-cert-dialog');
  const title = document.getElementById('cert-dialog-title');
  const editIdInput = document.getElementById('cert-edit-id');
  const submitBtn = document.getElementById('cert-submit-btn');

  if (form) form.reset();
  if (editIdInput) editIdInput.value = '';
  if (title) title.textContent = 'Add Certification / Award';
  if (submitBtn) submitBtn.textContent = 'Save Certification';

  dialog?.showModal();
}

function openCertificationDialogForEdit(item) {
  const dialog = document.getElementById('add-cert-dialog');
  const title = document.getElementById('cert-dialog-title');
  const editIdInput = document.getElementById('cert-edit-id');
  const submitBtn = document.getElementById('cert-submit-btn');

  if (editIdInput) editIdInput.value = item.id;
  if (title) title.textContent = 'Edit Certification / Award';
  if (submitBtn) submitBtn.textContent = 'Update Certification';

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('cert-title', item.title);
  setVal('cert-issuer', item.issuer);
  setVal('cert-date', item.issueDate);
  setVal('cert-url', item.credentialUrl);

  dialog?.showModal();
}

function initExperienceForm() {
  const form = document.getElementById('add-exp-form');
  const dialog = document.getElementById('add-exp-dialog');
  const openBtn = document.getElementById('open-add-exp-btn');
  const closeBtn = document.getElementById('close-add-exp-btn');
  const cancelBtn = document.getElementById('cancel-add-exp-btn');
  const currentCheckbox = document.getElementById('exp-current');
  const endInput = document.getElementById('exp-end');

  if (openBtn) openBtn.addEventListener('click', () => openExperienceDialogForAdd());
  if (closeBtn && dialog) closeBtn.addEventListener('click', () => dialog.close());
  if (cancelBtn && dialog) cancelBtn.addEventListener('click', () => dialog.close());

  if (currentCheckbox && endInput) {
    currentCheckbox.addEventListener('change', (e) => {
      endInput.disabled = e.target.checked;
      if (e.target.checked) endInput.value = '';
    });
  }

  if (form && dialog) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('exp-edit-id')?.value;
      const org = document.getElementById('exp-org').value.trim();
      const role = document.getElementById('exp-role').value.trim();
      const startDate = document.getElementById('exp-start').value;
      const endDate = document.getElementById('exp-end').value;
      const currentlyActive = document.getElementById('exp-current').checked;
      const location = document.getElementById('exp-location').value.trim();
      const desc = document.getElementById('exp-desc').value.trim();

      const payload = {
        organization: org,
        role: role,
        startDate: startDate,
        endDate: endDate,
        currentlyActive: currentlyActive,
        location: location,
        description: desc
      };

      if (editId) {
        updateExperienceItem(editId, payload);
        showToast('Experience updated successfully!');
      } else {
        addExperienceItem(payload);
        showToast('Experience added successfully!');
      }

      form.reset();
      dialog.close();
      renderExperiences();
    });
  }
}

function initCertificationForm() {
  const form = document.getElementById('add-cert-form');
  const dialog = document.getElementById('add-cert-dialog');
  const openBtn = document.getElementById('open-add-cert-btn');
  const closeBtn = document.getElementById('close-add-cert-btn');
  const cancelBtn = document.getElementById('cancel-add-cert-btn');

  if (openBtn) openBtn.addEventListener('click', () => openCertificationDialogForAdd());
  if (closeBtn && dialog) closeBtn.addEventListener('click', () => dialog.close());
  if (cancelBtn && dialog) cancelBtn.addEventListener('click', () => dialog.close());

  if (form && dialog) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('cert-edit-id')?.value;
      const title = document.getElementById('cert-title').value.trim();
      const issuer = document.getElementById('cert-issuer').value.trim();
      const issueDate = document.getElementById('cert-date').value;
      const url = document.getElementById('cert-url').value.trim();

      const payload = {
        title,
        issuer,
        issueDate,
        credentialUrl: url
      };

      if (editId) {
        updateCertificationItem(editId, payload);
        showToast('Certification updated successfully!');
      } else {
        addCertificationItem(payload);
        showToast('Certification added successfully!');
      }

      form.reset();
      dialog.close();
      renderCertifications();
    });
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'dashboard-toast';
  toast.textContent = msg;
  toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: var(--bg-surface); border: 1px solid var(--accent-primary); color: var(--text-primary); padding: 10px 18px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-size: 13px; z-index: 9999;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
