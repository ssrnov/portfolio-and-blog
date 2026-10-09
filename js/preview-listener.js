/**
 * SSRNovX — Live Preview Listener
 * Listens to parent window postMessage events and provides 0ms live reactive preview updates.
 */

window.addEventListener('message', (event) => {
  if (event.data?.type === 'SSRNOVX_PREVIEW_UPDATE') {
    applyLiveUpdates(event.data.payload);
  }
});

function applyLiveUpdates(data) {
  if (!data) return;

  // 1. Display Name
  if (data.displayName !== undefined) {
    document.querySelectorAll('[data-builder-target="display_name"]').forEach((el) => {
      el.textContent = data.displayName;
    });
  }

  // 2. Headline
  if (data.headline !== undefined) {
    document.querySelectorAll('[data-builder-target="headline"]').forEach((el) => {
      el.textContent = data.headline;
    });
  }

  // 3. Bio
  if (data.bio !== undefined) {
    document.querySelectorAll('[data-builder-target="bio"]').forEach((el) => {
      el.textContent = data.bio;
    });
  }

  // 4. Location
  if (data.location !== undefined) {
    document.querySelectorAll('[data-builder-target="location"]').forEach((el) => {
      el.textContent = data.location;
    });
  }

  // 5. GitHub URL
  if (data.githubUrl !== undefined) {
    document.querySelectorAll('[data-builder-target="github_url"]').forEach((el) => {
      el.setAttribute('href', data.githubUrl);
    });
  }

  // 6. Contact Email
  if (data.contactEmail !== undefined) {
    document.querySelectorAll('[data-builder-target="contact_email"]').forEach((el) => {
      el.setAttribute('href', `mailto:${data.contactEmail}`);
      if (el.textContent.includes('Email:')) {
        el.textContent = `Email: ${data.contactEmail}`;
      }
    });
  }

  // 7. Template Styling Switcher
  if (data.template) {
    document.documentElement.setAttribute('data-template', data.template);
    document.body.className = `template-${data.template}`;
  }
}

// Notify parent that preview iframe is ready to receive state
if (window.parent && window.parent !== window) {
  window.parent.postMessage({ type: 'SSRNOVX_PREVIEW_READY' }, '*');
}
