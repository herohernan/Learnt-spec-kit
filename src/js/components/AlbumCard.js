/**
 * AlbumCard.js — Renders a single album card for the main page grid.
 */
import { formatAlbumDate } from '../utils/date-utils.js';

/**
 * Create and return an album card element.
 * @param {{ id: number, title: string, album_date: string }} album
 * @returns {HTMLElement}
 */
export function renderAlbumCard(album) {
  const card = document.createElement('div');
  card.className = 'album-card';
  card.setAttribute('data-album-id', String(album.id));
  card.setAttribute('draggable', 'true');
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'article');
  card.setAttribute(
    'aria-label',
    `${album.title}, ${formatAlbumDate(album.album_date)}. Press Enter to open.`
  );

  card.innerHTML = `
    <div class="album-card__drag-handle" aria-hidden="true" title="Drag to reorder">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="4" r="1.5"/>
        <circle cx="5" cy="8" r="1.5"/>
        <circle cx="5" cy="12" r="1.5"/>
        <circle cx="11" cy="4" r="1.5"/>
        <circle cx="11" cy="8" r="1.5"/>
        <circle cx="11" cy="12" r="1.5"/>
      </svg>
    </div>
    <div class="album-card__body">
      <h3 class="album-card__title">${escapeHtml(album.title)}</h3>
      <p class="album-card__date">${escapeHtml(formatAlbumDate(album.album_date))}</p>
    </div>
    <div class="album-card__actions" role="group" aria-label="Reorder ${escapeHtml(album.title)}">
      <button
        class="btn-icon move-up"
        data-action="move-up"
        aria-label="Move ${escapeHtml(album.title)} up"
        title="Move up"
      >↑</button>
      <button
        class="btn-icon move-down"
        data-action="move-down"
        aria-label="Move ${escapeHtml(album.title)} down"
        title="Move down"
      >↓</button>
    </div>
  `;

  // Open album on click (not on button clicks)
  card.addEventListener('click', (e) => {
    if (/** @type {HTMLElement} */ (e.target).closest('button')) return;
    window.location.href = `./album.html?id=${album.id}`;
  });

  // Keyboard: Enter / Space opens album
  card.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !/** @type {HTMLElement} */ (e.target).closest('button')) {
      e.preventDefault();
      window.location.href = `./album.html?id=${album.id}`;
    }
  });

  return card;
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
