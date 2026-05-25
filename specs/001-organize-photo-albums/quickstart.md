# Quickstart: Date-Grouped Photo Albums

**Feature**: `001-organize-photo-albums`
**Date**: 2026-05-24

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 20 LTS | Required for Vite and test runners |
| npm | 10 | Ships with Node 20 |
| Chrome / Edge | Latest | OPFS requires a secure context |

---

## Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/herohernan/Learnt-spec-kit.git
cd Learnt-spec-kit

# 2. Check out the feature branch
git checkout 001-organize-photo-albums

# 3. Install dependencies
npm install

# 4. Copy the sql.js WASM binary to the public directory
#    (Vite serves public/ as static assets at /)
cp node_modules/sql.js/dist/sql-wasm.wasm public/sql-wasm.wasm

# 5. Start the development server
npm run dev
```

Open `http://localhost:5173` in Chrome or Edge (required for OPFS support).

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with COOP/COEP headers |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run all Vitest unit + integration tests |
| `npm run test:e2e` | Run Playwright E2E tests (requires `npm run build` first) |
| `npm run lint` | Run ESLint across all source files |
| `npm run format:check` | Verify Prettier formatting |
| `npm run format` | Auto-fix formatting |

---

## Project Layout

```
src/
├── index.html          Main page (date-grouped album list)
├── album.html          Album detail page (photo tile grid)
├── css/                All stylesheets
├── js/
│   ├── db/             SQLite DAO layer (sql.js)
│   ├── components/     UI components (vanilla JS)
│   └── utils/          File access, thumbnails, date helpers
└── workers/            Web Worker for off-thread thumbnail generation

specs/001-organize-photo-albums/
├── spec.md             Feature requirements
├── plan.md             This implementation plan
├── research.md         Technology decisions and rationale
├── data-model.md       SQLite schema and entity relationships
├── quickstart.md       This file
└── contracts/
    ├── db-schema.sql   Normative SQLite DDL
    └── terminology.md  Canonical copy reference

tests/
├── unit/               Vitest — isolated logic
├── integration/        Vitest (jsdom) — multi-module flows
└── e2e/                Playwright — real browser tests
```

---

## Database

The app creates a local SQLite database using sql.js on first run. The
database is persisted to the **Origin Private File System** (OPFS), which is
private to the app's origin and never visible to the user via the file system.

- In **Chrome/Edge**: OPFS is used automatically.
- In **Firefox 111+**: OPFS is supported; same behaviour.
- In **Safari 15.2+**: OPFS is supported in secure contexts.
- **Fallback** (no OPFS): the database is serialised to `localStorage` (5 MB
  limit; a warning banner is shown to the user).

To reset the database during development:
1. Open DevTools → Application → Storage → Origin Private File System
2. Delete the `photo-albums.db` file.
3. Reload the page.

---

## Photo Access

Photos are **never uploaded**. When a user clicks "Add photos", the app uses
the **File System Access API** (`showOpenFilePicker`) if available, or falls
back to a hidden `<input type="file">` element. The selected `File` objects
are held in memory for the current session only.

Thumbnails are generated on-the-fly using an off-screen Canvas in a Web
Worker. A thumbnail preview is persisted with the photo metadata so albums can
still render tiles after navigation or reload, even though the original file
handle is not retained.

---

## Running Tests

### Unit and Integration Tests (Vitest)

```bash
npm test
# or in watch mode:
npm run test:watch
```

Tests use an in-memory sql.js instance — no OPFS, no real browser required.

### E2E Tests (Playwright)

```bash
# Install browser binaries (once)
npx playwright install

# Build the app first
npm run build

# Run E2E tests
npm run test:e2e

# Run with UI for debugging
npx playwright test --ui
```

### Performance Tests

```bash
npm run test:perf
# Playwright scripts in tests/e2e/perf/ measure against defined budgets
```

---

## Key Configuration Files

### `vite.config.js`

```js
// Multi-page setup + COOP/COEP headers for OPFS
export default {
  build: {
    rollupOptions: {
      input: {
        main: 'src/index.html',
        album: 'src/album.html',
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
};
```

### `vitest.config.js`

```js
// jsdom for DOM tests; exclude e2e/ from Vitest run
export default {
  test: {
    environment: 'jsdom',
    exclude: ['tests/e2e/**'],
  },
};
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `SharedArrayBuffer is not defined` | Ensure COOP/COEP headers are set (see `vite.config.js`); use HTTPS or localhost only |
| Photos appear broken after reload | Clear old `photo-albums.db` data created before thumbnail persistence was added, then re-add the photos |
| OPFS not available warning | Use Chrome 102+ or Firefox 111+ in a secure context (HTTPS or localhost) |
| sql.js WASM 404 | Confirm `public/sql-wasm.wasm` exists; re-run `cp node_modules/sql.js/dist/sql-wasm.wasm public/` |
