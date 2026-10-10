/**
 * BuildLab — Multi-Step Onboarding Wizard Controller
 * Directs new users through Profile, Academics, Skills, Featured Project, Theme, and Launch.
 */

import {
  getProfile,
  saveProfile,
  getEducation,
  saveEducation,
  getSkills,
  saveSkills,
  getPublishSettings,
  savePublishSettings
} from './profile-data.js';

let currentStep = 1;
const TOTAL_STEPS = 6;

document.addEventListener('DOMContentLoaded', () => {
  initWizard();
  initSkillChips();
  initTemplateSelection();
  initCopyButton();
});

function initWizard() {
  const btnNext = document.getElementById('btn-wizard-next');
  const btnPrev = document.getElementById('btn-wizard-prev');

  // Load existing profile values if present
  try {
    const prof = getProfile();
    if (prof.fullName) document.getElementById('ob-full-name').value = prof.fullName;
    if (prof.username) document.getElementById('ob-username').value = prof.username;
    if (prof.headline) document.getElementById('ob-headline').value = prof.headline;
    if (prof.location) document.getElementById('ob-location').value = prof.location;
    if (prof.bio) document.getElementById('ob-bio').value = prof.bio;
  } catch (err) {
    console.warn('Initial profile load in wizard:', err);
  }

  btnNext?.addEventListener('click', handleNextStep);
  btnPrev?.addEventListener('click', handlePrevStep);

  updateStepUI();
}

function handleNextStep() {
  // Step validation and data persisting
  if (currentStep === 1) {
    const fullName = document.getElementById('ob-full-name')?.value.trim();
    const username = document.getElementById('ob-username')?.value.trim() || 'sunny';
    const headline = document.getElementById('ob-headline')?.value.trim();
    const location = document.getElementById('ob-location')?.value.trim();
    const github = document.getElementById('ob-github')?.value.trim();
    const bio = document.getElementById('ob-bio')?.value.trim();

    if (!fullName || !headline) {
      alert('Please provide your full name and a professional headline.');
      return;
    }

    saveProfile({
      fullName,
      username,
      headline,
      location,
      bio,
      githubUrl: github ? `https://github.com/${github}` : undefined
    });
  } else if (currentStep === 2) {
    const institution = document.getElementById('ob-institution')?.value.trim();
    const degree = document.getElementById('ob-degree')?.value.trim();
    const field = document.getElementById('ob-field')?.value.trim();
    const score = document.getElementById('ob-score')?.value.trim();
    const scale = document.getElementById('ob-scale')?.value;
    const years = document.getElementById('ob-years')?.value.trim();
    const coursework = document.getElementById('ob-coursework')?.value.trim();

    if (!institution || !degree || !score) {
      alert('Please specify your university/college, degree, and academic score.');
      return;
    }

    const currentEdu = getEducation();
    const updatedEdu = [
      {
        id: 'edu-primary',
        institution,
        institutionType: 'university',
        qualification: degree,
        fieldOfStudy: field,
        startDate: years.split('–')[0]?.trim() || '2022',
        endDate: years.split('–')[1]?.trim() || '2026',
        currentlyStudying: true,
        gradeType: scale.includes('100') ? 'Percentage' : 'CGPA',
        gradeValue: score,
        gradeScale: scale,
        coursework: coursework,
        achievements: "Dean's Merit List &bull; Core Scholar",
        displayOnPortfolio: true
      },
      ...currentEdu.filter(e => e.id !== 'edu-primary')
    ];
    saveEducation(updatedEdu);
  } else if (currentStep === 3) {
    // Collect active skills from chips
    const selectedChips = document.querySelectorAll('.skill-chip-select.selected');
    const skillsToSave = Array.from(selectedChips).map((chip, idx) => ({
      id: `sk-ob-${idx + 1}`,
      name: chip.getAttribute('data-skill') || chip.textContent.trim(),
      category: chip.getAttribute('data-cat') || 'tools',
      proficiency: 'Advanced',
      years: '2'
    }));
    if (skillsToSave.length > 0) {
      saveSkills(skillsToSave);
    }
  } else if (currentStep === 4) {
    const title = document.getElementById('ob-proj-title')?.value.trim();
    const desc = document.getElementById('ob-proj-desc')?.value.trim();
    const tags = document.getElementById('ob-proj-tags')?.value.trim();
    const repo = document.getElementById('ob-proj-repo')?.value.trim();

    if (title && desc) {
      try {
        const storedProjects = JSON.parse(localStorage.getItem('ssrnovx_projects') || '[]');
        const newProject = {
          id: 'proj-' + Date.now(),
          title,
          description: desc,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          githubUrl: repo,
          featured: true,
          liveUrl: ''
        };
        storedProjects.unshift(newProject);
        localStorage.setItem('ssrnovx_projects', JSON.stringify(storedProjects));
      } catch (e) {
        console.warn('Projects persist:', e);
      }
    }
  } else if (currentStep === 5) {
    const selectedTemplateCard = document.querySelector('.template-card-choice.selected');
    const templateId = selectedTemplateCard?.getAttribute('data-template') || 'minimal-developer';
    savePublishSettings({ templateId, isPublished: true });

    // Update Step 6 Launch URL
    const prof = getProfile();
    const username = prof.username || 'sunny';
    const finalUrl = `https://buildlab.dev/u/${username}`;
    const urlElem = document.getElementById('final-live-url');
    if (urlElem) urlElem.textContent = finalUrl;

    const liveBtn = document.getElementById('btn-view-live-portfolio');
    if (liveBtn) liveBtn.href = `/u/${username}`;
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
  // Toggle step panes
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const pane = document.getElementById(`pane-step-${i}`);
    if (pane) {
      if (i === currentStep) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    }
  }

  // Update top stepper indicators
  const stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach(item => {
    const stepNum = parseInt(item.getAttribute('data-step'), 10);
    item.classList.remove('active', 'completed');
    if (stepNum === currentStep) {
      item.classList.add('active');
    } else if (stepNum < currentStep) {
      item.classList.add('completed');
    }
  });

  // Footer navigation buttons
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
      footer.style.display = 'none';
    } else {
      footer.style.display = 'flex';
      if (currentStep === 5) {
        btnNext.innerHTML = '<span>Complete &amp; Launch</span> <span aria-hidden="true">&check;</span>';
      } else {
        btnNext.innerHTML = '<span>Continue</span> <span aria-hidden="true">&rarr;</span>';
      }
    }
  }
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

function initCopyButton() {
  const copyBtn = document.getElementById('btn-copy-final-url');
  copyBtn?.addEventListener('click', () => {
    const urlText = document.getElementById('final-live-url')?.textContent;
    if (urlText) {
      navigator.clipboard.writeText(urlText).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      });
    }
  });
}
