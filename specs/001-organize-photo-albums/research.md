# Research: Date-Grouped Photo Albums

**Phase**: 0 — Outline & Research
**Feature**: `001-organize-photo-albums`
**Date**: 2026-05-24

---

## 1. Local SQLite in the Browser

**Decision**: Use **sql.js** (SQLite compiled to WASM) with **Origin Private
File System (OPFS)** for persistence.

**Rationale**:
- sql.js gives a real SQLite engine in the browser — full SQL, transactions,
  foreign keys, and `PRAGMA user_version` for schema migrations.
- OPFS (`navigator.storage.getDirectory()`) provides a private, sandboxed file
  system with synchronous WASM-friendly access, available in all modern
  browsers in a secure context.
- The sql.js `initSqlJs` function accepts a `locateFile` option to point at
  the WASM binary placed in Vite's `public/` directory, avoiding complex
  bundler configuration.
- Persistence pattern: load `.db` from OPFS on startup → operate in memory →
  serialise back to OPFS on each write (albums are small; full serialisation
  is acceptably fast for ≤200 albums).

**Alternatives considered**:

| Alternative | Why rejected |
|---|---|
| IndexedDB (raw) | Good API for key-value but no relational queries, no SQL, ordering logic must be hand-rolled |
| Dexie.js | Reasonable IndexedDB wrapper, but adds a dependency and still lacks SQL |
| Origin Private File System + SQLite WASM (official SQLite OPFS build) | Correct long-term choice but the official WASM build requires a dedicated synchronous Worker and more configuration; sql.js is simpler and meets the scale requirement |
| localStorage | 5 MB limit; binary serialisation fragile; not suitable for structured relational data |

**Browser support notes**:
- OPFS: Chrome 102+, Firefox 111+, Safari 15.2+ (all in secure context)
- Fallback: if `navigator.storage.getDirectory()` is unavailable, serialise db
  to a base64 string in `localStorage`. Warn the user that persistence is
  limited to 5 MB.

---

## 2. Local Photo Access (No Upload)

**Decision**: Use the **File System Access API** (`showOpenFilePicker`) as the
primary mechanism; fall back to `<input type="file" multiple accept="image/*">`.

**Rationale**:
- Neither approach sends photo data to a server — binary data is read into a
  `File` object in memory for the current session only.
- File System Access API allows re-opening the same file handle across
  sessions (persistent handles stored in IndexedDB), but for v1 the simpler
  approach is sufficient: users pick photos each session.
- `<input type="file">` is universally supported and is a reliable fallback.

**Alternatives considered**:

| Alternative | Why rejected |
|---|---|
| Drag files onto the page | Useful UX enhancement but not the primary picker; can be added later |
| Persistent FileSystemFileHandle (re-open across sessions) | Requires additional permissions prompt on each reload; deferred to v2 |
| Upload to a local server | Violates the constraint "images are never uploaded to a server" |

---

## 3. Thumbnail Generation

**Decision**: Use **`createImageBitmap(file)`** + **off-screen `<canvas>`**,
offloaded to a **Web Worker** for the thumbnail generation path.

**Rationale**:
- `createImageBitmap` decodes the image asynchronously and off-thread in
  supporting browsers (Chrome, Firefox), avoiding main-thread jank.
- Canvas draw + `toDataURL('image/jpeg', 0.75)` produces a compact JPEG
  thumbnail without any external image-processing library.
- A small worker pool (2 workers) handles concurrent thumbnail requests for
  a 250-photo album without blocking the UI.
- Results are memoised by `{name, size, lastModified}` so navigating back to
  an album does not re-generate thumbnails.

**Alternatives considered**:

| Alternative | Why rejected |
|---|---|
| `<img src="blob:...">` direct | Full-size image decode, no size control, memory-heavy for 250 photos |
| Sharp / jimp | Node.js libraries; cannot run in browser |
| CSS `object-fit` on full-size images | Decodes full image, causes main-thread jank at scale |

