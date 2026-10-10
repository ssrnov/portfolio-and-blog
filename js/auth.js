/**
 * Folioryn — Authentication Controller
 * Handles user sign in, registration, password validation, visibility toggles,
 * password strength estimation, username availability feedback, password reset,
 * and session persistence.
 */

import { authService } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already authenticated
  try {
    const session = await authService.getSession();
    if (session && session.user) {
      const alertBox = document.getElementById('auth-alert-box');
      if (alertBox) {
        alertBox.style.display = 'flex';
        alertBox.style.padding = '12px 14px';
        alertBox.style.borderRadius = 'var(--radius-sm)';
        alertBox.style.fontSize = 'var(--text-xs)';
        alertBox.style.fontFamily = 'var(--font-mono)';
        alertBox.style.marginBottom = 'var(--space-4)';
        alertBox.style.alignItems = 'center';
        alertBox.style.justifyContent = 'space-between';
        alertBox.style.gap = '8px';
        alertBox.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
        alertBox.style.border = '1px solid var(--border-color)';
        alertBox.style.color = 'var(--text-secondary)';

        const displayName = session.user.display_name || session.user.username || 'User';
        const cleanName = displayName.replace(/[<>&"]/g, '');

        alertBox.innerHTML = `
          <span>Signed in as <strong style="color: var(--text-primary);">${cleanName}</strong></span>
          <div style="display: flex; gap: 8px;">
            <a href="/dashboard/" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 11px; text-decoration: none;">Dashboard</a>
            <button type="button" id="auth-signout-banner-btn" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 11px;">Sign Out</button>
          </div>
        `;

        document.getElementById('auth-signout-banner-btn')?.addEventListener('click', async () => {
          await authService.signOut();
        });
      }
    }
  } catch (err) {
    console.warn('Session verification notice:', err);
  }

  // Check URL params for auth requirement banner
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth') === 'required') {
    showAuthAlert('Authentication required: Please sign in to access your dashboard.', 'error');
  }

  // Setup Password Visibility Toggles
  setupPasswordToggles();

  // Setup Forgot Password Action
  setupForgotPassword();

  // Handle Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    initLoginForm(loginForm);
  }

  // Handle Signup Form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    initSignupForm(signupForm);
  }
});

/**
 * Setup show/hide password buttons with accessible state and SVG icons
 */
function setupPasswordToggles() {
  const toggleConfigs = [
    { btnId: 'toggle-login-password-btn', inputId: 'login-password' },
    { btnId: 'toggle-signup-password-btn', inputId: 'signup-password' },
    { btnId: 'toggle-confirm-password-btn', inputId: 'signup-confirm-password' }
  ];

  const eyeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  const eyeOffIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

  toggleConfigs.forEach(({ btnId, inputId }) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        btn.innerHTML = isPassword ? eyeOffIcon : eyeIcon;
        btn.style.color = isPassword ? 'var(--text-primary)' : 'var(--text-muted)';
        input.focus();
      });
    }
  });
}

/**
 * Handle password reset modal / trigger
 */
function setupForgotPassword() {
  const forgotBtn = document.getElementById('forgot-password-btn');
  if (!forgotBtn) return;

  forgotBtn.addEventListener('click', async () => {
    const emailInput = document.getElementById('login-email');
    const email = emailInput?.value.trim();

    if (!email) {
      showAuthAlert('Please enter your email address in the field above first.', 'error');
      emailInput?.focus();
      return;
    }

    try {
      showAuthAlert('Sending password reset instructions...', 'success');
      await authService.resetPasswordForEmail(email);
      showAuthAlert(`Password reset link sent to ${email}. Please check your inbox.`, 'success');
    } catch (err) {
      showAuthAlert(err.message || 'Failed to send reset link. Try again later.', 'error');
    }
  });
}

/**
 * Login Form Controller
 */
function initLoginForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthAlert();

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!email || !password) {
      showAuthAlert('Please enter both your email address and password.', 'error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Signing In...</span>';
      }

      await authService.signInWithPassword(email, password);
      showAuthAlert('Signed in successfully! Redirecting...', 'success');
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      let target = '/dashboard/';
      if (redirectParam) {
        try {
          const decoded = decodeURIComponent(redirectParam);
          if (decoded.startsWith('/') && !decoded.startsWith('//')) {
            target = decoded;
          }
        } catch (e) {
          target = '/dashboard/';
        }
      }
      setTimeout(() => {
        window.location.href = target;
      }, 500);
    } catch (err) {
      showAuthAlert(err.message || 'Invalid email or password. Please try again.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In to Dashboard</span> <span aria-hidden="true">&rarr;</span>';
      }
    }
  });
}

/**
 * Signup Form Controller with Real-time Validation, Strength Meter & Availability Check
 */
function initSignupForm(form) {
  const nameInput = document.getElementById('signup-name');
  const usernameInput = document.getElementById('signup-username');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmPasswordInput = document.getElementById('signup-confirm-password');
  const termsCheckbox = document.getElementById('signup-terms');
  const submitBtn = document.getElementById('signup-submit-btn');
  const submitText = document.getElementById('signup-btn-text');
  const usernameBadge = document.getElementById('username-availability-badge');

  let usernameDebounceTimer = null;

  // 1. Real-time Live Username Availability Check
  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      clearFieldError('username');
      const val = usernameInput.value.trim().toLowerCase();

      // Clean invalid characters immediately
      const sanitized = val.replace(/[^a-z0-9_-]/g, '');
      if (sanitized !== usernameInput.value) {
        usernameInput.value = sanitized;
      }

      if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer);

      if (!sanitized) {
        if (usernameBadge) usernameBadge.textContent = '';
        return;
      }

      if (sanitized.length < 3) {
        if (usernameBadge) {
          usernameBadge.textContent = 'Min 3 chars';
          usernameBadge.style.color = 'var(--text-muted)';
        }
        return;
      }

      if (usernameBadge) {
        usernameBadge.textContent = 'Checking...';
        usernameBadge.style.color = 'var(--text-secondary)';
      }

      usernameDebounceTimer = setTimeout(async () => {
        try {
          const isAvail = await authService.isUsernameAvailable(sanitized);
          if (usernameBadge) {
            if (isAvail) {
              usernameBadge.textContent = '✓ Available';
              usernameBadge.style.color = '#27c93f';
              usernameInput.classList.remove('is-invalid');
              usernameInput.classList.add('is-valid');
            } else {
              usernameBadge.textContent = '✗ Already taken';
              usernameBadge.style.color = '#ef4444';
              usernameInput.classList.remove('is-valid');
              usernameInput.classList.add('is-invalid');
            }
          }
        } catch {
          if (usernameBadge) usernameBadge.textContent = '';
        }
      }, 300);
    });
  }

  // 2. Real-time Password Strength Meter
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      clearFieldError('password');
      const pwd = passwordInput.value;
      updatePasswordStrength(pwd);

      if (confirmPasswordInput && confirmPasswordInput.value) {
        checkPasswordMatch();
      }
    });
  }

  // 3. Real-time Confirm Password Matching
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      clearFieldError('confirm-password');
      checkPasswordMatch();
    });
  }

  function checkPasswordMatch() {
    const pwd = passwordInput?.value || '';
    const cpwd = confirmPasswordInput?.value || '';
    if (!cpwd) return;

    if (pwd !== cpwd) {
      confirmPasswordInput.classList.remove('is-valid');
      confirmPasswordInput.classList.add('is-invalid');
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
      confirmPasswordInput.classList.add('is-valid');
      clearFieldError('confirm-password');
    }
  }

  // 4. Clear input errors on user interaction
  nameInput?.addEventListener('input', () => clearFieldError('name'));
  emailInput?.addEventListener('input', () => clearFieldError('email'));
  termsCheckbox?.addEventListener('change', () => clearFieldError('terms'));

  // 5. Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthAlert();

    const fullName = nameInput?.value.trim() || '';
    const username = usernameInput?.value.trim().toLowerCase() || '';
    const email = emailInput?.value.trim().toLowerCase() || '';
    const password = passwordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';
    const termsAccepted = termsCheckbox?.checked;

    let hasErrors = false;

    // Validate Full Name
    if (!fullName || fullName.length < 2) {
      setFieldError('name', 'Please enter your full name (at least 2 characters).');
      if (!hasErrors) nameInput?.focus();
      hasErrors = true;
    }

    // Validate Username
    const slugRegex = /^[a-z0-9_-]{3,24}$/;
    if (!username) {
      setFieldError('username', 'Please choose a username for your public portfolio.');
      if (!hasErrors) usernameInput?.focus();
      hasErrors = true;
    } else if (!slugRegex.test(username)) {
      setFieldError('username', 'Username must be 3–24 characters: lowercase letters, numbers, hyphens or underscores.');
      if (!hasErrors) usernameInput?.focus();
      hasErrors = true;
    }

    // Validate Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setFieldError('email', 'Please enter your email address.');
      if (!hasErrors) emailInput?.focus();
      hasErrors = true;
    } else if (!emailRegex.test(email)) {
      setFieldError('email', 'Please enter a valid email address (e.g. name@domain.com).');
      if (!hasErrors) emailInput?.focus();
      hasErrors = true;
    }

    // Validate Password
    if (!password) {
      setFieldError('password', 'Please create a password.');
      if (!hasErrors) passwordInput?.focus();
      hasErrors = true;
    } else if (password.length < 8) {
      setFieldError('password', 'Password must be at least 8 characters long.');
      if (!hasErrors) passwordInput?.focus();
      hasErrors = true;
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      setFieldError('password', 'Password must contain both letters and numbers.');
      if (!hasErrors) passwordInput?.focus();
      hasErrors = true;
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      setFieldError('confirm-password', 'Please confirm your password.');
      if (!hasErrors) confirmPasswordInput?.focus();
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setFieldError('confirm-password', 'Passwords do not match. Please re-enter identical passwords.');
      if (!hasErrors) confirmPasswordInput?.focus();
      hasErrors = true;
    }

    // Validate Terms Acceptance
    if (!termsAccepted) {
      setFieldError('terms', 'You must agree to the Terms of Service and Privacy Policy to continue.');
      hasErrors = true;
    }

    if (hasErrors) {
      showAuthAlert('Please fix the errors indicated above before proceeding.', 'error');
      return;
    }

    // Pre-flight check: username availability
    try {
      const isAvailable = await authService.isUsernameAvailable(username);
      if (!isAvailable) {
        setFieldError('username', 'This username is already taken. Please choose another one.');
        usernameInput?.focus();
        showAuthAlert('Username is already registered. Please choose a different handle.', 'error');
        return;
      }
    } catch {
      // Continue to submission
    }

    // Submit Registration
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Creating account...';
      }

      // Save initial profile details to localStorage for onboarding hydration
      const initialProfile = {
        fullName,
        username,
        email
      };
      localStorage.setItem('folioryn_user_profile', JSON.stringify(initialProfile));
      localStorage.setItem('profilefolio_user_profile', JSON.stringify(initialProfile));

      await authService.signUp(email, password, { username, fullName });

      showAuthAlert('Account created successfully! Preparing your onboarding guide...', 'success');
      setTimeout(() => {
        window.location.href = `/onboarding/?username=${encodeURIComponent(username)}`;
      }, 600);
    } catch (err) {
      showAuthAlert(err.message || 'Registration failed. The username or email might already be registered.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Create account';
      }
    }
  });
}

