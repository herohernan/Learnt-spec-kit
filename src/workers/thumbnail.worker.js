/**
 * thumbnail.worker.js — Off-main-thread thumbnail generation.
 *
 * Receives: { file: File, maxSize: number, key: string }
 * Sends:    { key: string, dataUrl: string }
 *         | { key: string, error: string }
 */

self.addEventListener('message', async ({ data }) => {
  const { file, maxSize, key } = data;

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
    const w = Math.max(1, Math.round(bitmap.width * ratio));
    const h = Math.max(1, Math.round(bitmap.height * ratio));

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
    const arrayBuf = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const dataUrl = `data:image/jpeg;base64,${btoa(binary)}`;

    self.postMessage({ key, dataUrl });
  } catch (err) {
    self.postMessage({ key, error: /** @type {Error} */ (err).message ?? String(err) });
  }
});
