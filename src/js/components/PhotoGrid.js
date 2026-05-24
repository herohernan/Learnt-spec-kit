/**
 * PhotoGrid.js — CSS grid of photo tiles with IntersectionObserver lazy loading.
 */
import { renderPhotoTile, applyThumbnail } from './PhotoTile.js';
import { generateThumbnail } from '../utils/thumbnail.js';

/**
 * Render the photo grid.
 * @param {HTMLElement} container
 * @param {{
 *   state: 'loading'|'empty'|'error'|'success',
 *   photos?: Array<{id:number, file_name:string}>,
 *   fileMap?: Map<string, File>,
 *   onRetry?: () => void
 * }} opts
 */
export function renderPhotoGrid(container, { state, photos = [], fileMap = new Map(), onRetry }) {
  container.innerHTML = '';

  if (state === 'loading') {
    container.innerHTML = `
      <div class="loading-state" role="status" aria-busy="true">Loading photos…</div>
      <div class="photo-grid" aria-hidden="true">
        ${'<div class="photo-tile shimmer"></div>'.repeat(8)}
      </div>
    `;
    return;
  }

  if (state === 'error') {
    const banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <span>⚠️ Could not load photos.</span>
      <button class="btn btn-ghost btn-sm retry-btn">Retry</button>
    `;
    if (onRetry) banner.querySelector('.retry-btn')?.addEventListener('click', onRetry);
    container.appendChild(banner);
    return;
  }

  if (state === 'empty' || photos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon" aria-hidden="true">📸</div>
        <h2 class="empty-state__title">No photos yet</h2>
        <p class="empty-state__desc">Add some to this album to start browsing.</p>
      </div>
    `;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'photo-grid';
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', `${photos.length} photo${photos.length !== 1 ? 's' : ''}`);

  // IntersectionObserver for lazy thumbnail loading
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const tile = /** @type {HTMLElement} */ (entry.target);
        observer.unobserve(tile);
        if (tile.getAttribute('data-pending-thumbnail') !== 'true') continue;
        const fileName = tile.getAttribute('aria-label');
        const file = fileName ? fileMap.get(fileName) : undefined;
        if (file) {
          generateThumbnail(file).then((dataUrl) => applyThumbnail(tile, dataUrl));
        }
      }
    },
    { rootMargin: '200px' }
  );

  for (const photo of photos) {
    const file = fileMap.get(photo.file_name) ?? null;
    const tile = renderPhotoTile(photo, file);
    const wrapper = document.createElement('div');
    wrapper.setAttribute('role', 'listitem');
    wrapper.appendChild(tile);
    grid.appendChild(wrapper);
    if (file && tile.getAttribute('data-pending-thumbnail') === 'true') {
      observer.observe(tile);
    }
  }

  container.appendChild(grid);
}