/**
 * Update 4-Bar Password Strength Indicator
 */
function updatePasswordStrength(password) {
  const bar1 = document.getElementById('strength-bar-1');
  const bar2 = document.getElementById('strength-bar-2');
  const bar3 = document.getElementById('strength-bar-3');
  const bar4 = document.getElementById('strength-bar-4');
  const text = document.getElementById('strength-text');

  if (!bar1 || !bar2 || !bar3 || !bar4 || !text) return;

  const bars = [bar1, bar2, bar3, bar4];
  bars.forEach(b => {
    b.className = 'strength-meter-bar';
  });

  if (!password) {
    text.textContent = 'Minimum 8 characters with letters and numbers.';
    text.style.color = 'var(--text-muted)';
    return;
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password) || (password.length >= 10 && /[A-Z]/.test(password))) score++;
  if (password.length >= 12 && /[^a-zA-Z0-9]/.test(password)) score++;

  if (score === 1) {
    bar1.classList.add('active-weak');
    text.textContent = 'Weak: needs at least 8 characters with letters and numbers.';
    text.style.color = '#ef4444';
  } else if (score === 2) {
    bar1.classList.add('active-fair');
    bar2.classList.add('active-fair');
    text.textContent = 'Fair: add symbols or uppercase letters for better security.';
    text.style.color = '#f59e0b';
  } else if (score === 3) {
    bar1.classList.add('active-good');
    bar2.classList.add('active-good');
    bar3.classList.add('active-good');
    text.textContent = 'Good: secure password.';
    text.style.color = 'var(--text-secondary)';
  } else if (score >= 4) {
    bar1.classList.add('active-strong');
    bar2.classList.add('active-strong');
    bar3.classList.add('active-strong');
    bar4.classList.add('active-strong');
    text.textContent = 'Strong: excellent password!';
    text.style.color = 'var(--text-primary)';
  }
}

