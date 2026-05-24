-- db-schema.sql
-- Normative SQLite DDL for the Date-Grouped Photo Albums feature
-- Feature: 001-organize-photo-albums
-- Schema version: 1  (tracked via PRAGMA user_version)

PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 1: Initial schema
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS albums (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    album_date    TEXT    NOT NULL,  -- ISO 8601 YYYY-MM-DD
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Enforce ascending order lookups are index-assisted
CREATE INDEX IF NOT EXISTS idx_albums_display_order ON albums (display_order ASC);

-- Support efficient grouping queries
CREATE INDEX IF NOT EXISTS idx_albums_date ON albums (album_date);

CREATE TABLE IF NOT EXISTS photos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id      INTEGER NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
    file_name     TEXT    NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos (album_id, display_order ASC);

PRAGMA user_version = 1;
