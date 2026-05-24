/**
 * AlbumForm.js — Create album modal form.
 * Handles validation, file picking, and submission.
 */
import { pickFiles } from '../utils/file-access.js';
import { showToast } from './Toast.js';

/** @type {File[]} selected files for the current form session */
let _selectedFiles = [];

/**
 * Render the album creation form into the dialog and wire up events.
 * @param {HTMLDialogElement} dialog
 * @param {{ onSave: (data: {title:string, albumDate:string, files:File[]}) => Promise<void> }} opts
 */
export function renderAlbumForm(dialog, { onSave }) {
  _selectedFiles = [];

  dialog.innerHTML = `
    <div class="dialog-header">
      <h2 class="dialog-title" id="dialog-title">Create album</h2>
      <button class="btn btn-ghost btn-sm close-btn" aria-label="Close create album dialog">✕</button>
    </div>
    <form class="dialog-body" id="album-form" novalidate>
      <div class="form-group">
        <label class="form-label" for="album-title-input">
          Album title <span aria-hidden="true">*</span>
        </label>
        <input
          class="form-control"
          type="text"
          id="album-title-input"
          name="title"
          placeholder="e.g. Summer Road Trip"
          required
          autocomplete="off"
        />
        <p class="form-error" id="title-error" role="alert" hidden></p>
      </div>
      <div class="form-group">
        <label class="form-label" for="album-date-input">
          Album date <span aria-hidden="true">*</span>
        </label>
        <input
          class="form-control"
          type="date"
          id="album-date-input"
          name="albumDate"
          required
        />
        <p class="form-error" id="date-error" role="alert" hidden></p>
      </div>
      <div class="form-group">
        <label class="form-label">Photos <span style="font-weight:400">(optional)</span></label>
        <button type="button" class="btn btn-ghost" id="btn-add-photos-form">+ Add photos</button>
        <div
          class="chip-list"
          id="photo-chip-list"
          aria-label="Selected photos"
          role="list"
        ></div>
      </div>
    </form>
    <div class="dialog-footer">
      <button class="btn btn-ghost" type="button" id="btn-cancel-form">Cancel</button>
      <button class="btn btn-primary" type="submit" form="album-form" id="btn-save-form">Save album</button>
    </div>
  `;

  const form = /** @type {HTMLFormElement} */ (dialog.querySelector('#album-form'));
  const titleInput = /** @type {HTMLInputElement} */ (dialog.querySelector('#album-title-input'));
  const dateInput = /** @type {HTMLInputElement} */ (dialog.querySelector('#album-date-input'));
  const titleError = /** @type {HTMLElement} */ (dialog.querySelector('#title-error'));
  const dateError = /** @type {HTMLElement} */ (dialog.querySelector('#date-error'));
  const chipList = /** @type {HTMLElement} */ (dialog.querySelector('#photo-chip-list'));
  const addPhotosBtn = dialog.querySelector('#btn-add-photos-form');

  const closeDialog = () => {
    _selectedFiles = [];
    dialog.close();
  };

  dialog.querySelector('.close-btn')?.addEventListener('click', closeDialog);
  dialog.querySelector('#btn-cancel-form')?.addEventListener('click', closeDialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog();
  });

  addPhotosBtn?.addEventListener('click', async () => {
    const files = await pickFiles();
    for (const f of files) {
      if (!_selectedFiles.some((x) => x.name === f.name && x.size === f.size)) {
        _selectedFiles.push(f);
      }
    }
    renderChips(chipList, _selectedFiles);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const albumDate = dateInput.value;
    let valid = true;

    titleError.hidden = true;
    dateError.hidden = true;
    titleInput.classList.remove('form-control--error');
    dateInput.classList.remove('form-control--error');

    if (!title) {
      titleError.textContent = 'Album title is required';
      titleError.hidden = false;
      titleInput.classList.add('form-control--error');
      titleInput.focus();
      valid = false;
    }
    if (!albumDate) {
      dateError.textContent = 'Album date is required';
      dateError.hidden = false;
      dateInput.classList.add('form-control--error');
      if (valid) dateInput.focus();
      valid = false;
    }
    if (!valid) return;

    const saveBtn = /** @type {HTMLButtonElement} */ (dialog.querySelector('#btn-save-form'));
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      await onSave({ title, albumDate, files: [..._selectedFiles] });
      closeDialog();
    } catch (err) {
      showToast('Could not save album. Please try again.', 'error');
      console.error('Album save error:', err);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save album';
    }
  });
}

/**
 * Render file name chips.
 * @param {HTMLElement} container
 * @param {File[]} files
 */
function renderChips(container, files) {
  container.innerHTML = '';
  files.forEach((file, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.setAttribute('role', 'listitem');
    chip.innerHTML = `
      <span class="chip-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
      <button class="chip-remove" type="button" aria-label="Remove ${escapeHtml(file.name)}">✕</button>
    `;
    chip.querySelector('.chip-remove')?.addEventListener('click', () => {
      files.splice(i, 1);
      renderChips(container, files);
    });
    container.appendChild(chip);
  });
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