/**
 * Set inline accessible field error
 */
function setFieldError(fieldId, message) {
  const errEl = document.getElementById(`${fieldId}-error`);
  const inputEl = document.getElementById(`signup-${fieldId}`);
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.add('visible');
  }
  if (inputEl) {
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid', 'true');
  }
}

/**
 * Clear inline field error
 */
function clearFieldError(fieldId) {
  const errEl = document.getElementById(`${fieldId}-error`);
  const inputEl = document.getElementById(`signup-${fieldId}`);
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.remove('visible');
  }
  if (inputEl) {
    inputEl.classList.remove('is-invalid');
    inputEl.setAttribute('aria-invalid', 'false');
  }
}

/**
 * Show global form alert banner
 */
function showAuthAlert(message, type = 'error') {
  clearAuthAlert();
  let alert = document.getElementById('auth-alert-box');
  if (!alert) {
    alert = document.createElement('div');
    alert.id = 'auth-alert-box';
    const form = document.getElementById('login-form') || document.getElementById('signup-form') || document.querySelector('form');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(alert, form);
    }
  }
  if (!alert) return;

  alert.style.display = 'flex';
  alert.style.padding = '10px 14px';
  alert.style.borderRadius = 'var(--radius-sm)';
  alert.style.fontSize = 'var(--text-xs)';
  alert.style.fontFamily = 'var(--font-mono)';
  alert.style.marginBottom = 'var(--space-4)';
  alert.style.alignItems = 'center';
  alert.style.gap = '8px';

  if (type === 'error') {
    alert.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    alert.style.border = '1px solid #ef4444';
    alert.style.color = '#ef4444';
    alert.innerHTML = `<span>&times;</span> <span>${message}</span>`;
  } else {
    alert.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
    alert.style.border = '1px solid #22c55e';
    alert.style.color = '#22c55e';
    alert.innerHTML = `<span>&check;</span> <span>${message}</span>`;
  }
}

/**
 * Clear global form alert banner
 */
function clearAuthAlert() {
  const alert = document.getElementById('auth-alert-box');
  if (alert) {
    alert.style.display = 'none';
    alert.innerHTML = '';
  }
}
