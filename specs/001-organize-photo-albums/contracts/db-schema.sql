-- db-schema.sql
-- Normative SQLite DDL for the Date-Grouped Photo Albums feature.
-- Applied by db/db.js via the migration runner (PRAGMA user_version).
-- Version: 1

PRAGMA foreign_keys = ON;

-- Migration 1 ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS albums (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT    NOT NULL,
  album_date    TEXT    NOT NULL,          -- ISO 8601: YYYY-MM-DD
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  -- No parent_album_id: nesting is structurally impossible (FR-003)
);

CREATE TABLE IF NOT EXISTS photos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id      INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  file_name     TEXT    NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_albums_display_order ON albums(display_order);
CREATE INDEX IF NOT EXISTS idx_albums_album_date    ON albums(album_date);
CREATE INDEX IF NOT EXISTS idx_photos_album_id      ON photos(album_id, display_order);
