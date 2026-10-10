/**
 * SSRNovX — Auth Controller
 * Handles user sign in, registration, OAuth triggers, and session state.
 */

import { authService, isSupabaseConfigured } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already authenticated
  try {
    const session = await authService.getSession();
    if (session && session.user) {
      // Optional: automatically redirect to dashboard if already logged in
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/signup');
      if (isAuthPage && !window.location.search.includes('force=true')) {
        // Auto-redirect to dashboard
        window.location.href = '/dashboard/';
        return;
      }
    }
  } catch (err) {
    console.warn('Session verification check:', err);
  }

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

  // Handle GitHub OAuth Button
  const githubBtn = document.getElementById('github-oauth-btn');
  if (githubBtn) {
    githubBtn.addEventListener('click', async () => {
      try {
        githubBtn.disabled = true;
        githubBtn.style.opacity = '0.7';
        await authService.signInWithOAuth('github');
      } catch (err) {
        showAuthAlert(err.message || 'GitHub OAuth failed. Please check configuration.', 'error');
        githubBtn.disabled = false;
        githubBtn.style.opacity = '1';
      }
    });
  }
});

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
      setTimeout(() => {
        window.location.href = '/dashboard/';
      }, 500);
    } catch (err) {
      showAuthAlert(err.message || 'Invalid credentials. Please try again.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In to Dashboard</span> <span aria-hidden="true">&rarr;</span>';
      }
    }
  });
}

function initSignupForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthAlert();

    const fullName = document.getElementById('signup-name')?.value.trim();
    const username = document.getElementById('signup-username')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!fullName || !username || !email || !password) {
      showAuthAlert('Please fill in all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showAuthAlert('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating Profile...</span>';
      }

      await authService.signUp(email, password, { username, fullName });
      showAuthAlert('Account created successfully! Loading your Studio...', 'success');
      setTimeout(() => {
        window.location.href = '/onboarding/';
      }, 700);
    } catch (err) {
      showAuthAlert(err.message || 'Registration failed. Try a different username or email.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Free Account</span> <span aria-hidden="true">&rarr;</span>';
      }
    }
  });
}

function showAuthAlert(message, type = 'error') {
  clearAuthAlert();
  const alert = document.createElement('div');
  alert.id = 'auth-alert-box';
  alert.style.padding = '10px 14px';
  alert.style.borderRadius = 'var(--radius-sm)';
  alert.style.fontSize = 'var(--text-xs)';
  alert.style.fontFamily = 'var(--font-mono)';
  alert.style.marginBottom = 'var(--space-4)';
  alert.style.display = 'flex';
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

  const card = document.querySelector('.auth-card');
  const form = document.querySelector('form');
  if (card && form) {
    card.insertBefore(alert, form);
  }
}

function clearAuthAlert() {
  const existing = document.getElementById('auth-alert-box');
  if (existing) existing.remove();
}
