/**
 * SSRNovX Portfolio & Blog — Contact Form Module
 * Client-side validation, accessible feedback states, and visual design preview
 * TechSpace BuildLab B04
 */

export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusBanner = document.getElementById('contact-status');

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

    // Simulate sending with loading state
    setLoadingState(true);

    try {
      // Realistic simulation delay for review
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Display explicit Phase 2 design preview message
      showStatus(
        'Validation passed: Form design simulation verified. Live backend transmission will be connected in Phase 3.',
        'success'
      );
      form.reset();
    } catch (err) {
      console.error('Contact Form Simulation Error:', err);
      showStatus(
        'An error occurred during form submission simulation. Please try again.',
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
      el.textContent = '';
      el.classList.remove('is-visible');
    });
    if (statusBanner) {
      statusBanner.className = 'form-status';
      statusBanner.textContent = '';
    }
  }

  function showStatus(message, type) {
    if (!statusBanner) return;
    statusBanner.className = `form-status is-${type}`;
    statusBanner.textContent = message;
  }

  function setLoadingState(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.innerHTML = loading
      ? '<span class="pulse-dot" style="display:inline-block; margin-right:6px;"></span> Simulating Send...'
      : 'Send Message';
  }
}
