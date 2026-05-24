/**
 * photos.js — Photo DAO.
 */

/**
 * @typedef {Object} Photo
 * @property {number} id
 * @property {number} album_id
 * @property {string} file_name
 * @property {number} display_order
 * @property {string} created_at
 */

/** @param {string[]} cols @param {unknown[]} row @returns {Photo} */
function rowToPhoto(cols, row) {
  return /** @type {Photo} */ (Object.fromEntries(cols.map((c, i) => [c, row[i]])));
}

/**
 * Add a photo to an album.
 * @param {import('sql.js').Database} db
 * @param {{ albumId: number, fileName: string, displayOrder: number }} params
 * @returns {number} new photo id
 */
export function addPhoto(db, { albumId, fileName, displayOrder }) {
  if (!fileName) throw new Error('File name is required');
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO photos (album_id, file_name, display_order, created_at) VALUES (?, ?, ?, ?)',
    [albumId, fileName, displayOrder, now]
  );
  const idResult = db.exec('SELECT last_insert_rowid()');
  return /** @type {number} */ (idResult[0].values[0][0]);
}

/**
 * List photos in an album ordered by display_order.
 * @param {import('sql.js').Database} db
 * @param {number} albumId
 * @returns {Photo[]}
 */
export function listPhotos(db, albumId) {
  const result = db.exec(
    'SELECT id, album_id, file_name, display_order, created_at FROM photos WHERE album_id = ? ORDER BY display_order ASC',
    [albumId]
  );
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => rowToPhoto(columns, row));
}

/**
 * Remove a photo by id.
 * @param {import('sql.js').Database} db
 * @param {number} id
 */
export function removePhoto(db, id) {
  db.run('DELETE FROM photos WHERE id = ?', [id]);
}
