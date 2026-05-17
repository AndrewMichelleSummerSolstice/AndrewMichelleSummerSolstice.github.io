/* =========================================================
   auth.js — Password protection for the seating chart.
   Uses SubtleCrypto (SHA-256) to verify the shared password.
   Session is remembered in sessionStorage so guests only
   enter the password once per browser session.
   ========================================================= */

(function () {
  'use strict';

  // SHA-256 hash of "summer2026"
  const EXPECTED_HASH = '6a0436eecdad379345d804a9e4861a46e2135054879760acaf8d88534f871b26';
  const SESSION_KEY   = 'am_seating_auth';

  const overlay  = document.getElementById('auth-overlay');
  const form     = document.getElementById('auth-form');
  const input    = document.getElementById('auth-input');
  const errorEl  = document.getElementById('auth-error');
  const pageBody = document.getElementById('seating-body');

  // Convert ArrayBuffer to hex string
  function bufToHex(buf) {
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function hashString(str) {
    const encoded = new TextEncoder().encode(str);
    const buf     = await crypto.subtle.digest('SHA-256', encoded);
    return bufToHex(buf);
  }

  function unlock() {
    if (overlay)  overlay.classList.add('hidden');
    if (pageBody) pageBody.classList.remove('hidden');
    sessionStorage.setItem(SESSION_KEY, '1');
    // Dispatch event so seating-search.js knows to initialise
    document.dispatchEvent(new CustomEvent('seating:unlocked'));
  }

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
    }
    if (input) {
      input.classList.add('error');
      input.select();
    }
  }

  function clearError() {
    if (errorEl) errorEl.textContent = '';
    if (input)   input.classList.remove('error');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();

    const value = (input?.value || '').trim();
    if (!value) {
      showError('Please enter the password.');
      return;
    }

    try {
      const hash = await hashString(value);
      if (hash === EXPECTED_HASH) {
        unlock();
      } else {
        showError('Incorrect password. Hint: think summer 2026!');
      }
    } catch {
      // Fallback for browsers without SubtleCrypto (very old / non-HTTPS)
      showError('Your browser does not support secure hashing. Try a modern browser.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated this session
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      unlock();
      return;
    }

    // Show the password modal
    if (overlay) overlay.classList.remove('hidden');
    if (pageBody) pageBody.classList.add('hidden');

    if (form) form.addEventListener('submit', handleSubmit);

    // Allow pressing Enter in the input
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          form?.requestSubmit?.() || handleSubmit(e);
        }
      });
      input.focus();
    }
  });
})();
