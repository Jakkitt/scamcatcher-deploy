import { Router } from 'express';
import { register, login, changePassword, me, updateProfile } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', requireAuth, changePassword);
router.get('/me', requireAuth, me);
router.patch('/profile', requireAuth, updateProfile);

export default router;
