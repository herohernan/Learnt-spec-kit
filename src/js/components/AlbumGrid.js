/**
 * AlbumGrid.js — Groups albums by date and renders the main page grid.
 * Handles success, loading, empty, and error states.
 */
import { groupAlbumsByDate } from '../utils/date-utils.js';
import { renderAlbumCard } from './AlbumCard.js';

/**
 * Render the album grid into the container element.
 * @param {HTMLElement} container
 * @param {{
 *   state: 'loading'|'empty'|'error'|'success',
 *   albums?: Array<{id:number,title:string,album_date:string,display_order:number}>,
 *   onRetry?: () => void
 * }} opts
 */
export function renderAlbumGrid(container, { state, albums = [], onRetry }) {
  container.innerHTML = '';

  if (state === 'loading') {
    container.innerHTML = `
      <div class="loading-state" role="status" aria-busy="true" aria-label="Loading albums">
        <span aria-hidden="true">⧐</span>
        Loading albums…
      </div>
      <div class="album-grid" aria-hidden="true">
        ${'<div class="shimmer shimmer-card"></div>'.repeat(4)}
      </div>
    `;
    return;
  }

  if (state === 'error') {
    const banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <span>⚠️ Could not load albums.</span>
      <button class="btn btn-ghost btn-sm retry-btn">Retry</button>
    `;
    if (onRetry) banner.querySelector('.retry-btn')?.addEventListener('click', onRetry);
    container.appendChild(banner);
    return;
  }

  if (state === 'empty' || albums.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon" aria-hidden="true">📷</div>
        <h2 class="empty-state__title">No albums yet</h2>
        <p class="empty-state__desc">Create your first dated album to start organising your photos.</p>
      </div>
    `;
    return;
  }

  // Success: group by date and render sections
  const groups = groupAlbumsByDate(albums);
  const fragment = document.createDocumentFragment();

  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'date-group';
    section.setAttribute('aria-label', `Albums from ${group.label}`);

    const heading = document.createElement('h2');
    heading.className = 'date-group-heading';
    heading.textContent = group.label;
    section.appendChild(heading);

    const grid = document.createElement('ul');
    grid.className = 'album-grid';
    grid.setAttribute('role', 'list');

    for (const album of group.albums) {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      li.appendChild(renderAlbumCard(album));
      grid.appendChild(li);
    }

    section.appendChild(grid);
    fragment.appendChild(section);
  }

  container.appendChild(fragment);
}
