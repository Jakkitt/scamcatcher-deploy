import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, '../../uploads');

export function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export function resolveUploadPathFromUrl(url) {
  if (!url) return null;
  const relative = String(url).replace(/^https?:\/\/[^/]+/i, '');
  if (!relative.startsWith('/uploads/')) return null;
  const filename = relative.slice('/uploads/'.length);
  if (!filename) return null;
  return path.join(uploadsDir, filename);
}

export async function deleteUploadsByUrls(urls = []) {
  const targets = urls
    .map(resolveUploadPathFromUrl)
    .filter(Boolean);
  await Promise.all(
    targets.map(async (filePath) => {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        if (err?.code !== 'ENOENT') {
          console.warn('[uploads] failed to remove file', filePath, err?.message);
        }
      }
    })
  );
}
