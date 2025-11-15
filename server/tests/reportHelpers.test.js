import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { __testables } from '../src/controllers/reports.controller.js';
import { resolveUploadPathFromUrl, uploadsDir } from '../src/utils/uploads.js';

const { mapPhotosToPublic, sanitizeDescription } = __testables;

test('mapPhotosToPublic normalizes relative uploads', () => {
  const req = {
    protocol: 'https',
    get: () => 'api.localhost',
  };
  const result = mapPhotosToPublic(req, ['/uploads/proof.jpg', 'https://cdn.test/keep.png']);
  assert.deepEqual(result, ['https://api.localhost/uploads/proof.jpg', 'https://cdn.test/keep.png']);
});

test('sanitizeDescription strips unsupported tags', () => {
  const dirty = '<p>ข้อมูล</p><script>alert(1)</script>';
  const clean = sanitizeDescription(dirty);
  assert.equal(clean, 'ข้อมูล');
});

test('resolveUploadPathFromUrl maps to filesystem path', () => {
  const resolved = resolveUploadPathFromUrl('https://api.localhost/uploads/sample.png');
  assert.equal(resolved, path.join(uploadsDir, 'sample.png'));
  assert.equal(resolveUploadPathFromUrl('https://example.com/not-uploads/file.png'), null);
});
