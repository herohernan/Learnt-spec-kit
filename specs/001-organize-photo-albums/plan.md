# Implementation Plan: Date-Grouped Photo Albums

**Branch**: `001-organize-photo-albums` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-organize-photo-albums/spec.md`

**Note**: This plan was produced by the `/speckit.plan` command.

---

## Summary

Build a fully client-side, single-page web application that lets users create
date-stamped photo albums, browse and preview album photos in a tile grid, and
reorder albums on the main page via drag-and-drop (with a keyboard-accessible
fallback). All metadata is persisted in a local SQLite database (sql.js +
Origin Private File System). Photos are never uploaded—they are read from the
local filesystem via the File System Access API or `<input type="file">` and
rendered as canvas-generated thumbnails. The stack is **Vite + Vanilla
JavaScript/HTML/CSS** with the absolute minimum of third-party dependencies.

---

## Technical Context

**Language/Version**: JavaScript ES2022+, HTML5, CSS3 (no framework)

**Build Tool**: Vite 5.x

**Primary Dependencies**:
- `sql.js` ^1.12 — SQLite compiled to WASM; runs entirely in the browser
- `vite` ^5 — build tooling and dev server
- `vitest` ^1 — unit/integration tests (Vite-native, zero config overhead)
- `@playwright/test` ^1 — browser-level E2E and accessibility tests
- `eslint` + `prettier` — code quality gates

No UI framework, no CSS library, no drag-drop library beyond the native HTML5
Drag and Drop API.

**Storage**:
- **Database**: sql.js database persisted to the Origin Private File System
  (OPFS) via `navigator.storage.getDirectory()`. Falls back to
  `localStorage` serialisation in browsers without OPFS support.
- **Photos**: file references only; images are never copied to any server or
  browser storage. The File System Access API (`showOpenFilePicker`) is used
  when available; `<input type="file">` is the fallback.

**Testing**:
- **Unit**: Vitest — isolated logic (DB queries, date grouping, reorder
  algorithm, thumbnail sizing)
- **Integration**: Vitest (jsdom) — album creation flow, photo association,
  order persistence
- **E2E / Accessibility**: Playwright — drag-drop visual feedback, keyboard
  reorder, empty/loading/error states, screen-reader-compatible labels

**Code Quality Gates**:
- ESLint (`eslint:recommended` + `plugin:vitest/recommended`) — all files
- Prettier — consistent formatting enforced pre-commit
- `vite build` must succeed with zero warnings
- No unused exports or dead code paths (`eslint no-unused-vars`)

**Target Platform**: Modern Chromium / Firefox / Safari (latest two releases).
OPFS and File System Access API require a secure context (HTTPS or localhost).

**Project Type**: Client-side web application (no backend)

**UX Consistency Reference**:
- Terminology: "album", "album date", "photo", "photo tile", "reorder"
  (never "move into", "nest", "parent")
- States defined for every surface: **success**, **loading**, **empty**,
  **error** — see Acceptance Scenarios in spec
- Accessible controls: all interactive elements have ARIA roles and labels;
  keyboard reorder uses `aria-grabbed` / `aria-dropeffect` or equivalent
  listbox pattern

**Performance Goals**:
- Main page renders ≤200 albums grouped by date in **≤2 s** (SC-002)
- Album detail page renders initial tile previews for ≤250 photos in **≤2 s**
  (SC-003)
- Reorder confirmation visible within **≤1 s** of drop (PR-003)

**Constraints**:
- No server round-trips — all persistence is client-local
- Albums are strictly flat (C-001, FR-003, FR-006)
- Date grouping is from the album's assigned date field only (C-003)
- Drag-drop applies to the album list only, not inside an album (C-002)
- Minimum external libraries (user constraint)

**Scale/Scope**: Single user, up to 200 albums / 250 photos per album in the
first release

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Code Quality ✅
- ESLint + Prettier configured at repo root; CI will fail on lint errors
- `vite build --strict` gates the build pipeline
- All non-obvious architectural decisions (OPFS fallback, canvas thumbnail
  approach, keyboard-reorder pattern) are documented in this plan and in
  inline comments adjacent to the relevant code

### Testing ✅
Tests are written **before** implementation is accepted (constitution II):

| Test Layer | Coverage |
|---|---|
| Unit (Vitest) | DB DAOs (albums, photos), date-grouping util, reorder algorithm, thumbnail sizing |
| Integration (Vitest + jsdom) | Album creation flow, photo association, order persistence after reload, nesting prevention |
| E2E (Playwright) | Drag-and-drop reorder, keyboard reorder, empty/loading/error states, accessibility labels |
| Regression | Nesting is never created; saved order survives page reload |

Each test file is written as a failing test first; the implementation that
makes it green is accepted only after all tests in that file pass.

### User Experience Consistency ✅
- `UX-001`: Shared `terminology.md` (in `contracts/`) locks copy across views
- `UX-002`: Main page defines success, loading, empty, and error states for
  album list, album creation, and reorder feedback
- `UX-003`: Album detail defines success, loading, empty, and error states for
  tile grid
- `UX-004`: Drop targets show "reorder only" affordance (insertion line, not
  overlap highlight) making nesting visually impossible
- `UX-005`: Playwright accessibility audit + manual screen-reader pass required
  before feature sign-off

### Performance ✅
| Journey | Budget | Measurement |
|---|---|---|
| Main page (200 albums) | ≤2 s render | Playwright `page.evaluate` Performance API |
| Album detail (250 photos, initial tiles) | ≤2 s render | Playwright Performance API |
| Reorder confirmed | ≤1 s after drop | Playwright interaction timing |

Baseline: measured on first scaffold build before feature work begins.
A >10% regression relative to baseline is a blocker (PR-004).

**Mitigations if budget is exceeded**:
- Virtualise album grid (render only visible rows) for main page
- Move thumbnail generation to a Web Worker
- Defer off-screen thumbnail decode with `IntersectionObserver`

### Exception Handling
No constitutional violations at plan time. Complexity Tracking section is
empty.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-organize-photo-albums/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: SQLite schema and entity relationships
├── quickstart.md        # Phase 1: developer setup guide
├── contracts/
│   ├── db-schema.sql    # Normative SQLite DDL
│   └── terminology.md   # Canonical copy/terminology reference
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
# Single client-side web application

src/
├── index.html               # Main page: date-grouped album list
├── album.html               # Album detail page: photo tile grid
├── css/
│   ├── reset.css            # Minimal CSS reset
│   ├── main.css             # Main page styles
│   ├── album.css            # Album detail styles
│   └── components/
│       ├── album-card.css   # Album card (title, date, thumbnail strip)
│       ├── drag-drop.css    # Drag-over indicator, insertion line
│       └── photo-tile.css   # Tile size, loading shimmer, error state
├── js/
│   ├── main.js              # Entry point: main page bootstrap
│   ├── album-page.js        # Entry point: album detail bootstrap
│   ├── db/
│   │   ├── db.js            # sql.js init, OPFS persistence, migrations
│   │   ├── albums.js        # Album DAO (CRUD + reorder)
│   │   └── photos.js        # Photo DAO (CRUD)
│   ├── components/
│   │   ├── AlbumCard.js     # Renders one album card (vanilla custom element or plain function)
│   │   ├── AlbumGrid.js     # Groups cards by date, renders sections
│   │   ├── AlbumForm.js     # Create / edit album modal form
│   │   ├── PhotoTile.js     # Renders one photo tile (canvas preview)
│   │   ├── PhotoGrid.js     # Tile grid with lazy loading
│   │   └── DragDrop.js      # Native HTML5 DnD + keyboard reorder controller
│   └── utils/
│       ├── file-access.js   # File System Access API wrapper (+ input fallback)
│       ├── thumbnail.js     # Canvas thumbnail generation (+ Web Worker offload)
│       └── date-utils.js    # ISO date formatting, group-key extraction
├── workers/
│   └── thumbnail.worker.js  # Off-main-thread thumbnail generation
└── assets/
    └── icons/               # SVG icons (drag handle, calendar, empty state)

tests/
├── unit/
│   ├── db/
│   │   ├── albums.test.js   # Album DAO unit tests
│   │   └── photos.test.js   # Photo DAO unit tests
│   └── utils/
│       ├── date-utils.test.js
│       └── thumbnail.test.js
├── integration/
│   ├── album-creation.test.js   # Create → persist → reload cycle
│   ├── album-reorder.test.js    # Reorder → persist → reload cycle
│   └── photo-association.test.js
└── e2e/
    ├── album-creation.spec.js   # Playwright: create album, validation
    ├── album-reorder.spec.js    # Playwright: DnD + keyboard reorder
    ├── album-detail.spec.js     # Playwright: tile grid, empty state
    └── accessibility.spec.js    # Playwright: axe-core audit

vite.config.js
vitest.config.js
package.json
.eslintrc.js
.prettierrc
```

