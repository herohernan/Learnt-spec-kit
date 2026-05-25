/**
 * thumbnail.js — Canvas-based thumbnail generation with Web Worker offload.
 * Memoises results by file identity key to avoid redundant regeneration.
 */
// Vite-native worker import — bundled and served correctly in dev and prod
import ThumbnailWorker from '../../workers/thumbnail.worker.js?worker';

/** @type {Map<string, string>} */
const _cache = new Map();

/** @type {Worker|null} */
let _worker = null;

/** @type {Map<string, Array<(url: string|null) => void>>} */
const _pending = new Map();

/**
 * Build a stable memo key for a File.
 * @param {{ name: string, size: number, lastModified: number }} file
 * @returns {string}
 */
export function fileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

/**
 * Calculate scaled dimensions preserving aspect ratio (no upscaling).
 * @param {number} width
 * @param {number} height
 * @param {number} maxSize
 * @returns {{ w: number, h: number }}
 */
export function calcScaledSize(width, height, maxSize) {
  const ratio = Math.min(maxSize / width, maxSize / height, 1);
  return {
    w: Math.max(1, Math.round(width * ratio)),
    h: Math.max(1, Math.round(height * ratio)),
  };
}

/** Get (or lazily create) the thumbnail Web Worker. */
function getWorker() {
  if (!_worker) {
    _worker = new ThumbnailWorker();
    _worker.addEventListener('message', ({ data }) => {
      const { key, dataUrl, error } = data;
      const callbacks = _pending.get(key) ?? [];
      _pending.delete(key);
      if (error) {
        callbacks.forEach((cb) => cb(null));
      } else {
        _cache.set(key, dataUrl);
        callbacks.forEach((cb) => cb(dataUrl));
      }
    });
  }
  return _worker;
}

/**
 * Generate a thumbnail for a File using the Web Worker.
 * Returns the cached data URL if already generated.
 * @param {File} file
 * @param {number} [maxSize=300]
 * @returns {Promise<string|null>} data URL or null on error
 */
export function generateThumbnail(file, maxSize = 300) {
  const key = fileKey(file);
  if (_cache.has(key)) return Promise.resolve(_cache.get(key) ?? null);

  if (_pending.has(key)) {
    return new Promise((resolve) => _pending.get(key)?.push(resolve));
  }

  return new Promise((resolve) => {
    _pending.set(key, [resolve]);
    getWorker().postMessage({ file, maxSize, key });
  });
}

/** Clear the memo cache (used in tests). */
export function clearThumbnailCache() {
  _cache.clear();
}
