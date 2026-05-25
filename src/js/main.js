/**
 * main.js — Main page bootstrap.
 * Initialises the database, loads albums, and wires the UI.
 */
import { initDB, persistDB } from './db/db.js';
import { listAlbums, createAlbum, updateAlbumOrder } from './db/albums.js';
import { addPhoto } from './db/photos.js';
import { renderAlbumGrid } from './components/AlbumGrid.js';
import { renderAlbumForm } from './components/AlbumForm.js';
import { attachDragDrop } from './components/DragDrop.js';
import { showToast } from './components/Toast.js';
import { generateThumbnail } from './utils/thumbnail.js';

const container = /** @type {HTMLElement} */ (document.getElementById('album-list-region'));
const dialog = /** @type {HTMLDialogElement} */ (document.getElementById('album-form-dialog'));
const createBtn = document.getElementById('btn-create-album');

/** @type {import('./db/db.js').Database|null} */
let _db = null;

/** Album ids in current rendered order. */
let _currentIds = /** @type {number[]} */ ([]);

async function loadAndRender() {
  renderAlbumGrid(container, { state: 'loading' });
  try {
    const albums = listAlbums(_db);
    _currentIds = albums.map((a) => a.id);
    renderAlbumGrid(container, {
      state: albums.length ? 'success' : 'empty',
      albums,
    });
    wireReorder();
  } catch (err) {
    console.error('Failed to load albums:', err);
    renderAlbumGrid(container, { state: 'error', onRetry: loadAndRender });
  }
}

function wireReorder() {
  attachDragDrop(container, {
    getAlbumIds: () => _currentIds,
    onReorder: async (newIds) => {
      try {
        updateAlbumOrder(_db, newIds);
        await persistDB(_db);
        _currentIds = newIds;
        const albums = listAlbums(_db);
        renderAlbumGrid(container, { state: 'success', albums });
        wireReorder();
      } catch (err) {
        console.error('Reorder failed:', err);
        showToast('Could not save new order. Please try again.', 'error');
      }
    },
  });
}

/**
 * @param {{ title: string, albumDate: string, files: File[] }} param0
 */
async function handleCreateAlbum({ title, albumDate, files }) {
  const albumId = createAlbum(_db, { title, albumDate });
  for (const [i, file] of files.entries()) {
    const thumbnailDataUrl = await generateThumbnail(file);
    addPhoto(_db, {
      albumId,
      fileName: file.name,
      displayOrder: i,
      thumbnailDataUrl,
    });
  }
  await persistDB(_db);
  await loadAndRender();
  showToast(`Album “${title}” created`);
}

async function init() {
  try {
    _db = await initDB();
  } catch (err) {
    console.error('DB init failed:', err);
    renderAlbumGrid(container, {
      state: 'error',
      onRetry: () => window.location.reload(),
    });
    return;
  }

  await loadAndRender();

  createBtn?.addEventListener('click', () => {
    renderAlbumForm(dialog, { onSave: handleCreateAlbum });
    dialog.showModal();
  });
}

init();
