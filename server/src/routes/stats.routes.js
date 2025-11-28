import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import { statsLimiter } from '../middlewares/rateLimit.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { getSearchStats, recordSearchStats } from '../controllers/stats.controller.js';
import { searchStatsSchema } from '../validators/stats.schema.js';

const router = Router();

router.get('/search', optionalAuth, statsLimiter, validateQuery(searchStatsSchema), getSearchStats);
router.post('/search', optionalAuth, statsLimiter, validate(searchStatsSchema), recordSearchStats);

export default router;
