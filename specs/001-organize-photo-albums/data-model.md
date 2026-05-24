# Data Model: Date-Grouped Photo Albums

**Phase**: 1 — Design & Contracts
**Feature**: `001-organize-photo-albums`
**Date**: 2026-05-24

---

## Overview

The application stores all metadata in a local SQLite database managed by
sql.js. Photo binary data is **never** stored in the database; only file
names are recorded as human-readable labels. The schema is intentionally
minimal: two tables, `albums` and `photos`, with no nesting columns.

---

## Entities

### Album

A user-managed photo collection identified by a title and a required date.
Albums exist only at the top level — there are no parent-child album
relationships anywhere in the data model.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER | Auto-generated primary key |
| `title` | TEXT | User-supplied album name (non-empty) |
| `album_date` | TEXT | ISO 8601 date `YYYY-MM-DD`; used for grouping |
| `display_order` | INTEGER | Zero-indexed position in the overall album list; contiguously reassigned on every reorder |
| `created_at` | TEXT | UTC datetime string; set on insert |
| `updated_at` | TEXT | UTC datetime string; updated on every change |

**Validation rules**:
- `title` must not be empty (enforced in `AlbumForm.js` before insert)
- `album_date` must not be null (enforced by `NOT NULL` constraint and form
  validation)
- `display_order` must be ≥0; values are always `0, 1, 2, …` without gaps
  after each reorder operation

**Nesting rule**: the `albums` table has **no** `parent_id`, `parent_album_id`,
or equivalent column. Nesting is structurally impossible at the schema level.

---

### Photo

A reference to an image file that a user has associated with an album. The
record acts as a metadata label and ordering anchor; the image bytes remain on
the user's local filesystem.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER | Auto-generated primary key |
| `album_id` | INTEGER | Foreign key → `albums.id`; cascades on delete |
| `file_name` | TEXT | Original file name (e.g., `IMG_0042.jpg`); used as display label and memoisation key |
| `display_order` | INTEGER | Position of the photo within the album |
| `created_at` | TEXT | UTC datetime string; set on insert |

**Validation rules**:
- `album_id` must reference a valid album (enforced by FK constraint)
- `file_name` must not be empty
- `display_order` must be ≥0

---

## Relationships

```
albums ──< photos
  (one album has zero or more photos)
  (a photo belongs to exactly one album)
  (deleting an album cascades to its photos)
```

No other relationships exist. There are no junction tables, no tag tables,
and no album hierarchy.

---

## Album Date Groups (Derived, Not Stored)

**Album Date Groups** are a presentation concept computed entirely in
JavaScript from the `album_date` field. They are **not** a database table.

Logic in `AlbumGrid.js`:
```js
// Group albums by album_date
const groups = albums.reduce((acc, album) => {
  const key = album.album_date; // YYYY-MM-DD
  if (!acc[key]) acc[key] = [];
  acc[key].push(album);
  return acc;
}, {});

// Sort group keys chronologically
const sortedKeys = Object.keys(groups).sort();
```

Albums within a group are already sorted by `display_order` from the SQL
query (`ORDER BY display_order ASC`).

---

## Schema Migrations

`db.js` uses `PRAGMA user_version` to track the applied migration version.
Migrations are applied as plain SQL strings in version order.

| Version | Change |
|---|---|
| 0 | Initial state (no schema) |
| 1 | Create `albums` and `photos` tables (initial release) |

---

## State Transitions

### Album

```
[not exists]
     │ createAlbum()
     ▼
  [exists]  ←── updateAlbumOrder() ──► [exists, new display_order]
     │ deleteAlbum()
     ▼
[not exists]  (photos cascade-deleted)
```

### Photo

```
[not exists]
     │ addPhoto()
     ▼
  [exists]
     │ removePhoto()
     ▼
[not exists]
```

Photo `display_order` is set at insert time; reordering photos within an
album is out of scope for this release.

---

## Full DDL

See [`contracts/db-schema.sql`](./contracts/db-schema.sql) for the normative
SQL DDL.
