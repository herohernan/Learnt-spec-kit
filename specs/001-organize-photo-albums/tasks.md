# Tasks: Date-Grouped Photo Albums

**Feature**: `001-organize-photo-albums`  
**Branch**: `001-organize-photo-albums`  
**Generated**: 2026-05-24  

---

## Phase 1 — Scaffold

- [X] T01 · `package.json` with all dependencies and postinstall WASM copy
- [X] T02 · `vite.config.js` — multi-page (index + album), COOP/COEP headers, sql.js exclude
- [X] T03 · `vitest.config.js` — jsdom, test glob patterns
- [X] T04 · `playwright.config.js` — Chromium project, preview server
- [X] T05 · `.eslintrc.cjs` and `.prettierrc`
- [X] T06 · `.gitignore`
- [X] T07 · `scripts/copy-wasm.js` — postinstall WASM copy helper
- [X] T08 · `public/.gitkeep` — ensures public/ is tracked before WASM copy
- [X] T09 · `src/index.html` — main page skeleton with semantic landmarks
- [X] T10 · `src/album.html` — album detail skeleton
- [X] T11 · `src/css/reset.css` — minimal CSS reset
- [X] T12 · `src/css/main.css` — design tokens + main page styles
- [X] T13 · `src/css/album.css` — album detail page styles
- [X] T14 · `src/css/components/album-card.css`
- [X] T15 · `src/css/components/drag-drop.css`
- [X] T16 · `src/css/components/photo-tile.css`

## Phase 2 — Data Layer

- [X] T17 · `src/js/db/db.js` — sql.js init, OPFS persistence, migration runner
- [X] T18 · `src/js/db/albums.js` — Album DAO (CRUD + reorder)
- [X] T19 · `src/js/db/photos.js` — Photo DAO (CRUD)
- [X] T20 · `tests/helpers/db.js` — shared in-memory test DB factory
- [X] T21 · `tests/unit/db/albums.test.js`
- [X] T22 · `tests/unit/db/photos.test.js`
- [X] T23 · `tests/integration/album-creation.test.js`
- [X] T24 · `tests/integration/album-reorder.test.js`
- [X] T25 · `tests/integration/photo-association.test.js`

## Phase 3 — Album Management

- [X] T26 · `src/js/utils/date-utils.js` — formatAlbumDate, groupAlbumsByDate
- [X] T27 · `src/js/components/AlbumGrid.js` — success/loading/empty/error states
- [X] T28 · `src/js/components/AlbumCard.js` — card with drag handle + keyboard nav
- [X] T29 · `src/js/components/AlbumForm.js` — create album modal
- [X] T30 · `src/js/components/Toast.js` — toast notification utility
- [X] T31 · `src/js/main.js` — main page bootstrap
- [X] T32 · `tests/unit/utils/date-utils.test.js`

## Phase 4 — Photo Management

- [X] T33 · `src/js/utils/file-access.js` — FSA API + <input> fallback
- [X] T34 · `src/js/components/PhotoTile.js` — tile with shimmer/error states
- [X] T35 · `src/js/components/PhotoGrid.js` — CSS grid + IntersectionObserver
- [X] T36 · `src/js/album-page.js` — album detail bootstrap

## Phase 5 — Drag-and-Drop + Keyboard Reorder

- [X] T37 · `src/js/components/DragDrop.js` — native DnD + keyboard move-up/down
- [X] T38 · `tests/unit/utils/reorder.test.js`

## Phase 6 — Tile Preview & Performance

- [X] T39 · `src/js/utils/thumbnail.js` — memo cache + worker bridge
- [X] T40 · `src/workers/thumbnail.worker.js` — off-thread thumbnail generation
- [X] T41 · `tests/unit/utils/thumbnail.test.js`

## Phase 7 — Polish & E2E Tests

- [X] T42 · `tests/e2e/album-creation.spec.js`
- [X] T43 · `tests/e2e/album-reorder.spec.js`
- [X] T44 · `tests/e2e/album-detail.spec.js`
- [X] T45 · `tests/e2e/accessibility.spec.js`
