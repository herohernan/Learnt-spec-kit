import { describe, it, expect } from 'vitest';
import { fileKey, calcScaledSize } from '../../../src/js/utils/thumbnail.js';

describe('fileKey', () => {
  it('produces a stable key from file-like objects', () => {
    const key = fileKey({ name: 'photo.jpg', size: 1234, lastModified: 9876 });
    expect(key).toBe('photo.jpg:1234:9876');
  });

  it('produces different keys for different sizes', () => {
    const a = fileKey({ name: 'x.jpg', size: 100, lastModified: 0 });
    const b = fileKey({ name: 'x.jpg', size: 200, lastModified: 0 });
    expect(a).not.toBe(b);
  });
});

describe('calcScaledSize', () => {
  it('scales down proportionally when both dims exceed maxSize', () => {
    const { w, h } = calcScaledSize(1000, 500, 300);
    // ratio = 300/1000 = 0.3  →  w=300, h=150
    expect(w).toBe(300);
    expect(h).toBe(150);
  });

  it('scales down when only height exceeds maxSize', () => {
    const { w, h } = calcScaledSize(100, 600, 300);
    // ratio = 300/600 = 0.5  →  w=50, h=300
    expect(w).toBe(50);
    expect(h).toBe(300);
  });

  it('does not upscale (ratio capped at 1)', () => {
    const { w, h } = calcScaledSize(100, 80, 300);
    expect(w).toBe(100);
    expect(h).toBe(80);
  });

  it('returns at least 1x1 for tiny inputs', () => {
    const { w, h } = calcScaledSize(1, 1, 300);
    expect(w).toBeGreaterThanOrEqual(1);
    expect(h).toBeGreaterThanOrEqual(1);
  });
});
