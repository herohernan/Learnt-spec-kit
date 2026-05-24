import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../helpers/db.js';
import { createAlbum, listAlbums, getAlbum } from '../../src/js/db/albums.js';
import { addPhoto, listPhotos } from '../../src/js/db/photos.js';

describe('album creation (integration)', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('creates album and verifies all fields round-trip correctly', () => {
    const id = createAlbum(db, { title: 'Summer 2024', albumDate: '2024-07-20' });
    const album = getAlbum(db, id);

    expect(album).not.toBeNull();
    expect(album?.title).toBe('Summer 2024');
    expect(album?.album_date).toBe('2024-07-20');
    expect(typeof album?.display_order).toBe('number');
    expect(album?.created_at).toBeTruthy();
    expect(album?.updated_at).toBeTruthy();
  });

  it('creates album with initial photos and associates them', () => {
    const albumId = createAlbum(db, { title: 'Beach', albumDate: '2024-08-01' });
    addPhoto(db, { albumId, fileName: 'sun.jpg', displayOrder: 0 });
    addPhoto(db, { albumId, fileName: 'sea.jpg', displayOrder: 1 });

    const photos = listPhotos(db, albumId);
    expect(photos).toHaveLength(2);
    expect(photos.map((p) => p.file_name)).toEqual(['sun.jpg', 'sea.jpg']);
  });

  it('assigns incrementing display_orders to new albums', () => {
    const id1 = createAlbum(db, { title: 'First', albumDate: '2024-01-01' });
    const id2 = createAlbum(db, { title: 'Second', albumDate: '2024-01-01' });
    const id3 = createAlbum(db, { title: 'Third', albumDate: '2024-01-01' });

    const albums = listAlbums(db);
    const orders = albums.map((a) => a.display_order);
    // display_orders should be strictly increasing
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    }
    // All three should be present
    const ids = albums.map((a) => a.id);
    expect(ids).toContain(id1);
    expect(ids).toContain(id2);
    expect(ids).toContain(id3);
  });
});
