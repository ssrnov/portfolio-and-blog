/**
 * ProfileFolio — 8-Step Onboarding Wizard Controller
 * Guides new users through:
 * 1. Choose Username
 * 2. Select Role/Field
 * 3. Introduction & Bio
 * 4. Education & Categorized Skills
 * 5. Projects & GitHub Sync
 * 6. Select Portfolio Template
 * 7. Live Preview
 * 8. Save Draft / Publish Live
 */

import {
  getProfile,
  saveProfile,
  getEducation,
  saveEducation,
  getSkills,
  saveSkills,
  getProjects,
  saveProjects,
  getPublishSettings,
  savePublishSettings,
  getActiveUser
} from './profile-data.js';

let currentStep = 1;
const TOTAL_STEPS = 8;

let onboardingState = {
  username: 'sunny',
  role: 'Software Engineer',
  fullName: 'Sunny',
  headline: 'Full-Stack Software Engineer & Systems Builder',
  location: 'Bangalore, India',
  bio: 'Architecting scalable web applications, distributed backend pipelines, and minimalist user interfaces.',
  institution: '',
  degree: '',
  score: '',
  years: '',
  projectTitle: '',
  projectDesc: '',
  projectTags: [],
  templateId: 'minimal-professional',
  isPublished: true
};

document.addEventListener('DOMContentLoaded', () => {
  loadUrlParamsAndLocalData();
  initWizardButtons();
  initRoleSelection();
  initSkillChips();
  initTemplateSelection();
  initGitHubFetch();
  initPublishActions();
  initCopyButton();
  updateStepUI();
});

function loadUrlParamsAndLocalData() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramUsername = urlParams.get('username') || urlParams.get('handle');

  const user = getActiveUser();
  const existingProfile = getProfile();
  const isSunny = !user || user.username === 'sunny' || user.id === 'usr_mock_sunny_9921';

  if (paramUsername) {
    onboardingState.username = paramUsername;
  } else if (existingProfile?.username) {
    onboardingState.username = existingProfile.username;
  }

  if (!isSunny) {
    onboardingState.fullName = existingProfile?.fullName || user?.display_name || user?.username || 'User';
    onboardingState.headline = existingProfile?.headline || user?.headline || 'Full-Stack Software Engineer & Builder';
    onboardingState.location = existingProfile?.location || user?.location || '';
    onboardingState.bio = existingProfile?.bio || user?.bio || '';
    onboardingState.institution = '';
    onboardingState.degree = '';
    onboardingState.score = '';
    onboardingState.years = '';
    onboardingState.projectTitle = '';
    onboardingState.projectDesc = '';
    onboardingState.projectTags = [];
  } else {
    if (existingProfile?.fullName) onboardingState.fullName = existingProfile.fullName;
    if (existingProfile?.headline) onboardingState.headline = existingProfile.headline;
    if (existingProfile?.location) onboardingState.location = existingProfile.location;
    if (existingProfile?.bio) onboardingState.bio = existingProfile.bio;
  }

  // Hydrate DOM fields
  const elUsername = document.getElementById('ob-username');
  if (elUsername) elUsername.value = onboardingState.username;

  const elName = document.getElementById('ob-full-name');
  if (elName) elName.value = onboardingState.fullName;

  const elHeadline = document.getElementById('ob-headline');
  if (elHeadline) elHeadline.value = onboardingState.headline;

  const elLocation = document.getElementById('ob-location');
  if (elLocation) elLocation.value = onboardingState.location;

  const elBio = document.getElementById('ob-bio');
  if (elBio) elBio.value = onboardingState.bio;
}

function initWizardButtons() {
  const btnNext = document.getElementById('btn-wizard-next');
  const btnPrev = document.getElementById('btn-wizard-prev');

  btnNext?.addEventListener('click', handleNextStep);
  btnPrev?.addEventListener('click', handlePrevStep);
}

