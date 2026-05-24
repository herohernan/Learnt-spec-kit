/**
 * file-access.js — File System Access API wrapper with <input type="file"> fallback.
 */

/**
 * Open the native file picker and return an array of File objects.
 * Uses the File System Access API when available; falls back to a
 * programmatic <input type="file"> element.
 * @returns {Promise<File[]>}
 */
export async function pickFiles() {
  if (typeof window !== 'undefined' && typeof window.showOpenFilePicker === 'function') {
    try {
      const handles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'],
            },
          },
        ],
      });
      return Promise.all(handles.map((h) => h.getFile()));
    } catch (err) {
      if (/** @type {Error} */ (err).name === 'AbortError') return [];
      // Fall through on other errors
    }
  }

  // Fallback: programmatic <input type="file">
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => {
      if (document.body.contains(input)) document.body.removeChild(input);
    };

    input.addEventListener('change', () => {
      const files = Array.from(input.files ?? []);
      cleanup();
      resolve(files);
    });

    input.addEventListener('cancel', () => {
      cleanup();
      resolve([]);
    });

    input.click();
  });
}