**Structure Decision**: Single client-side application (Option 1 variant).
No backend. All source under `src/`; tests under `tests/` mirroring the `src/`
structure. Web Worker kept in `src/workers/` so Vite resolves it automatically
with `new Worker(new URL('./workers/thumbnail.worker.js', import.meta.url))`.

---

## Implementation Phases

### Phase 1 — Scaffold

**Goal**: Running Vite dev server with two HTML pages, CSS skeleton, and linting.

**Tasks**:
1. `npm create vite@latest . -- --template vanilla` (or hand-roll `package.json`)
2. Configure `vite.config.js`:
   - Multi-page entries: `index.html` and `album.html` via `build.rollupOptions.input`
   - COOP/COEP headers for OPFS (SharedArrayBuffer requirement for sql.js WASM):
     ```js
     server: {
       headers: {
         'Cross-Origin-Opener-Policy': 'same-origin',
         'Cross-Origin-Embedder-Policy': 'require-corp',
       },
     }
     ```
3. Add `.eslintrc.js` and `.prettierrc`; run `eslint --init` targeting ES2022 modules
4. Create placeholder HTML pages with semantic landmarks (`<header>`, `<main>`,
   `<nav>`, region ARIA labels)
5. Add CSS reset and global tokens (colours, spacing, font sizes) as CSS custom
   properties
