import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { createReport, searchReports, listMyReports, deleteReport, purgeOrphans, countOrphans } from '../controllers/reports.controller.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();

// Multer storage (store files in ../../uploads)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, base + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB/ไฟล์
  fileFilter: (_req, file, cb) => {
    if ((file.mimetype || '').startsWith('image/')) return cb(null, true);
    return cb(new Error('เฉพาะไฟล์รูปภาพเท่านั้น'));
  }
});

// ทั้งสาม endpoint ต้อง login ตาม flow ของ frontend ตอนนี้
router.get('/search', requireAuth, searchReports);
router.post('/', requireAuth, upload.array('photos', 3), createReport);
router.get('/mine', requireAuth, listMyReports);
router.delete('/:id', requireAuth, deleteReport);
// admin utilities
router.get('/_orphans/count', requireAuth, countOrphans);
router.delete('/_orphans/purge', requireAuth, purgeOrphans);

export default router;
