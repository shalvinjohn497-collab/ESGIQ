import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import Assessment from '../models/Assessment.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = path.resolve(__dirname, '../../uploads/pdfs');

const DISCLAIMER = 'This assessment provides an indicative readiness evaluation based on self-reported data. It does not constitute formal certification, regulatory assurance, or legal advice. Results should be independently verified before being used for compliance filings.';

// Ensure the uploads directory exists
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

// ─── Helpers ────────────────────────────────────────────────────
function drawSectionTitle(doc, title) {
  doc.moveDown(1);
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text(title);
  const lineY = doc.y + 2;
  const lineX = 50; // ← use fixed margin instead of doc.x (which can be NaN)
  doc.moveTo(lineX, lineY).lineTo(lineX + 490, lineY).strokeColor('#e2e8f0').stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
}

function drawKV(doc, label, value) {
  const safeValue = String(value ?? '—');
  doc
    .font('Helvetica-Bold').text(`${label}: `, { continued: true })
    .font('Helvetica').text(safeValue, { continued: false }); // ← explicitly close
  doc.x = 50; // ← reset to left margin after inline text
}

function drawTableRow(doc, cols, widths, opts = {}) {
  const startX = 50; // ← fixed margin, never doc.x
  const y = doc.y;
  cols.forEach((col, i) => {
    doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
       .fontSize(9)
       .text(
         String(col ?? '—'),
         startX + widths.slice(0, i).reduce((a, b) => a + b, 0),
         y,
         { width: widths[i], align: 'left' }
       );
  });
  doc.moveDown(0.3);
}