---

## 4. Drag-and-Drop Reorder

**Decision**: Use the **native HTML5 Drag and Drop API** (`dragstart`,
`dragover`, `drop`, `dragend` events).

**Rationale**:
- No additional library needed; the API is universally supported.
- Event delegation on the album list container keeps the implementation simple.
- Drop targets render an **insertion line** (not an overlap highlight)
  ensuring the "reorder only, no nesting" constraint is visually unambiguous
  (FR-006, UX-004).

**Alternatives considered**:

| Alternative | Why rejected |
|---|---|
| SortableJS | Adds ~50 kB; the user constraint is to minimise libraries; native API is sufficient |
| interact.js | Same concern as SortableJS |
| Pointer Events API (manual) | More code, less browser support for accessibility than native DnD |

**Keyboard reorder**:
- "Move up" / "Move down" icon buttons on each album card call the same
  `updateAlbumOrder()` function used by drag-and-drop.
- Satisfies FR-008 and UX-005 without a separate reorder mechanism.

---

## 5. Build Tooling

**Decision**: **Vite 5.x** with multi-page input, no plugins beyond the Vite
built-ins.

**Rationale**:
- Vite's built-in Rollup bundler handles multi-page apps via
  `build.rollupOptions.input` with zero extra configuration.
- sql.js WASM binary placed in `public/` is served as a static asset by Vite
  without any copy plugin.
- Vite's dev server supports custom response headers (needed for
  `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` required
  for `SharedArrayBuffer` / OPFS).
- Workers declared with `new Worker(new URL('./workers/thumbnail.worker.js',
  import.meta.url))` are automatically bundled by Vite.

**Vite plugins required**: **none** (no framework, no extra transforms).

---

## 6. Testing Stack

**Decision**: **Vitest** (unit + integration) + **Playwright** (E2E + a11y).

**Rationale**:
- Vitest is Vite-native; it reuses the same `vite.config.js` transform
  pipeline, meaning ES module imports and Vite aliases work in tests without
  extra setup.
- Vitest's jsdom environment is sufficient for DOM-level integration tests
  without a real browser.
- Playwright is the best tool for real drag-and-drop, real File picker
  interactions (via file chooser interception), and performance timing via the
  `Performance` Web API.
- `@axe-core/playwright` integrates accessibility scanning directly into E2E
  runs.

**Alternatives considered**:

| Alternative | Why rejected |
|---|---|
| Jest | Extra Babel/transform config to handle Vite ES modules; Vitest is strictly simpler |
| Cypress | Heavier install; Playwright has better file chooser support |
| Manual accessibility only | Insufficient for QT-002 automated coverage requirement |

---

## 7. CSS Architecture

**Decision**: Plain CSS with **CSS custom properties** (design tokens) and
**BEM-adjacent naming** for components. No CSS framework or preprocessor.

**Rationale**:
- The spec requires minimal third-party libraries; a CSS framework is not
  necessary for a single-feature app.
- CSS custom properties provide theming capability without a build step.
- BEM naming (`.album-card__title`, `.photo-tile--loading`) is readable and
  avoids class collisions without a scoping tool.

---

## Summary of Key Decisions

| Area | Choice | Rationale |
|---|---|---|
| Local SQLite | sql.js + OPFS | Full SQL, no server, simple setup |
| Photo access | File System Access API + input fallback | No upload, browser-native |
| Thumbnails | Canvas + Web Worker + memoisation | Performance, no library |
| Drag-and-drop | Native HTML5 DnD API | No library needed, insertion-line drop target |
| Keyboard reorder | Move-up/move-down buttons | Same DB path as DnD, accessible |
| Build tool | Vite 5.x (no extra plugins) | Multi-page, WASM headers, worker bundling |
| Testing | Vitest + Playwright + axe-core | Vite-native, real-browser DnD, a11y |
| CSS | Plain CSS + custom properties | No framework needed |
