/**
 * PhotoTile.js — Single photo tile with shimmer loading and error states.
 */

/**
 * Create a photo tile element.
 * Thumbnail injection is deferred to PhotoGrid via IntersectionObserver.
 * @param {{ id: number, file_name: string, thumbnail_data_url?: string|null }} photo
 * @param {File|null} file - resolved File (null if file is unavailable)
 * @returns {HTMLElement}
 */
export function renderPhotoTile(photo, file) {
  const tile = document.createElement('div');
  tile.className = 'photo-tile';
  tile.setAttribute('data-photo-id', String(photo.id));
  tile.setAttribute('role', 'img');
  tile.setAttribute('aria-label', photo.file_name);

  if (photo.thumbnail_data_url) {
    const img = document.createElement('img');
    img.src = photo.thumbnail_data_url;
    img.alt = photo.file_name;
    img.className = 'photo-tile__img';
    tile.appendChild(img);
    return tile;
  }

  if (!file) {
    tile.classList.add('photo-tile--unavailable');
    tile.innerHTML = `
      <div class="photo-tile__error">
        <span aria-hidden="true">🚫</span>
        <span>Photo unavailable</span>
      </div>
    `;
    return tile;
  }

  // Shimmer until thumbnail is ready
  tile.classList.add('photo-tile--loading');
  tile.setAttribute('data-pending-thumbnail', 'true');
  tile.innerHTML = `
    <div class="photo-tile__shimmer" aria-hidden="true"></div>
    <p class="photo-tile__name">${escapeHtml(photo.file_name)}</p>
  `;

  return tile;
}

/**
 * Update a tile with its generated thumbnail.
 * @param {HTMLElement} tile
 * @param {string|null} dataUrl
 */
export function applyThumbnail(tile, dataUrl) {
  tile.removeAttribute('data-pending-thumbnail');
  tile.classList.remove('photo-tile--loading');

  if (!dataUrl) {
    tile.classList.add('photo-tile--unavailable');
    tile.innerHTML = `
      <div class="photo-tile__error">
        <span aria-hidden="true">🚫</span>
        <span>Photo unavailable</span>
      </div>
    `;
    return;
  }

  const img = document.createElement('img');
  img.src = dataUrl;
  img.alt = tile.getAttribute('aria-label') ?? '';
  img.className = 'photo-tile__img';

  tile.querySelector('.photo-tile__shimmer')?.remove();
  tile.insertBefore(img, tile.firstChild);
}

/** @param {string} str @returns {string} */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
