import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);
router.post('/', consultationController.create);

export default router;
