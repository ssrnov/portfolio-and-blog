/**
 * SSRNovX Portfolio & Blog — Contact Form Module
 * Client-side validation, accessible feedback states, and service integration
 */

/**
 * Service Configuration
 * Easily configure between 'simulation' (default out-of-the-box demo),
 * 'formspree', or 'emailjs'.
 */
export const CONTACT_CONFIG = {
  // Options: 'simulation' | 'formspree' | 'emailjs'
  provider: 'simulation',

  formspree: {
    // Replace with your Formspree endpoint (e.g., 'https://formspree.io/f/xknlqwer')
    endpoint: 'https://formspree.io/f/YOUR_FORMSPREE_ID',
  },

  emailjs: {
    // Replace with your EmailJS credentials
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  },
};

export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusBanner = document.getElementById('contact-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset previous error messages
    clearErrors();

    // Validate fields
    let isValid = true;

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showError(nameInput, 'name-error', 'Please enter your name (minimum 2 characters).');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, 'email-error', 'Please enter a valid email address.');
      isValid = false;
    }

    if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
      showError(subjectInput, 'subject-error', 'Please enter a subject (minimum 3 characters).');
      isValid = false;
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showError(messageInput, 'message-error', 'Please enter a message with at least 10 characters.');
      isValid = false;
    }

    if (!isValid) return;

    // Begin Submission
    setLoadingState(true);

    try {
      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        subject: subjectInput.value.trim(),
        message: messageInput.value.trim(),
      };

      await dispatchMessage(formData);

      // Display Success State
      showStatus(
        'Thank you! Your message has been sent successfully. I will get back to you shortly.',
        'success'
      );
      form.reset();
    } catch (err) {
      console.error('Contact Form Error:', err);
      showStatus(
        'An error occurred while sending your message. Please try again or reach out directly via GitHub / email.',
        'error'
      );
    } finally {
      setLoadingState(false);
    }
  });

  function showError(inputEl, errorId, message) {
    inputEl.classList.add('is-invalid');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  function clearErrors() {
    form.querySelectorAll('.form-input, .form-textarea').forEach((el) => {
      el.classList.remove('is-invalid');
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
    submitBtn.textContent = loading ? 'Sending message...' : 'Send Message';
  }
}

/**
 * Dispatches message according to CONTACT_CONFIG
 */
async function dispatchMessage(data) {
  if (CONTACT_CONFIG.provider === 'formspree') {
    const res = await fetch(CONTACT_CONFIG.formspree.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Formspree error HTTP ${res.status}`);
    return await res.json();
  }

  if (CONTACT_CONFIG.provider === 'emailjs') {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: CONTACT_CONFIG.emailjs.serviceId,
        template_id: CONTACT_CONFIG.emailjs.templateId,
        user_id: CONTACT_CONFIG.emailjs.publicKey,
        template_params: data,
      }),
    });
    if (!res.ok) throw new Error(`EmailJS error HTTP ${res.status}`);
    return true;
  }

  // Default: Simulation mode (produces realistic network delay for testing)
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { status: 'simulated_success' };
}
