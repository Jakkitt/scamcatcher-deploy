import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { listUsers, suspendUser, unsuspendUser, deleteUserAdmin } from '../controllers/admin.controller.js';
import { getExternalChecksSetting, updateExternalChecksSetting } from '../controllers/settings.controller.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', listUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUserAdmin);
router.get('/settings/external-checks', getExternalChecksSetting);
router.patch('/settings/external-checks', updateExternalChecksSetting);

export default router;
