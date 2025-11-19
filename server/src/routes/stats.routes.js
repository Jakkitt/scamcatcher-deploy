import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { statsLimiter } from '../middlewares/rateLimit.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { getSearchStats, recordSearchStats } from '../controllers/stats.controller.js';
import { searchStatsSchema } from '../validators/stats.schema.js';

const router = Router();

router.get('/search', requireAuth, statsLimiter, validateQuery(searchStatsSchema), getSearchStats);
router.post('/search', requireAuth, statsLimiter, validate(searchStatsSchema), recordSearchStats);

export default router;
