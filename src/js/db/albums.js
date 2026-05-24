/**
 * albums.js — Album DAO.
 * All functions accept a sql.js Database instance as the first argument
 * to enable clean dependency injection in tests.
 */

/**
 * @typedef {Object} Album
 * @property {number} id
 * @property {string} title
 * @property {string} album_date
 * @property {number} display_order
 * @property {string} created_at
 * @property {string} updated_at
 */

/** @param {string[]} cols @param {unknown[]} row @returns {Album} */
function rowToAlbum(cols, row) {
  return /** @type {Album} */ (Object.fromEntries(cols.map((c, i) => [c, row[i]])));
}

/**
 * Create a new album.
 * @param {import('sql.js').Database} db
 * @param {{ title: string, albumDate: string }} params
 * @returns {number} new album id
 */
export function createAlbum(db, { title, albumDate }) {
  if (!title || !title.trim()) throw new Error('Album title is required');
  if (!albumDate) throw new Error('Album date is required');

  const maxResult = db.exec('SELECT COALESCE(MAX(display_order), -1) FROM albums');
  const maxOrder = /** @type {number} */ (maxResult[0]?.values[0][0] ?? -1);
  const newOrder = maxOrder + 1;
  const now = new Date().toISOString();

  db.run(
    'INSERT INTO albums (title, album_date, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [title.trim(), albumDate, newOrder, now, now]
  );

  const idResult = db.exec('SELECT last_insert_rowid()');
  return /** @type {number} */ (idResult[0].values[0][0]);
}

/**
 * List all albums ordered by display_order.
 * @param {import('sql.js').Database} db
 * @returns {Album[]}
 */
export function listAlbums(db) {
  const result = db.exec(
    'SELECT id, title, album_date, display_order, created_at, updated_at FROM albums ORDER BY display_order ASC'
  );
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => rowToAlbum(columns, row));
}

/**
 * Get a single album by id.
 * @param {import('sql.js').Database} db
 * @param {number} id
 * @returns {Album|null}
 */
export function getAlbum(db, id) {
  const result = db.exec(
    'SELECT id, title, album_date, display_order, created_at, updated_at FROM albums WHERE id = ?',
    [id]
  );
  if (!result.length) return null;
  const { columns, values } = result[0];
  return rowToAlbum(columns, values[0]);
}

/**
 * Reassign display_order for all albums in one transaction.
 * @param {import('sql.js').Database} db
 * @param {number[]} orderedIds - album ids in desired new order
 */
export function updateAlbumOrder(db, orderedIds) {
  if (!orderedIds.length) return;
  db.run('BEGIN TRANSACTION');
  try {
    const now = new Date().toISOString();
    orderedIds.forEach((id, index) => {
      db.run('UPDATE albums SET display_order = ?, updated_at = ? WHERE id = ?', [index, now, id]);
    });
    db.run('COMMIT');
  } catch (e) {
    db.run('ROLLBACK');
    throw e;
  }
}

/**
 * Delete an album (cascades to its photos).
 * @param {import('sql.js').Database} db
 * @param {number} id
 */
export function deleteAlbum(db, id) {
  db.run('DELETE FROM albums WHERE id = ?', [id]);
}
