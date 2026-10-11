/**
 * ProfileFolio — Contact Form Controller
 * Client-side validation, accessible feedback states, dynamic user identity hydration,
 * and message persistence to the recipient's dashboard inbox.
 */

import { contactService } from './supabase.js';
import { getProfile, getActiveUser, getUserDataBySlug } from './profile-data.js';

export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusBanner = document.getElementById('contact-status');

  // 1. Dynamic User Identity Resolution
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserSlug = urlParams.get('user') || urlParams.get('u');

  let targetProfile = null;
  let targetDisplayName = '';
  let recipientKey = 'platform_inquiry';

  if (targetUserSlug) {
    const slugData = getUserDataBySlug(targetUserSlug);
    if (slugData && slugData.profile) {
      targetProfile = slugData.profile;
      targetDisplayName = targetProfile.fullName || targetProfile.username;
      recipientKey = targetUserSlug;
    }
  }

  const activeUser = getActiveUser();
  if (!targetProfile && activeUser) {
    targetProfile = getProfile();
    targetDisplayName = targetProfile.fullName || activeUser.display_name || activeUser.username;
    recipientKey = activeUser.username || activeUser.id || 'platform_inquiry';
  }

  // Hydrate direct communication card dynamically
  const emailLink = document.getElementById('contact-email-link');
  const socialEmail = document.getElementById('contact-social-email');
  const githubRow = document.getElementById('contact-github-row');
  const githubLink = document.getElementById('contact-github-link');
  const socialGithub = document.getElementById('contact-social-github');
  const locationText = document.getElementById('contact-location-text');
  const formHeading = document.getElementById('contact-form-heading');
  const infoDesc = document.getElementById('contact-info-desc');

  if (targetProfile) {
    const effectiveEmail = targetProfile.email || activeUser?.email || '';
    if (effectiveEmail) {
      if (emailLink) {
        emailLink.href = `mailto:${effectiveEmail}`;
        emailLink.textContent = effectiveEmail;
      }
      if (socialEmail) {
        socialEmail.href = `mailto:${effectiveEmail}`;
      }
    } else {
      if (emailLink) {
        emailLink.href = 'mailto:contact@folioryn.dev';
        emailLink.textContent = 'Direct message via form below';
      }
    }

    if (targetProfile.githubUrl) {
      const cleanGh = targetProfile.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@+/, '').split('/')[0];
      if (githubLink) {
        githubLink.href = targetProfile.githubUrl;
        githubLink.textContent = `github.com/${cleanGh}`;
      }
      if (socialGithub) {
        socialGithub.href = targetProfile.githubUrl;
        socialGithub.style.display = '';
      }
      if (githubRow) githubRow.style.display = '';
    } else {
      if (githubRow) githubRow.style.display = 'none';
      if (socialGithub) socialGithub.style.display = 'none';
    }

    if (targetProfile.location && locationText) {
      locationText.textContent = targetProfile.location;
    }

    if (targetDisplayName && formHeading) {
      formHeading.textContent = `Direct Communication with ${targetDisplayName}`;
    }
    if (targetProfile.headline && infoDesc) {
      infoDesc.textContent = `${targetProfile.headline}. Send a direct message or connect via the links below.`;
    }
  }

  // Pre-fill sender fields if logged in user
  if (activeUser) {
    if (nameInput && !nameInput.value) {
      nameInput.value = activeUser.display_name || activeUser.username || '';
    }
    if (emailInput && !emailInput.value) {
      emailInput.value = activeUser.email || '';
    }
  }

  // Real-time input clearing of error states
  [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
        const errSpan = input.parentElement.querySelector('.error-message');
        if (errSpan) errSpan.classList.remove('is-visible');
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    let isValid = true;

    // 1. Name validation
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showError(nameInput, 'name-error', 'Please enter your full name (minimum 2 characters).');
      isValid = false;
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, 'email-error', 'Please provide a valid email address (e.g., name@domain.com).');
      isValid = false;
    }

    // 3. Subject validation
    if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
      showError(subjectInput, 'subject-error', 'Please enter a message subject (minimum 3 characters).');
      isValid = false;
    }

    // 4. Message validation
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showError(messageInput, 'message-error', 'Please enter a message with at least 10 characters.');
      isValid = false;
    }

    if (!isValid) return;

    setLoadingState(true);

    try {
      await contactService.submitMessage(recipientKey, {
        senderName: nameInput.value.trim(),
        senderEmail: emailInput.value.trim(),
        subject: subjectInput.value.trim(),
        message: messageInput.value.trim()
      });

      showStatus(
        'Thank you for reaching out! Your message has been transmitted and will appear in the inbox.',
        'success'
      );
      form.reset();
      if (activeUser) {
        if (nameInput) nameInput.value = activeUser.display_name || activeUser.username || '';
        if (emailInput) emailInput.value = activeUser.email || '';
      }
    } catch (err) {
      console.error('Contact Form Submission Error:', err);
      showStatus(
        'An error occurred while transmitting your message. Please try again.',
        'error'
      );
    } finally {
      setLoadingState(false);
    }
  });

  function showError(inputEl, errorId, message) {
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid', 'true');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  function clearErrors() {
    form.querySelectorAll('.form-input, .form-textarea').forEach((el) => {
      el.classList.remove('is-invalid');
      el.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.error-message').forEach((el) => {
      el.classList.remove('is-visible');
      el.textContent = '';
    });
    if (statusBanner) {
      statusBanner.classList.remove('is-visible', 'status-success', 'status-error');
      statusBanner.textContent = '';
    }
  }

  function setLoadingState(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.dataset.originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending Message...</span>';
    } else if (submitBtn.dataset.originalText) {
      submitBtn.innerHTML = submitBtn.dataset.originalText;
    }
  }

  function showStatus(message, type) {
    if (!statusBanner) return;
    statusBanner.textContent = message;
    statusBanner.className = `form-status is-visible status-${type}`;
    statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
