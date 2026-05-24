import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../helpers/db.js';
import { createAlbum, listAlbums, updateAlbumOrder } from '../../src/js/db/albums.js';

describe('album reorder (integration)', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('reorders three albums in a transaction', () => {
    const a = createAlbum(db, { title: 'A', albumDate: '2024-01-01' });
    const b = createAlbum(db, { title: 'B', albumDate: '2024-01-01' });
    const c = createAlbum(db, { title: 'C', albumDate: '2024-01-01' });

    // Move C to front
    updateAlbumOrder(db, [c, a, b]);

    const albums = listAlbums(db);
    expect(albums[0].id).toBe(c);
    expect(albums[1].id).toBe(a);
    expect(albums[2].id).toBe(b);

    // Verify display_orders are 0, 1, 2
    expect(albums[0].display_order).toBe(0);
    expect(albums[1].display_order).toBe(1);
    expect(albums[2].display_order).toBe(2);
  });

  it('preserves album data after reorder', () => {
    const id1 = createAlbum(db, { title: 'Holiday', albumDate: '2024-12-25' });
    const id2 = createAlbum(db, { title: 'Birthday', albumDate: '2024-07-04' });

    updateAlbumOrder(db, [id2, id1]);

    const albums = listAlbums(db);
    expect(albums[0].title).toBe('Birthday');
    expect(albums[0].album_date).toBe('2024-07-04');
    expect(albums[1].title).toBe('Holiday');
  });

  it('is a no-op for empty id list', () => {
    createAlbum(db, { title: 'Unchanged', albumDate: '2024-01-01' });
    // Should not throw
    expect(() => updateAlbumOrder(db, [])).not.toThrow();
    expect(listAlbums(db)).toHaveLength(1);
  });
});
