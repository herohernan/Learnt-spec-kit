/**
 * tests/helpers/db.js — In-memory sql.js database factory for tests.
 */
import initSqlJs from 'sql.js';

/**
 * Create a fresh in-memory database with migrations applied.
 * Pass this to any DAO function instead of the OPFS-backed production DB.
 * @returns {Promise<import('sql.js').Database>}
 */
export async function createTestDb() {
  const SQL = await initSqlJs({
    locateFile: (f) => `node_modules/sql.js/dist/${f}`,
  });
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS albums (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT    NOT NULL,
      album_date    TEXT    NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS photos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id      INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      file_name     TEXT    NOT NULL,
      thumbnail_data_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_albums_display_order ON albums(display_order);
    CREATE INDEX IF NOT EXISTS idx_albums_album_date    ON albums(album_date);
    CREATE INDEX IF NOT EXISTS idx_photos_album_id      ON photos(album_id, display_order);
  `);

  db.run('PRAGMA user_version = 2');
  return db;
}
