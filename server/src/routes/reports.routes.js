import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  createReport,
  searchReports,
  listMyReports,
  deleteReport,
  purgeOrphans,
  countOrphans,
  listAllReports,
  approveReport,
  rejectReport,
  resetReport,
  getReportById,
} from '../controllers/reports.controller.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { createReportSchema, searchReportsSchema } from '../validators/reports.schema.js';
import multer from 'multer';
import path from 'path';
import { ensureAtLeastOnePhoto } from '../middlewares/ensurePhotos.js';
import { ensureUploadsDir } from '../utils/uploads.js';
import { reportSubmissionLimiter, reportSearchLimiter } from '../middlewares/rateLimit.js';

const router = Router();

// Multer storage (store files in ../../uploads)
const uploadsDir = ensureUploadsDir();
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
router.get('/search', requireAuth, reportSearchLimiter, validateQuery(searchReportsSchema), searchReports);
router.post('/', requireAuth, reportSubmissionLimiter, upload.array('photos', 3), ensureAtLeastOnePhoto, validate(createReportSchema), createReport);
router.get('/mine', requireAuth, listMyReports);
// admin utilities (specific routes before dynamic :id)
router.get('/_orphans/count', requireAuth, requireRole('admin'), countOrphans);
router.delete('/_orphans/purge', requireAuth, requireRole('admin'), purgeOrphans);
router.get('/admin/all', requireAuth, requireRole('admin'), listAllReports);
router.patch('/:id/approve', requireAuth, requireRole('admin'), approveReport);
router.patch('/:id/reject', requireAuth, requireRole('admin'), rejectReport);
router.patch('/:id/pending', requireAuth, requireRole('admin'), resetReport);
router.get('/:id', requireAuth, getReportById);
router.delete('/:id', requireAuth, deleteReport);

export default router;