6. Vitest: add `vitest.config.js` with jsdom environment for component tests
7. Playwright: `npx playwright install`; create `playwright.config.js`

**Exit condition**: `npm run dev` serves both pages; `npm run lint` exits 0;
`npm test` runs (zero tests pass — acceptable at scaffold stage).

---

### Phase 2 — Data Layer

**Goal**: SQLite database initialised in-browser with full CRUD for albums and
photos, persisted via OPFS (localStorage fallback).

**Tasks**:
1. Install sql.js: `npm install sql.js`
2. Copy `sql-wasm.wasm` to `public/` via `vite.config.js` copy plugin
   (`vite-plugin-static-copy` or manual `public/` placement — prefer `public/`
   to avoid an extra plugin)
3. `db/db.js`:
   - `initDB()`: loads WASM, reads `.db` file from OPFS if it exists, runs
     migrations, returns `db` instance
   - `persistDB(db)`: serialises db to `Uint8Array` and writes to OPFS
   - `migrateDB(db)`: applies DDL from `contracts/db-schema.sql` (schema
     versioning via `PRAGMA user_version`)
4. `db/albums.js`:
   - `createAlbum({title, albumDate})` → inserts, returns new id
   - `listAlbums()` → `SELECT … ORDER BY display_order`
   - `updateAlbumOrder(orderedIds)` → updates `display_order` in a transaction
   - `getAlbum(id)` → single album row
   - `deleteAlbum(id)` → cascades to photos
5. `db/photos.js`:
   - `addPhoto({albumId, fileName, displayOrder})` → inserts
   - `listPhotos(albumId)` → `ORDER BY display_order`
   - `removePhoto(id)`
6. Write **unit tests first** (`tests/unit/db/`):
   - Each DAO function has at least one passing and one failing scenario
   - Tests use an in-memory sql.js instance (no OPFS in test environment)
7. Write **integration tests** (`tests/integration/`):
   - Album creation → `listAlbums()` returns new album in correct order
   - Reorder → saved order matches input array on next `listAlbums()`
   - Nesting prevention: schema enforces no `parent_album_id` column exists

**Exit condition**: All unit + integration DB tests pass; `npm run build` exits 0.

---

### Phase 3 — Album Management (Main Page)

**Goal**: Main page shows date-grouped album cards; users can create albums.

