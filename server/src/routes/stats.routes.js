import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { getSearchStats, recordSearchStats } from '../controllers/stats.controller.js';

const router = Router();

router.get('/search', requireAuth, getSearchStats);
router.post('/search', requireAuth, recordSearchStats);

export default router;
