/**
 * album-page.js — Album detail page bootstrap.
 */
import { initDB, persistDB } from './db/db.js';
import { getAlbum } from './db/albums.js';
import { listPhotos, addPhoto } from './db/photos.js';
import { renderPhotoGrid } from './components/PhotoGrid.js';
import { pickFiles } from './utils/file-access.js';
import { formatAlbumDate } from './utils/date-utils.js';
import { showToast } from './components/Toast.js';
import { generateThumbnail } from './utils/thumbnail.js';

const photoGridRegion = /** @type {HTMLElement} */ (document.getElementById('photo-grid-region'));
const albumTitleEl = /** @type {HTMLElement} */ (document.getElementById('album-title'));
const albumDateEl = /** @type {HTMLElement} */ (document.getElementById('album-date-display'));
const addPhotosBtn = document.getElementById('btn-add-photos');

/** @type {import('./db/db.js').Database|null} */
let _db = null;
let _albumId = 0;

/** @type {Map<string, File>} fileName → File object */
const _fileMap = new Map();

async function loadAndRender() {
  renderPhotoGrid(photoGridRegion, { state: 'loading' });
  try {
    const photos = listPhotos(_db, _albumId);
    renderPhotoGrid(photoGridRegion, {
      state: photos.length ? 'success' : 'empty',
      photos,
      fileMap: _fileMap,
    });
  } catch (err) {
    console.error('Failed to load photos:', err);
    renderPhotoGrid(photoGridRegion, { state: 'error', onRetry: loadAndRender });
  }
}

async function handleAddPhotos() {
  const files = await pickFiles();
  if (!files.length) return;

  const existingPhotos = listPhotos(_db, _albumId);
  let order = existingPhotos.length;

  for (const file of files) {
    _fileMap.set(file.name, file);
    const thumbnailDataUrl = await generateThumbnail(file);
    addPhoto(_db, {
      albumId: _albumId,
      fileName: file.name,
      displayOrder: order++,
      thumbnailDataUrl,
    });
  }

  await persistDB(_db);
  await loadAndRender();
  showToast(`Added ${files.length} photo${files.length !== 1 ? 's' : ''}`);
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  _albumId = Number(params.get('id'));

  if (!_albumId) {
    albumTitleEl.textContent = 'Album not found';
    document.title = 'Album not found — Photo Albums';
    return;
  }

  try {
    _db = await initDB();
  } catch (err) {
    console.error('DB init failed:', err);
    albumTitleEl.textContent = 'Error loading album';
    return;
  }

  const album = getAlbum(_db, _albumId);
  if (!album) {
    albumTitleEl.textContent = 'Album not found';
    document.title = 'Album not found — Photo Albums';
    return;
  }

  document.title = `${album.title} — Photo Albums`;
  albumTitleEl.textContent = album.title;
  albumDateEl.textContent = formatAlbumDate(album.album_date);

  await loadAndRender();
  addPhotosBtn?.addEventListener('click', handleAddPhotos);
}

init();