**Tasks**:
1. `AlbumGrid.js`:
   - `render(albums)` groups albums by `album_date` (ISO YYYY-MM-DD), sorts
     groups chronologically, renders `<section>` per group with a date heading
   - Handles **empty state**: "No albums yet — create your first one"
   - Handles **loading state**: shimmer card placeholders
   - Handles **error state**: error banner with retry action
2. `AlbumCard.js`:
   - Renders title, formatted date, thumbnail strip (first 3 photo tiles, lazy)
   - `data-album-id` attribute for DnD wiring
   - Keyboard: `role="button"` + `tabindex="0"`, Enter/Space opens album
3. `AlbumForm.js` (modal):
   - Fields: title (required), album date (required `<input type="date">`)
   - Client-side validation before submit; surfaces error messages inline
   - On success: calls `createAlbum()`, re-renders grid, closes modal
   - FR-013: shows clear message when creation cannot complete
4. `main.js`: bootstraps `initDB()`, `listAlbums()`, renders `AlbumGrid`
5. Write **integration tests**:
   - Form submitted without date → error shown, album not created (FR-013 / AC 1.3)
   - Album created → appears in correct date group (AC 1.1)
   - Multiple albums on same date → same group, individually reorderable (Edge Cases)
6. Write **E2E tests** (Playwright):
   - `album-creation.spec.js`: full form flow, empty state, error state

**Exit condition**: E2E album-creation tests pass; main page shows success,
loading, empty, error states.

---

### Phase 4 — Photo Management (Album Detail Page)

**Goal**: Users can add photos to an album during creation or from the album
detail view; photos are listed in the tile grid.

**Tasks**:
1. `utils/file-access.js`:
   - `pickFiles()`: tries `showOpenFilePicker({multiple: true})`; falls back to
     programmatic `<input type="file" multiple accept="image/*">` click
   - Returns array of `File` objects; never persists binary data
2. `AlbumForm.js` extended:
   - "Add photos" button calls `pickFiles()`; selected file names shown as a
     removable chip list
   - On album save: photos are inserted via `addPhoto()` with `display_order`
     based on selection order
3. `album-page.js`:
   - Reads `?id=` query param, calls `getAlbum(id)` + `listPhotos(albumId)`
   - Renders `PhotoGrid`; handles empty state ("No photos yet")
   - "Add more photos" button re-opens picker, appends new photos
4. `PhotoTile.js` (see Phase 6 for thumbnail detail):
   - Renders placeholder shimmer until thumbnail ready
   - Error state if file cannot be read ("Photo unavailable")
   - Alt text from `fileName`; `role="img"` with descriptive label
5. `PhotoGrid.js`:
   - Renders tiles in CSS Grid layout (auto-fill, min 150 px)
   - Manages tile visibility for lazy loading (Phase 6)
6. Write **unit tests** for `file-access.js` (mock File API)
7. Write **integration tests**:
   - `photo-association.test.js`: album created with 3 photos →
     `listPhotos(id)` returns 3 rows in insertion order
8. Write **E2E tests**:
   - `album-detail.spec.js`: open album, see tiles, empty state, error state

**Exit condition**: Album detail page renders tiles; E2E photo tests pass.

---

### Phase 5 — Drag-and-Drop + Keyboard Reorder

**Goal**: Albums on the main page can be reordered by drag-and-drop and by
keyboard; order persists to SQLite.

**Tasks**:
1. `DragDrop.js`:
   - Attaches `dragstart`, `dragover`, `drop`, `dragend` listeners to the
     album list container using event delegation
   - On `dragover`: inserts an insertion-line indicator between cards (never
     over a card — prevents any "drop into album" affordance, satisfying
     FR-006 and UX-004)
   - On `drop`: calls `updateAlbumOrder(newOrderedIds)`, re-renders grid
   - Drag handle: `<span role="img" aria-label="drag handle">` SVG icon on
     each card; `draggable="true"` set on the card element
2. Keyboard reorder (FR-008, UX-005):
   - Albums receive `role="listitem"` in a `role="list"`
   - "Move up" / "Move down" buttons (visually icon-only, `aria-label` set)
     shift the album one position; triggers same `updateAlbumOrder()` path
   - Order confirmed within 1 s (purely synchronous DOM + DB write)
