import { describe, it, expect } from 'vitest';
import { reorderArray } from '../../../src/js/components/DragDrop.js';

describe('reorderArray', () => {
  it('moves an item from higher index to lower index', () => {
    const result = reorderArray([1, 2, 3, 4], 3, 1);
    expect(result).toEqual([1, 4, 2, 3]);
  });

  it('moves an item from lower index to higher index', () => {
    const result = reorderArray([1, 2, 3, 4], 0, 3);
    expect(result).toEqual([2, 3, 4, 1]);
  });

  it('returns same order when source equals target', () => {
    const original = [1, 2, 3];
    const result = reorderArray(original, 1, 1);
    expect(result).toEqual([1, 2, 3]);
  });

  it('does not mutate the original array', () => {
    const original = [10, 20, 30];
    reorderArray(original, 0, 2);
    expect(original).toEqual([10, 20, 30]);
  });

  it('works for a two-element swap', () => {
    expect(reorderArray([5, 9], 0, 1)).toEqual([9, 5]);
    expect(reorderArray([5, 9], 1, 0)).toEqual([9, 5]);
  });
});