function handleNextStep() {
  // Validate and sync each step
  if (currentStep === 1) {
    const val = document.getElementById('ob-username')?.value.trim().toLowerCase();
    if (!val || val.length < 3) {
      alert('Please enter a username of at least 3 characters.');
      return;
    }
    onboardingState.username = val;
    saveProfile({ username: val });
  } else if (currentStep === 2) {
    const selectedRoleCard = document.querySelector('.role-card-choice.selected');
    if (selectedRoleCard) {
      onboardingState.role = selectedRoleCard.getAttribute('data-role') || 'Software Engineer';
      if (!onboardingState.headline || onboardingState.headline.includes('Software Engineer')) {
        onboardingState.headline = `${onboardingState.role} & Systems Builder`;
        const elHeadline = document.getElementById('ob-headline');
        if (elHeadline) elHeadline.value = onboardingState.headline;
      }
    }
  } else if (currentStep === 3) {
    const fullName = document.getElementById('ob-full-name')?.value.trim();
    const headline = document.getElementById('ob-headline')?.value.trim();
    const location = document.getElementById('ob-location')?.value.trim();
    const bio = document.getElementById('ob-bio')?.value.trim();

    if (!fullName) {
      alert('Please enter your full name.');
      return;
    }

    onboardingState.fullName = fullName;
    onboardingState.headline = headline || onboardingState.headline;
    onboardingState.location = location || onboardingState.location;
    onboardingState.bio = bio || onboardingState.bio;

    saveProfile({
      fullName: onboardingState.fullName,
      headline: onboardingState.headline,
      location: onboardingState.location,
      bio: onboardingState.bio
    });
  } else if (currentStep === 4) {
    const institution = document.getElementById('ob-institution')?.value.trim();
    const degree = document.getElementById('ob-degree')?.value.trim();
    const score = document.getElementById('ob-score')?.value.trim();
    const years = document.getElementById('ob-years')?.value.trim();

    if (institution && degree) {
      onboardingState.institution = institution;
      onboardingState.degree = degree;
      onboardingState.score = score;
      onboardingState.years = years;

      const currentEdu = getEducation();
      saveEducation([
        {
          id: 'edu-primary',
          institution,
          institutionType: 'university',
          qualification: degree,
          fieldOfStudy: degree,
          startDate: years.split('–')[0]?.trim() || '2022',
          endDate: years.split('–')[1]?.trim() || '2026',
          currentlyStudying: true,
          gradeType: 'CGPA',
          gradeValue: score,
          gradeScale: '10.0',
          coursework: 'Data Structures, Web Architecture, Distributed Systems',
          achievements: 'Dean’s Honor List',
          displayOnPortfolio: true
        },
        ...currentEdu.filter(e => e.id !== 'edu-primary')
      ]);
    }

    // Save selected skills
    const selectedChips = document.querySelectorAll('.skill-chip-select.selected');
    const skillsToSave = Array.from(selectedChips).map((chip, idx) => ({
      id: `sk-ob-${idx + 1}`,
      name: chip.getAttribute('data-skill') || chip.textContent.trim(),
      category: 'tools',
      proficiency: 'Advanced',
      years: '2'
    }));
    if (skillsToSave.length > 0) {
      saveSkills(skillsToSave);
    }
  } else if (currentStep === 5) {
    const title = document.getElementById('ob-proj-title')?.value.trim();
    const desc = document.getElementById('ob-proj-desc')?.value.trim();
    const tags = document.getElementById('ob-proj-tags')?.value.trim();

    if (title && desc) {
      onboardingState.projectTitle = title;
      onboardingState.projectDesc = desc;
      onboardingState.projectTags = tags.split(',').map(t => t.trim()).filter(Boolean);

      try {
        const currentProjects = getProjects();
        saveProjects([
          {
            id: 'proj-' + Date.now(),
            title,
            description: desc,
            tags: onboardingState.projectTags,
            repo_url: `https://github.com/${onboardingState.username}`,
            featured: true,
            live_url: ''
          },
          ...currentProjects
        ]);
      } catch (e) {
        console.warn('Project persistence:', e);
      }
    }
  } else if (currentStep === 6) {
    const selectedTemplate = document.querySelector('.template-card-choice.selected');
    if (selectedTemplate) {
      onboardingState.templateId = selectedTemplate.getAttribute('data-template') || 'minimal-professional';
    }
    savePublishSettings({ templateId: onboardingState.templateId });

    // Populate Step 7 Preview Mockup
    hydratePreviewStep();
  } else if (currentStep === 7) {
    // Populate Step 8 Final URL
    const finalUrl = `https://folioryn.dev/u/${onboardingState.username}`;
    const elFinalUrl = document.getElementById('final-live-url');
    if (elFinalUrl) elFinalUrl.textContent = finalUrl;
  }

  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    updateStepUI();
  }
}

function handlePrevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepUI();
  }
}

