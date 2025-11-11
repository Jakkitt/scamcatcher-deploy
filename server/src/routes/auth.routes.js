import { Router } from 'express';
import { register, login, changePassword, me, updateProfile, deleteAccount } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, changePasswordSchema, profileSchema } from '../validators/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);
router.get('/me', requireAuth, me);
router.patch('/profile', requireAuth, validate(profileSchema), updateProfile);
router.delete('/account', requireAuth, deleteAccount);

export default router;
