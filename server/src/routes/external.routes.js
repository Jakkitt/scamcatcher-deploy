import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { getExternalChecks } from '../controllers/external.controller.js';

const router = Router();

router.get('/checks', requireAuth, getExternalChecks);

export default router;
