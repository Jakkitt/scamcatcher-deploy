import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { externalChecksLimiter } from '../middlewares/rateLimit.js';
import { validateQuery } from '../middlewares/validate.js';
import { getExternalChecks } from '../controllers/external.controller.js';
import { externalCheckSchema } from '../validators/external.schema.js';

const router = Router();

router.get('/checks', requireAuth, externalChecksLimiter, validateQuery(externalCheckSchema), getExternalChecks);

export default router;
