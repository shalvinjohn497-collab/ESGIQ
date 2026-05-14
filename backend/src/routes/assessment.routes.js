import { Router } from 'express';
import { assessmentController } from '../controllers/assessment.controller.js';
import { resultsController } from '../controllers/results.controller.js';
import { pdfController } from '../controllers/pdf.controller.js';
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
router.put('/:id/scores',     assessmentController.saveScores);
router.put('/:id/results',    resultsController.saveResults);
router.post('/:id/pdf',       pdfController.generate);
router.get('/:id/pdf/download', pdfController.download);
router.delete('/:id', assessmentController.remove);

export default router;