3. `drag-drop.css`:
   - `.drag-over-before` / `.drag-over-after` → 2 px insertion line above or
     below target
   - `.dragging` → reduced opacity on the dragged card
   - No style that creates an "inside" affordance
4. Cancel behaviour: `dragend` without `drop` → insertion indicator removed,
   no order change saved (Edge Cases)
5. Write **unit tests**:
   - Reorder algorithm (pure function): given array + source/target index →
     expected output array
   - Nesting prevention: drop-onto-card scenario produces sibling order, not
     parent-child
6. Write **integration tests** (`album-reorder.test.js`):
   - Reorder + `listAlbums()` → new order matches; reload → still matches
7. Write **E2E tests** (`album-reorder.spec.js`):
   - Playwright drag-and-drop: use `page.dragAndDrop()`
   - Keyboard reorder: tab to card, activate move buttons
   - Cancelled drag: order unchanged
   - Accessibility: `accessibility.spec.js` covers drag-handle ARIA

**Exit condition**: All reorder unit, integration, and E2E tests pass; order
persists across page reload; no nesting ever created.

---

### Phase 6 — Tile Preview & Performance

**Goal**: Photo tiles show visual thumbnails quickly; performance budgets met.

**Tasks**:
1. `utils/thumbnail.js`:
   - `generateThumbnail(file, maxSize = 300)`:
     - Uses `createImageBitmap(file)` (off-main-thread decode where supported)
     - Draws to an off-screen `<canvas>` scaled to `maxSize × maxSize`
       (maintaining aspect ratio)
     - Returns data URL or `ImageBitmap`
   - Memoises results by `file.name + file.size + file.lastModified` key in a
     `Map` to avoid regenerating on re-render
2. `workers/thumbnail.worker.js`:
   - Receives `{file, maxSize}` via `postMessage`, returns canvas data URL
   - `PhotoGrid.js` uses a worker pool (max 2 workers) for concurrent
     thumbnail generation
3. `PhotoGrid.js` lazy loading:
   - `IntersectionObserver` on each `.photo-tile` placeholder
   - Tile enters viewport → worker generates thumbnail → tile updated
   - Tiles outside viewport stay as shimmer until scrolled to
4. Main page performance:
   - `AlbumGrid.js` renders album cards without photo thumbnails on initial
     load (card shows title + date only); thumbnail strip loaded lazily
   - Albums list query uses a single SQL statement (no N+1 queries)
5. **Performance baseline** (captured at Phase 1 scaffold, measured here):
   - Script: `tests/perf/main-page.spec.js` — load 200 seeded albums, measure
     `DOMContentLoaded` + last LCP entry via Playwright Performance API
   - Script: `tests/perf/album-detail.spec.js` — open album with 250 photos,
     measure time-to-first-tile + time-to-all-tiles-visible
6. Write **unit tests**:
   - `thumbnail.test.js`: thumbnail does not exceed `maxSize` on either
     dimension; aspect ratio preserved within 1 px tolerance
7. If baseline is exceeded by >10%, apply mitigation from Performance section
   (virtual scrolling via manual DOM management, not a library)

**Exit condition**: Performance budgets met on baseline measurement; lazy
loading confirmed via Playwright (off-screen tiles are shimmers; on-screen
tiles show thumbnails).

---

### Phase 7 — Polish, Accessibility, and Testing Sign-off

**Goal**: All constitution gates satisfied; no high-severity defects.

**Tasks**:
1. Accessibility audit:
   - `accessibility.spec.js`: `@axe-core/playwright` scan on main page and
     album detail (zero critical / serious violations)
   - Manual screen-reader pass (NVDA + Chrome on Windows): album creation,
     album open, drag-handle discovery, keyboard reorder
2. UX review:
   - Verify terminology consistency (`terminology.md` checklist)
   - Confirm all state surfaces (success/loading/empty/error) render correctly
3. Code quality final pass:
   - `npm run lint` → 0 errors
   - `npm run format:check` → 0 diffs
   - `npm run build` → 0 warnings
   - Remove any dead code or `console.log` statements
4. Test coverage summary: all `tests/` pass; no skipped tests without
   documented reason
