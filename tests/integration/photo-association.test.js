import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../helpers/db.js';
import { createAlbum, deleteAlbum } from '../../src/js/db/albums.js';
import { addPhoto, listPhotos, removePhoto } from '../../src/js/db/photos.js';

describe('photo association (integration)', () => {
  let db;
  let albumId;

  beforeEach(async () => {
    db = await createTestDb();
    albumId = createAlbum(db, { title: 'Gallery', albumDate: '2024-06-01' });
  });

  it('adds multiple photos and retrieves them in order', () => {
    addPhoto(db, { albumId, fileName: 'c.jpg', displayOrder: 2 });
    addPhoto(db, { albumId, fileName: 'a.jpg', displayOrder: 0 });
    addPhoto(db, { albumId, fileName: 'b.jpg', displayOrder: 1 });

    const photos = listPhotos(db, albumId);
    expect(photos.map((p) => p.file_name)).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  it('photos are scoped to their album — other album gets empty list', () => {
    const other = createAlbum(db, { title: 'Other', albumDate: '2024-07-01' });
    addPhoto(db, { albumId, fileName: 'mine.jpg', displayOrder: 0 });
    expect(listPhotos(db, other)).toHaveLength(0);
  });

  it('removes a single photo without affecting others', () => {
    const id1 = addPhoto(db, { albumId, fileName: 'keep.jpg', displayOrder: 0 });
    const id2 = addPhoto(db, { albumId, fileName: 'remove.jpg', displayOrder: 1 });
    removePhoto(db, id2);
    const photos = listPhotos(db, albumId);
    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe(id1);
  });

  // FR-010 — cascade on album delete
  it('photos are cascade-deleted when album is deleted', () => {
    addPhoto(db, { albumId, fileName: 'gone.jpg', displayOrder: 0 });
    deleteAlbum(db, albumId);
    expect(listPhotos(db, albumId)).toHaveLength(0);
  });
});
