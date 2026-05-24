# Terminology Reference

**Feature**: `001-organize-photo-albums`
**Date**: 2026-05-24

This file is the single source of truth for copy used across the main page,
album detail page, forms, error messages, and empty states. All UI strings
MUST use these exact terms (UX-001).

---

## Canonical Terms

| Concept | Canonical Term | Do NOT use |
|---|---|---|
| A photo collection | **album** | gallery, folder, set, group, container |
| The date assigned to an album | **album date** | photo date, event date, taken date |
| The main page order of albums | **album order** | sort order, position, rank |
| Moving an album to a new slot | **reorder** | move into, nest, place inside, stack |
| A visual preview of one photo | **photo tile** | thumbnail card, image card, preview card |
| Opening an album | **open album** | enter album, view album, go into |
| A collection of albums on the same date | **date group** | date bucket, date cluster, date folder |

---

## UI Strings

### Main Page

| State | String |
|---|---|
| Page heading | `Your Albums` |
| Empty state heading | `No albums yet` |
| Empty state body | `Create your first dated album to start organising your photos.` |
| Create button | `New Album` |
| Loading state | `Loading albums…` |
| Error state | `Could not load albums. Please try again.` |
| Reorder success (screen reader) | `Album moved to position {n}.` |
| Cancelled drag (screen reader) | `Reorder cancelled.` |

### Album Form (Create / Edit)

| Field | Label | Placeholder / Hint |
|---|---|---|
| Title | `Album title` | `e.g. Summer 2024` |
| Date | `Album date` | *(date picker, no placeholder needed)* |
| Photos | `Photos` | `No photos selected` |
| Submit | `Save Album` | — |
| Cancel | `Cancel` | — |
| Validation — no title | `Album title is required.` | — |
| Validation — no date | `Album date is required.` | — |

### Album Detail Page

| State | String |
|---|---|
| Loading | `Loading photos…` |
| Empty state heading | `No photos yet` |
| Empty state body | `Add photos to this album to see them here.` |
| Add photos button | `Add Photos` |
| Error — photo unavailable | `Photo unavailable` |
| Error — album not found | `Album not found. It may have been deleted.` |

### Drag-and-Drop

| Element | ARIA label |
|---|---|
| Drag handle | `Drag to reorder` |
| Move up button | `Move album up` |
| Move down button | `Move album down` |
| Drop zone (insertion line) | *(no label — visual only; screen reader uses move buttons)* |