function updateStepUI() {
  // Update Wizard Steps Bar
  const stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach((item, index) => {
    const stepNum = index + 1;
    if (stepNum < currentStep) {
      item.className = 'step-item completed';
    } else if (stepNum === currentStep) {
      item.className = 'step-item active';
    } else {
      item.className = 'step-item';
    }
  });

  // Switch Active Pane
  const panes = document.querySelectorAll('.wizard-step-pane');
  panes.forEach(pane => {
    pane.classList.remove('active');
  });
  const activePane = document.getElementById(`pane-step-${currentStep}`);
  if (activePane) activePane.classList.add('active');

  // Smooth scroll to top of wizard content
  const scrollContainer = document.querySelector('.onboarding-content-scroll');
  if (scrollContainer) scrollContainer.scrollTop = 0;

  // Update navigation controls
  const btnPrev = document.getElementById('btn-wizard-prev');
  const btnNext = document.getElementById('btn-wizard-next');
  const stepText = document.getElementById('step-indicator-text');
  const footer = document.getElementById('wizard-navigation-footer');

  if (stepText) stepText.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;

  if (btnPrev) {
    btnPrev.style.visibility = currentStep === 1 || currentStep === TOTAL_STEPS ? 'hidden' : 'visible';
  }

  if (btnNext) {
    if (currentStep === TOTAL_STEPS) {
      if (footer) footer.style.display = 'none';
    } else {
      if (footer) footer.style.display = 'flex';
      if (currentStep === 7) {
        btnNext.innerHTML = '<span>Proceed to Launch</span> <span aria-hidden="true">&rarr;</span>';
      } else {
        btnNext.innerHTML = '<span>Continue</span> <span aria-hidden="true">&rarr;</span>';
      }
    }
  }
}

function hydratePreviewStep() {
  const elBadge = document.getElementById('preview-template-badge');
  const elName = document.getElementById('preview-name');
  const elHeadline = document.getElementById('preview-headline');
  const elUrl = document.getElementById('preview-url-text');
  const elBio = document.getElementById('preview-bio');
  const elEdu = document.getElementById('preview-education');
  const elProj = document.getElementById('preview-project');

  if (elBadge) elBadge.textContent = onboardingState.templateId.replace('-', ' ').toUpperCase();
  if (elName) elName.textContent = onboardingState.fullName;
  if (elHeadline) elHeadline.textContent = onboardingState.headline;
  if (elUrl) elUrl.textContent = `folioryn.dev/u/${onboardingState.username}`;
  if (elBio) elBio.textContent = onboardingState.bio || 'Building software applications with modern web standards.';
  if (elEdu) elEdu.textContent = onboardingState.institution ? `${onboardingState.institution}${onboardingState.score ? ` • CGPA ${onboardingState.score}` : ''}` : 'Not specified yet';
  if (elProj) elProj.textContent = onboardingState.projectTitle || 'No projects added yet';
}

function initRoleSelection() {
  const cards = document.querySelectorAll('.role-card-choice');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

function initSkillChips() {
  const chips = document.querySelectorAll('.skill-chip-select');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
    });
  });
}

function initTemplateSelection() {
  const cards = document.querySelectorAll('.template-card-choice');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

function initGitHubFetch() {
  const btn = document.getElementById('btn-ob-fetch-github');
  const statusEl = document.getElementById('ob-github-status');
  btn?.addEventListener('click', async () => {
    const handle = document.getElementById('ob-github-handle')?.value.trim();
    if (!handle) {
      if (statusEl) statusEl.textContent = 'Please enter a GitHub username first.';
      return;
    }

    if (btn) btn.disabled = true;
    if (statusEl) statusEl.textContent = 'Fetching public repositories...';

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}/repos?sort=updated&per_page=6`);
      if (!res.ok) throw new Error('User not found or rate limited.');
      const repos = await res.json();

      if (repos.length > 0) {
        const topRepo = repos[0];
        const elTitle = document.getElementById('ob-proj-title');
        const elDesc = document.getElementById('ob-proj-desc');
        const elTags = document.getElementById('ob-proj-tags');

        if (elTitle) elTitle.value = topRepo.name;
        if (elDesc) elDesc.value = topRepo.description || 'Open-source software developed on GitHub.';
        if (elTags) elTags.value = topRepo.language || 'Code, Open Source';

        if (statusEl) statusEl.textContent = `✓ Synced ${repos.length} repos. Featured "${topRepo.name}".`;
      } else {
        if (statusEl) statusEl.textContent = 'No public repositories found for this user.';
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Notice: GitHub fetch unavailable. Manual project entry active.';
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

function initPublishActions() {
  const btnPublish = document.getElementById('btn-launch-publish');
  const btnDraft = document.getElementById('btn-launch-draft');

  btnPublish?.addEventListener('click', () => {
    savePublishSettings({
      isPublished: true,
      templateId: onboardingState.templateId,
      publicSlug: onboardingState.username
    });
    window.location.href = `/dashboard/?onboarding_complete=true&published=true`;
  });

  btnDraft?.addEventListener('click', () => {
    savePublishSettings({
      isPublished: false,
      templateId: onboardingState.templateId,
      publicSlug: onboardingState.username
    });
    window.location.href = `/dashboard/?onboarding_complete=true&published=false`;
  });
}

function initCopyButton() {
  const copyBtn = document.getElementById('btn-copy-final-url');
  copyBtn?.addEventListener('click', () => {
    const urlText = document.getElementById('final-live-url')?.textContent.trim();
    if (urlText) {
      navigator.clipboard.writeText(urlText).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy URL';
        }, 2000);
      });
    }
  });
}
