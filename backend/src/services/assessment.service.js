import Assessment from '../models/Assessment.model.js';

export const assessmentService = {
  async saveAssessmentResults(assessmentId, results) {
    return Assessment.findByIdAndUpdate(
      assessmentId,
      { $set: { results } },
      { new: true, runValidators: false }
    );
  }
};
