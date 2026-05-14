import cron from 'node-cron';
import { deleteExpiredPdfs } from '../services/pdf.service.js';

/**
 * Daily cron job at 02:00 AM — deletes PDF files and clears DB references
 * for assessments where pdfExpiresAt < now.
 */
export function startPdfCleanupCron() {
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running daily PDF cleanup…');
    try {
      await deleteExpiredPdfs();
    } catch (err) {
      console.error('[CRON] PDF cleanup error:', err.message);
    }
  });
  console.log('📅 PDF cleanup cron scheduled (daily at 02:00)');
}
