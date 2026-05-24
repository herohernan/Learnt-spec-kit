/**
 * DragDrop.js — Native HTML5 drag-and-drop + keyboard reorder controller.
 * Operates on the album list; insertion-line indicator (never overlap)
 * makes album nesting visually impossible (FR-006, UX-004).
 */

/**
 * Reorder an array by moving the item at sourceIndex to targetIndex.
 * Pure function — returns a new array without mutating the original.
 * @template T
 * @param {T[]} items
 * @param {number} sourceIndex
 * @param {number} targetIndex
 * @returns {T[]}
 */
export function reorderArray(items, sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex) return [...items];
  const result = [...items];
  const [moved] = result.splice(sourceIndex, 1);
  result.splice(targetIndex, 0, moved);
  return result;
}

/**
 * Attach drag-and-drop and keyboard reorder behaviour to the album container.
 * @param {HTMLElement} container
 * @param {{
 *   getAlbumIds: () => number[],
 *   onReorder: (newIds: number[]) => Promise<void>
 * }} opts
 */
export function attachDragDrop(container, { getAlbumIds, onReorder }) {
  /** @type {number|null} */
  let dragSourceId = null;

  // ── Drag events ─────────────────────────────────────────────────────────────────
  container.addEventListener('dragstart', (e) => {
    const card = /** @type {HTMLElement} */ (e.target).closest('[data-album-id]');
    if (!card) return;
    dragSourceId = Number(card.getAttribute('data-album-id'));
    card.classList.add('dragging');
    /** @type {DataTransfer} */ (e.dataTransfer).effectAllowed = 'move';
    /** @type {DataTransfer} */ (e.dataTransfer).setData('text/plain', String(dragSourceId));
  });

  container.addEventListener('dragend', (e) => {
    const card = /** @type {HTMLElement} */ (e.target).closest('[data-album-id]');
    if (card) card.classList.remove('dragging');
    clearInsertionLines(container);
    dragSourceId = null;
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    /** @type {DataTransfer} */ (e.dataTransfer).dropEffect = 'move';
    clearInsertionLines(container);
    const target = /** @type {HTMLElement} */ (e.target).closest('[data-album-id]');
    if (!target || Number(target.getAttribute('data-album-id')) === dragSourceId) return;

    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    target.classList.add(e.clientY < midY ? 'drag-over-before' : 'drag-over-after');
  });

  container.addEventListener('dragleave', (e) => {
    const target = /** @type {HTMLElement} */ (e.target).closest('[data-album-id]');
    target?.classList.remove('drag-over-before', 'drag-over-after');
  });

  container.addEventListener('drop', async (e) => {
    e.preventDefault();
    clearInsertionLines(container);
    const dropTarget = /** @type {HTMLElement} */ (e.target).closest('[data-album-id]');
    if (!dropTarget || dragSourceId === null) return;

    const dropId = Number(dropTarget.getAttribute('data-album-id'));
    if (dropId === dragSourceId) return;

    const ids = getAlbumIds();
    const sourceIdx = ids.indexOf(dragSourceId);
    const dropIdx = ids.indexOf(dropId);
    if (sourceIdx === -1 || dropIdx === -1) return;

    const rect = dropTarget.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;
    const rawTarget = insertBefore ? dropIdx : dropIdx + 1;
    const adjustedTarget = rawTarget > sourceIdx ? rawTarget - 1 : rawTarget;
    const newIds = reorderArray(ids, sourceIdx, adjustedTarget);
    await onReorder(newIds);
  });

  // ── Keyboard reorder (FR-008) ──────────────────────────────────────────────
  container.addEventListener('click', async (e) => {
    const btn = /** @type {HTMLElement} */ (e.target).closest(
      '[data-action="move-up"], [data-action="move-down"]'
    );
    if (!btn) return;

    const card = btn.closest('[data-album-id]');
    if (!card) return;

    const albumId = Number(card.getAttribute('data-album-id'));
    const ids = getAlbumIds();
    const idx = ids.indexOf(albumId);
    if (idx === -1) return;

    const action = btn.getAttribute('data-action');
    if (action === 'move-up' && idx > 0) {
      await onReorder(reorderArray(ids, idx, idx - 1));
    } else if (action === 'move-down' && idx < ids.length - 1) {
      await onReorder(reorderArray(ids, idx, idx + 1));
    }
  });
}

/**
 * Remove all insertion-line CSS classes from cards in the container.
 * @param {HTMLElement} container
 */
function clearInsertionLines(container) {
  container.querySelectorAll('.drag-over-before, .drag-over-after').forEach((el) => {
    el.classList.remove('drag-over-before', 'drag-over-after');
  });
}
