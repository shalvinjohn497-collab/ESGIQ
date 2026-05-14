
import { Router } from 'express';
import { assessmentController } from '../controllers/assessment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/',       assessmentController.list);
router.get('/latest', assessmentController.latest);
router.get('/:id',    assessmentController.getOne);
router.post('/',      assessmentController.create);
router.put('/:id',    assessmentController.update);
router.put('/:id/upload', assessmentController.uploadCategory);
router.put('/:id/governance', assessmentController.saveGovernance);
router.delete('/:id', assessmentController.remove);

export default router;