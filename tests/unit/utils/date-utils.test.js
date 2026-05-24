import { describe, it, expect } from 'vitest';
import { formatAlbumDate, getGroupKey, groupAlbumsByDate } from '../../../src/js/utils/date-utils.js';

describe('formatAlbumDate', () => {
  it('formats an ISO date to long locale string', () => {
    // Should produce e.g. "July 14, 2024" regardless of runner TZ
    const result = formatAlbumDate('2024-07-14');
    expect(result).toMatch(/July/);
    expect(result).toMatch(/14/);
    expect(result).toMatch(/2024/);
  });

  it('handles year-boundary correctly (no timezone shift)', () => {
    const result = formatAlbumDate('2024-01-01');
    expect(result).toMatch(/January/);
    expect(result).toMatch(/2024/);
  });
});

describe('getGroupKey', () => {
  it('returns the ISO date string unchanged', () => {
    expect(getGroupKey('2024-07-14')).toBe('2024-07-14');
  });
});

describe('groupAlbumsByDate', () => {
  it('groups albums by album_date and sorts keys lexicographically', () => {
    const albums = [
      { id: 1, title: 'C', album_date: '2024-03-01', display_order: 2 },
      { id: 2, title: 'A', album_date: '2024-01-01', display_order: 0 },
      { id: 3, title: 'B', album_date: '2024-01-01', display_order: 1 },
    ];
    const groups = groupAlbumsByDate(albums);
    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe('2024-01-01');
    expect(groups[0].albums).toHaveLength(2);
    expect(groups[1].key).toBe('2024-03-01');
  });

  it('returns empty array for empty input', () => {
    expect(groupAlbumsByDate([])).toHaveLength(0);
  });
});