5. PR description includes:
   - Evidence of performance measurements (screenshots or CI artifact)
   - Link to accessibility audit results
   - Confirmation of manual reorder test (drag + keyboard)
   - Any approved exceptions recorded in Complexity Tracking

**Exit condition**: PR passes all automated checks; accessibility audit clean;
manual validation completed; no unresolved high-severity defects.

---

## Data Model

*(Full DDL in `contracts/db-schema.sql`; entity narrative in `data-model.md`)*

### `albums`
| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `title` | TEXT | NOT NULL |
| `album_date` | TEXT | NOT NULL (ISO 8601: YYYY-MM-DD) |
| `display_order` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TEXT | NOT NULL DEFAULT (datetime('now')) |
| `updated_at` | TEXT | NOT NULL DEFAULT (datetime('now')) |

### `photos`
| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `album_id` | INTEGER | NOT NULL, FOREIGN KEY → albums(id) ON DELETE CASCADE |
| `file_name` | TEXT | NOT NULL |
| `display_order` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TEXT | NOT NULL DEFAULT (datetime('now')) |

**Design notes**:
- No `parent_album_id` or nesting column exists anywhere in the schema —
  flat structure is enforced at the data-model level (FR-003)
- `album_date` is TEXT (ISO 8601) to keep sql.js date handling simple and
  sortable lexicographically
- `display_order` on `albums` is the sole ordering mechanism; it is an integer
  that is reassigned contiguously on every reorder (`0, 1, 2, …`)
- Photo binary data is never stored; `file_name` is a human-readable label only

---

## Required npm Packages

| Package | Role | Strictly Necessary? |
|---|---|---|
| `vite` | Build + dev server | ✅ Yes |
| `sql.js` | SQLite WASM in-browser | ✅ Yes |
| `vitest` | Unit + integration tests | ✅ Yes |
| `@playwright/test` | E2E + accessibility tests | ✅ Yes |
| `eslint` | Linting | ✅ Yes (quality gate) |
| `prettier` | Formatting | ✅ Yes (quality gate) |
| `eslint-plugin-vitest` | Vitest-specific lint rules | ✅ Yes (minor) |
| `@axe-core/playwright` | Automated accessibility audit | ✅ Yes (UX-005) |

**Explicitly excluded**:
- React / Vue / Svelte — no framework needed
- SortableJS / interact.js — native HTML5 DnD API is sufficient
- Bootstrap / Tailwind — plain CSS with custom properties
- IndexedDB wrapper libraries — sql.js covers the persistence need

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| 200 album cards DOM render | Single SQL query; group by date in JS; avoid N+1 photo queries on load |
| 250 photo thumbnails in album | `IntersectionObserver` lazy load; Web Worker thumbnail generation |
| Thumbnail re-generation on re-render | Memoisation by `file.name + file.size + file.lastModified` |
| OPFS write latency on reorder | Write is async, UI update is synchronous → perceived immediacy ≤1 s |
| Large image decode blocking main thread | `createImageBitmap()` is async; worker handles canvas draw |
| Virtual scroll (contingency) | If 200-album render exceeds 2 s budget, implement a simple manual virtual list (render only ±20 cards around viewport) without a library |

---

## Testing Approach

Aligned with **Constitution Principle II — Tests Define Done**:

```
tests/
├── unit/            Vitest — isolated pure functions and DAO methods
│                    (in-memory sql.js, no browser APIs)
├── integration/     Vitest (jsdom) — multi-step flows crossing module
│                    boundaries (create → persist → query cycle)
└── e2e/             Playwright — real browser, real user interactions
    └── perf/        Playwright — Performance API timing measurements
```

**TDD gate**: every test file is committed with at least one failing test before
the implementation that satisfies it is merged.

**Regression coverage required by spec** (QT-003):
1. Invalid nesting: attempting to set a `parent_album_id` on any album must
   throw (schema-level) — unit test
2. Saved order survives reload: reorder → reload → `listAlbums()` order
   matches — integration test

**Manual validation required** (QT-004):
- Drag-and-drop visual feedback (insertion line, opacity)
- Keyboard reorder end-to-end
- Visual clarity of photo tiles at 150 px, 250 px, and 400 px viewport widths

---

## Complexity Tracking

> No constitutional violations identified. This section is intentionally empty.
