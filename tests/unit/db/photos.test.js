import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../../helpers/db.js';
import { createAlbum } from '../../../src/js/db/albums.js';
import { addPhoto, listPhotos, removePhoto } from '../../../src/js/db/photos.js';

describe('photos DAO', () => {
  let db;
  let albumId;

  beforeEach(async () => {
    db = await createTestDb();
    albumId = createAlbum(db, { title: 'Test album', albumDate: '2024-01-01' });
  });

  it('adds a photo and returns its id', () => {
    const id = addPhoto(db, { albumId, fileName: 'cat.jpg', displayOrder: 0 });
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  it('lists photos in display_order', () => {
    addPhoto(db, { albumId, fileName: 'b.jpg', displayOrder: 1 });
    addPhoto(db, { albumId, fileName: 'a.jpg', displayOrder: 0 });
    const photos = listPhotos(db, albumId);
    expect(photos[0].file_name).toBe('a.jpg');
    expect(photos[1].file_name).toBe('b.jpg');
  });

  it('removes a photo by id', () => {
    const id = addPhoto(db, { albumId, fileName: 'x.jpg', displayOrder: 0 });
    removePhoto(db, id);
    expect(listPhotos(db, albumId)).toHaveLength(0);
  });

  it('throws when file_name is empty', () => {
    expect(() => addPhoto(db, { albumId, fileName: '', displayOrder: 0 })).toThrow(
      'File name is required'
    );
  });

  it('returns empty array for album with no photos', () => {
    expect(listPhotos(db, albumId)).toHaveLength(0);
  });

  // FR-010 — cascade delete
  it('cascades delete when album is removed', async () => {
    const { deleteAlbum } = await import('../../../src/js/db/albums.js');
    addPhoto(db, { albumId, fileName: 'keep.jpg', displayOrder: 0 });
    deleteAlbum(db, albumId);
    expect(listPhotos(db, albumId)).toHaveLength(0);
  });
});
