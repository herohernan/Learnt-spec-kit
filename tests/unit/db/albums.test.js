import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../../helpers/db.js';
import { createAlbum, listAlbums, getAlbum, updateAlbumOrder, deleteAlbum } from '../../../src/js/db/albums.js';

describe('albums DAO', () => {
  let db;
  beforeEach(async () => {
    db = await createTestDb();
  });

  // FR-001 / FR-002 — create and retrieve
  it('creates an album and returns its id', () => {
    const id = createAlbum(db, { title: 'My Trip', albumDate: '2024-07-14' });
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  it('lists albums ordered by display_order', () => {
    createAlbum(db, { title: 'First', albumDate: '2024-01-01' });
    createAlbum(db, { title: 'Second', albumDate: '2024-02-01' });
    const albums = listAlbums(db);
    expect(albums).toHaveLength(2);
    expect(albums[0].display_order).toBeLessThanOrEqual(albums[1].display_order);
  });

  it('gets a single album by id', () => {
    const id = createAlbum(db, { title: 'Paris', albumDate: '2023-06-15' });
    const album = getAlbum(db, id);
    expect(album).not.toBeNull();
    expect(album?.title).toBe('Paris');
    expect(album?.album_date).toBe('2023-06-15');
  });

  it('returns null for missing album', () => {
    expect(getAlbum(db, 9999)).toBeNull();
  });

  // FR-003 — no parent_album_id column
  it('album row has no parent_album_id column', () => {
    const id = createAlbum(db, { title: 'Flat', albumDate: '2024-01-01' });
    const album = getAlbum(db, id);
    expect(album).not.toHaveProperty('parent_album_id');
  });

  // FR-007 — reorder
  it('updates display_order for all albums in a transaction', () => {
    const id1 = createAlbum(db, { title: 'A', albumDate: '2024-01-01' });
    const id2 = createAlbum(db, { title: 'B', albumDate: '2024-01-01' });
    const id3 = createAlbum(db, { title: 'C', albumDate: '2024-01-01' });
    updateAlbumOrder(db, [id3, id1, id2]);
    const albums = listAlbums(db);
    expect(albums[0].id).toBe(id3);
    expect(albums[1].id).toBe(id1);
    expect(albums[2].id).toBe(id2);
  });

  // FR-010 — delete cascades
  it('deletes an album', () => {
    const id = createAlbum(db, { title: 'Gone', albumDate: '2024-01-01' });
    deleteAlbum(db, id);
    expect(getAlbum(db, id)).toBeNull();
    expect(listAlbums(db)).toHaveLength(0);
  });

  it('throws when title is empty', () => {
    expect(() => createAlbum(db, { title: '', albumDate: '2024-01-01' })).toThrow(
      'Album title is required'
    );
  });

  it('throws when albumDate is missing', () => {
    expect(() => createAlbum(db, { title: 'X', albumDate: '' })).toThrow(
      'Album date is required'
    );
  });
});
