import { Router } from 'express';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';
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
  getReportStats,
  listRecentPublic,
  listPublicReports,
  getFraudCategories,
} from '../controllers/reports.controller.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { createReportSchema, searchReportsSchema } from '../validators/reports.schema.js';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { ensureAtLeastOnePhoto } from '../middlewares/ensurePhotos.js';
import { ensureUploadsDir } from '../utils/uploads.js';
import { reportSubmissionLimiter, reportSearchLimiter } from '../middlewares/rateLimit.js';

const router = Router();

// Security: Allowed file types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Multer storage with secure filename generation
const uploadsDir = ensureUploadsDir();
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    // Validate extension first
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('ไม่อนุญาตนามสกุลไฟล์นี้'));
    }
    // Generate secure random filename to prevent path traversal
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB per file
    files: 3, // max 3 files
  },
  fileFilter: (_req, file, cb) => {
    const mimetype = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    
    // Check both mimetype AND extension for better security
    if (ALLOWED_MIMETYPES.includes(mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }
    
    return cb(new Error('เฉพาะไฟล์รูปภาพเท่านั้น (JPEG, PNG, WebP, GIF)'));
  }
});

// Public summary (no auth) — counts only
router.get('/stats/summary', getReportStats);
router.get('/public/recent', listRecentPublic);
router.get('/public/all', listPublicReports);
router.get('/stats/fraud', getFraudCategories);

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
router.get('/:id', optionalAuth, getReportById);
router.delete('/:id', requireAuth, deleteReport);

export default router;
