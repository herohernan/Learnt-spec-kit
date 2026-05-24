/**
 * Toast.js — Simple non-blocking toast notification utility.
 */

/**
 * Show a toast notification in the #toast-region.
 * @param {string} message
 * @param {'info'|'error'} [type='info']
 * @param {number} [duration=4000]
 */
export function showToast(message, type = 'info', duration = 4000) {
  const region = document.getElementById('toast-region');
  if (!region) return;

  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' toast--error' : ''}`;
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
