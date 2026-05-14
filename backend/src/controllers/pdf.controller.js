import { asyncHandler } from '../middleware/error.middleware.js';
import { generateAssessmentPdf } from '../services/pdf.service.js';
import Assessment from '../models/Assessment.model.js';

export const pdfController = {
  generate: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { filePath, filename } = await generateAssessmentPdf(id);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

    await Assessment.findByIdAndUpdate(id, {
      $set: {
        pdfPath: filePath,
        pdfGeneratedAt: now,
        pdfExpiresAt: expiresAt,
      },
    });

    res.json({
      success: true,
      downloadUrl: `/api/assessments/${id}/pdf/download`,
      filename,
      expiresAt: expiresAt.toISOString(),
    });
  }),

  download: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const assessment = await Assessment.findById(id).select('pdfPath pdfExpiresAt name').lean();

    if (!assessment || !assessment.pdfPath) {
      return res.status(404).json({ success: false, error: 'No PDF available. Generate one first.' });
    }

    if (assessment.pdfExpiresAt && new Date(assessment.pdfExpiresAt) < new Date()) {
      return res.status(410).json({ success: false, error: 'PDF has expired. Please regenerate.' });
    }

    const { default: fs } = await import('fs');
    if (!fs.existsSync(assessment.pdfPath)) {
      return res.status(404).json({ success: false, error: 'PDF file not found on server.' });
    }

    const safeName = (assessment.name || 'ESG_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
    fs.createReadStream(assessment.pdfPath).pipe(res);
  }),
};
