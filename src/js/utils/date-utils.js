/**
 * date-utils.js — ISO date formatting and album date-group utilities.
 */

/**
 * Format an ISO date string (YYYY-MM-DD) to a human-readable label.
 * Parses as UTC to avoid timezone shift on any locale.
 * @param {string} isoDate
 * @returns {string}  e.g. "July 14, 2024"
 */
export function formatAlbumDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Extract the YYYY-MM-DD group key from an album_date field.
 * (Passthrough — album_date is already YYYY-MM-DD.)
 * @param {string} albumDate
 * @returns {string}
 */
export function getGroupKey(albumDate) {
  return albumDate;
}

/**
 * Group albums by album_date, sorted chronologically.
 * Albums within each group retain their display_order from the query.
 * @param {Array<{album_date: string, [key: string]: unknown}>} albums
 * @returns {Array<{key: string, label: string, albums: typeof albums}>}
 */
export function groupAlbumsByDate(albums) {
  /** @type {Map<string, typeof albums>} */
  const map = new Map();
  for (const album of albums) {
    const key = getGroupKey(album.album_date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(album);
  }
  const sortedKeys = [...map.keys()].sort();
  return sortedKeys.map((key) => ({
    key,
    label: formatAlbumDate(key),
    albums: map.get(key),
  }));
}