// ─── Main generator ─────────────────────────────────────────────
export async function generateAssessmentPdf(assessmentId) {
  const assessment = await Assessment.findById(assessmentId).lean();
  if (!assessment) throw Object.assign(new Error('Assessment not found'), { status: 404 });

  const results = assessment.results || {};
  const scores = assessment.scores || {};
  const flags = assessment.flags || {};

  const timestamp = Date.now();
  const filename = `${assessmentId}_${timestamp}.pdf`;
  const filePath = path.join(PDF_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ── Title page ────────────────────────────────────────────
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#0f172a')
       .text('ESG Readiness Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
       .text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
    doc.text(`Assessment ID: ${assessmentId}`, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e1').stroke();
    doc.moveDown(1);

    // ── Org Profile ───────────────────────────────────────────
    drawSectionTitle(doc, '1. Organisation Profile');
    drawKV(doc, 'Sector', assessment.sector || 'Not specified');
    drawKV(doc, 'Building Area', `${flags.area || '—'} sqft`);
    drawKV(doc, 'Assessment Name', assessment.name || '—');
    drawKV(doc, 'Status', assessment.status || 'draft');

    // ── Upload Summary ────────────────────────────────────────
    drawSectionTitle(doc, '2. Data Upload Summary');
    const us = assessment.uploadStatus || {};
    const categories = ['electricity', 'water', 'fuel', 'waste'];
    const colWidths = [120, 100, 100, 170];
    drawTableRow(doc, ['Category', 'Months', 'Source', 'Uploaded At'], colWidths, { bold: true });
    categories.forEach(cat => {
      const info = us[cat] || {};
      drawTableRow(doc, [
        cat.charAt(0).toUpperCase() + cat.slice(1),
        info.monthsUploaded ?? '—',
        info.source ?? '—',
        info.uploadedAt ? new Date(info.uploadedAt).toLocaleDateString('en-IN') : '—',
      ], colWidths);
    });

    // ── Emissions ─────────────────────────────────────────────
    drawSectionTitle(doc, '3. Emissions Summary (tCO₂e)');
    const em = results.emissionsData || assessment.emissions || {};
    const emWidths = [130, 130, 130, 130];
    drawTableRow(doc, ['Scope 1', 'Scope 2', 'Scope 3', 'Total'], emWidths, { bold: true });
    drawTableRow(doc, [em.scope1 ?? '—', em.scope2 ?? '—', em.scope3 ?? '—', em.total ?? '—'], emWidths);

    // ── KPI Benchmarks ────────────────────────────────────────
    drawSectionTitle(doc, '4. KPI Benchmarks');
    const cs = results.categoryScores || {};
    drawKV(doc, 'Energy Score', cs.energy ?? scores.energy ?? '—');
    drawKV(doc, 'Water Score', cs.water ?? scores.water ?? '—');
    drawKV(doc, 'Waste Score', cs.waste ?? scores.waste ?? '—');
    drawKV(doc, 'Governance Score', cs.governance ?? scores.gov ?? '—');
    drawKV(doc, 'Overall Score', results.overallScore ?? scores.overall ?? '—');
    drawKV(doc, 'Readiness Stage', results.readinessStage ?? '—');

    // ── Certification Matrix ──────────────────────────────────
    doc.addPage();
    drawSectionTitle(doc, '5. Certification Readiness Matrix');
    const certs = results.certificationResults || assessment.certifications || [];
    if (Array.isArray(certs) && certs.length > 0) {
      const cWidths = [140, 60, 80, 80, 130];
      drawTableRow(doc, ['Framework', 'Score', 'Tier', 'Timeline', 'Prerequisites'], cWidths, { bold: true });
      certs.forEach(c => {
        drawTableRow(doc, [
          c.name || c.frameworkId || '—',
          c.score != null ? `${c.score}%` : '—',
          c.tier || '—',
          c.timeline || '—',
          c.prerequisitesMet === false ? 'UNMET' : 'Met',
        ], cWidths);
      });
    } else {
      doc.text('No certification data available.');
    }

    // ── Regulatory Table ──────────────────────────────────────
    drawSectionTitle(doc, '6. Regulatory Readiness');
    const regs = results.regulatoryResults || [];
    if (Array.isArray(regs) && regs.length > 0) {
      const rWidths = [140, 60, 80, 80, 130];
      drawTableRow(doc, ['Regulation', 'Score', 'Risk', 'Applicable', 'Notes'], rWidths, { bold: true });
      regs.forEach(r => {
        drawTableRow(doc, [
          r.name || '—',
          r.score != null ? `${r.score}%` : '—',
          r.riskLevel || '—',
          r.applicable ? 'Yes' : 'No',
          (r.notes || '').substring(0, 50),
        ], rWidths);
      });
    } else {
      doc.text('No regulatory data available.');
    }

    // ── Strengths & Gaps ──────────────────────────────────────
    drawSectionTitle(doc, '7. Strengths & Gaps');
    const sng = results.strengthsAndGaps || {};
    const strs = sng.strengths || assessment.strengths || [];
    const gps = sng.gaps || assessment.gaps || [];
    doc.font('Helvetica-Bold').text('Strengths:');
    doc.font('Helvetica');
    if (strs.length > 0) strs.slice(0, 5).forEach(s => doc.text(`  • ${s}`));
    else doc.text('  No significant strengths identified.');
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Gaps:');
    doc.font('Helvetica');
    if (gps.length > 0) gps.slice(0, 5).forEach(g => doc.text(`  • ${g}`));
    else doc.text('  No critical gaps identified.');

    // ── Executive Summary ─────────────────────────────────────
    drawSectionTitle(doc, '8. Executive Summary');
    doc.text(
      `Based on the operational data provided, your current ESG maturity scores at ${results.overallScore ?? '—'}%, ` +
      `placing you in the "${results.readinessStage ?? '—'}" stage. ` +
      (strs.length > 0 ? `Key strengths include: ${strs.slice(0, 3).join('; ')}. ` : '') +
      (gps.length > 0 ? `Primary gaps include: ${gps.slice(0, 3).join('; ')}.` : ''),
      { lineGap: 4 }
    );

    // ── Disclaimer ────────────────────────────────────────────
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8')
       .text('DISCLAIMER', { underline: true });
    doc.text(DISCLAIMER, { lineGap: 2 });

    // ── Footer with page numbers ──────────────────────────────
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
         .text(`ESGIQ Readiness Report  •  Page ${i + 1} of ${pages.count}`, 50, 780, { align: 'center', width: 495 });
    }

    doc.end();

    stream.on('finish', () => resolve({ filePath, filename }));
    stream.on('error', reject);
  });
}

export async function deleteExpiredPdfs() {
  const now = new Date();
  const expired = await Assessment.find({
    'pdfExpiresAt': { $lt: now },
    'pdfPath': { $ne: null },
  }).select('_id pdfPath').lean();

  let deletedCount = 0;
  for (const a of expired) {
    if (a.pdfPath && fs.existsSync(a.pdfPath)) {
      fs.unlinkSync(a.pdfPath);
      deletedCount++;
    }
    await Assessment.updateOne(
      { _id: a._id },
      { $set: { pdfPath: null, pdfGeneratedAt: null, pdfExpiresAt: null } }
    );
  }
  console.log(`[PDF Cleanup] Deleted ${deletedCount} expired PDF(s).`);
  return deletedCount;
}
