import { asyncHandler } from '../middleware/error.middleware.js';
import { assessmentService } from '../services/assessment.service.js';

export const resultsController = {
  saveResults: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const results = req.body;

    const updatedAssessment = await assessmentService.saveAssessmentResults(id, results);

    if (!updatedAssessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    res.json({ success: true, assessment: updatedAssessment });
  }),
};
