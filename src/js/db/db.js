/**
 * db.js — sql.js WASM initialisation, OPFS persistence, migration runner.
 *
 * Usage:
 *   import { initDB, persistDB } from './db.js';
 *   const db = await initDB();
 */
import initSqlJs from 'sql.js/dist/sql-wasm.js';

const DB_FILE_NAME = 'photo-albums.db';
const CURRENT_SCHEMA_VERSION = 2;

/** @type {import('sql.js').Database|null} */
let _db = null;

/** @type {FileSystemFileHandle|null} */
let _opfsHandle = null;

/** Returns true if Origin Private File System is available. */
function opfsAvailable() {
  return (
    typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    typeof navigator.storage.getDirectory === 'function'
  );
}

/**
 * Load raw database bytes from OPFS (or null if empty/missing).
 * @returns {Promise<Uint8Array|null>}
 */
async function loadFromOpfs() {
  try {
    const root = await navigator.storage.getDirectory();
    _opfsHandle = await root.getFileHandle(DB_FILE_NAME, { create: true });
    const file = await _opfsHandle.getFile();
    if (file.size === 0) return null;
    const buf = await file.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

/**
 * Serialise the in-memory database and write it to OPFS.
 * Falls back to localStorage serialisation.
 * @param {import('sql.js').Database} db
 */
export async function persistDB(db) {
  const data = db.export();

  if (_opfsHandle) {
    try {
      const writable = await _opfsHandle.createWritable();
      await writable.write(data);
      await writable.close();
      return;
    } catch {
      // fall through to localStorage
    }
  }

  // localStorage fallback (5 MB cap)
  try {
    let binary = '';
    for (let i = 0; i < data.byteLength; i++) binary += String.fromCharCode(data[i]);
    localStorage.setItem('photo-albums-db', btoa(binary));
  } catch (e) {
    console.error('Failed to persist DB:', e);
  }
}

/**
 * Load database bytes from localStorage (fallback).
 * @returns {Uint8Array|null}
 */
function loadFromLocalStorage() {
  try {
    const b64 = localStorage.getItem('photo-albums-db');
    if (!b64) return null;
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  } catch {
    return null;
  }
}

/**
 * Apply SQL migrations up to CURRENT_SCHEMA_VERSION.
 * Uses PRAGMA user_version as the version counter.
 * @param {import('sql.js').Database} db
 */
function migrateDB(db) {
  const versionResult = db.exec('PRAGMA user_version');
  const currentVersion = versionResult[0]?.values[0][0] ?? 0;

  if (currentVersion < 1) {
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
  } else if (currentVersion < 2) {
    db.run('ALTER TABLE photos ADD COLUMN thumbnail_data_url TEXT');
  }
  db.run(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION}`);
  // Future migrations: if (currentVersion < 3) { … }
}

/**
 * Initialise (or re-use) the sql.js database.
 * Load order: OPFS → localStorage → fresh database.
 * @returns {Promise<import('sql.js').Database>}
 */
export async function initDB() {
  if (_db) return _db;

  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });

  let data = null;
  if (opfsAvailable()) {
    data = await loadFromOpfs();
  }
  if (!data) {
    data = loadFromLocalStorage();
  }

  _db = data ? new SQL.Database(data) : new SQL.Database();
  _db.run('PRAGMA foreign_keys = ON');
  migrateDB(_db);

  return _db;
}

/** Return the current db instance (must call initDB first). */
export function getDB() {
  if (!_db) throw new Error('DB not initialised — call initDB() first.');
  return _db;
}

/**
 * Inject a pre-built db instance (used in unit/integration tests).
 * @param {import('sql.js').Database} db
 */
export function _setTestDB(db) {
  _db = db;
}
