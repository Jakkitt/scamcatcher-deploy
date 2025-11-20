import { Router } from 'express';
import {
  register,
  login,
  changePassword,
  me,
  updateProfile,
  deleteAccount,
  logout,
  refreshSession,
  forgotPassword,
  resetPassword,
  sendChangePasswordPin,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, changePasswordSchema, profileSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.schema.js';
import { authRateLimiter, sessionRefreshLimiter } from '../middlewares/rateLimit.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/change-password/pin', requireAuth, sendChangePasswordPin);
router.post('/logout', logout);
router.post('/refresh', sessionRefreshLimiter, refreshSession);
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);
router.get('/me', requireAuth, me);
router.patch('/profile', requireAuth, validate(profileSchema), updateProfile);
router.delete('/account', requireAuth, deleteAccount);

export default router;
