import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import Assessment from '../models/Assessment.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = path.resolve(__dirname, '../../uploads/pdfs');

const DISCLAIMER = 'This assessment provides an indicative readiness evaluation based on self-reported data. It does not constitute formal certification, regulatory assurance, or legal advice. Results should be independently verified before being used for compliance filings.';

const COLORS = {
  navy:    '#0f172a',
  slate:   '#334155',
  dim:     '#64748b',
  rule:    '#e2e8f0',
  accent:  '#10b981',
  bg:      '#f8fafc',
  white:   '#ffffff',
  amber:   '#f59e0b',
};

const M = { left: 50, right: 545, top: 50, width: 495 };

if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────

function safeStr(val, fallback = '—') {
  if (val == null || val === '') return fallback;
  if (typeof val === 'object') {
    return val.insight || val.gap || val.text || val.label || val.title || fallback;
  }
  return String(val);
}

function resetX(doc) { doc.x = M.left; }

function sectionHeader(doc, number, title) {
  doc.moveDown(1.2);
  // Accent bar
  doc.rect(M.left, doc.y, 3, 16).fill(COLORS.accent);
  doc.fillColor(COLORS.navy).font('Helvetica-Bold').fontSize(13)
     .text(`${number}. ${title}`, M.left + 10, doc.y - 14, { width: M.width - 10 });
  doc.moveDown(0.3);
  doc.moveTo(M.left, doc.y).lineTo(M.right, doc.y).strokeColor(COLORS.rule).lineWidth(0.5).stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.slate);
  resetX(doc);
}

function kv(doc, label, value) {
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.dim)
     .text(label.toUpperCase(), M.left, y, { width: 130 });
  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.navy)
     .text(safeStr(value), M.left + 135, y, { width: M.width - 135 });
  doc.moveDown(0.35);
  resetX(doc);
}

function tableHeader(doc, cols, widths) {
  const y = doc.y;
  doc.rect(M.left, y, M.width, 18).fill('#f1f5f9');
  let x = M.left + 6;
  cols.forEach((col, i) => {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.dim)
       .text(col.toUpperCase(), x, y + 5, { width: widths[i] - 4, align: 'left' });
    x += widths[i];
  });
  doc.moveDown(0.1);
  resetX(doc);
  doc.y = y + 22;
}

function tableRow(doc, cols, widths, isAlt = false) {
  const y = doc.y;
  const rowH = 18;
  if (isAlt) doc.rect(M.left, y, M.width, rowH).fill('#fafafa');
  let x = M.left + 6;
  cols.forEach((col, i) => {
    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.navy)
       .text(safeStr(col), x, y + 4, { width: widths[i] - 6, align: 'left' });
    x += widths[i];
  });
  doc.moveTo(M.left, y + rowH).lineTo(M.right, y + rowH).strokeColor('#f1f5f9').lineWidth(0.3).stroke();
  resetX(doc);
  doc.y = y + rowH + 2;
}

function scoreBadge(doc, label, score, x, y, w = 110) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444';
  doc.rect(x, y, w, 48).fill('#f8fafc').stroke('#e2e8f0');
  doc.font('Helvetica-Bold').fontSize(18).fillColor(color)
     .text(`${pct}`, x, y + 6, { width: w, align: 'center' });
  doc.font('Helvetica').fontSize(7).fillColor(COLORS.dim)
     .text(label, x, y + 30, { width: w, align: 'center' });
  return y + 54;
}

function bullet(doc, text) {
  const t = safeStr(text);
  if (t === '—') return;
  doc.rect(M.left, doc.y + 4, 4, 4).fill(COLORS.accent);
  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.slate)
     .text(t, M.left + 12, doc.y, { width: M.width - 12, lineGap: 2 });
  doc.moveDown(0.4);
  resetX(doc);
}

// ─── Main generator ─────────────────────────────────────────────

export async function generateAssessmentPdf(assessmentId) {
  const assessment = await Assessment.findById(assessmentId).lean();
  if (!assessment) throw Object.assign(new Error('Assessment not found'), { status: 404 });

  const results  = assessment.results  || {};
  const scores   = assessment.scores   || {};
  const flags    = assessment.flags    || {};
  const us       = assessment.uploadStatus || {};

  const filename = `${assessmentId}_${Date.now()}.pdf`;
  const filePath = path.join(PDF_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ── Cover page ────────────────────────────────────────────
    // Green top bar
    doc.rect(0, 0, 595, 6).fill(COLORS.accent);

    doc.moveDown(2);
    doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.navy)
       .text('ESG Readiness', M.left, 80, { align: 'left' });
    doc.fontSize(28).font('Helvetica').fillColor(COLORS.accent)
       .text('Report', { align: 'left' });

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.dim)
       .text(`${assessment.name || 'Assessment'}  ·  ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'left' });

    doc.moveDown(0.3);
    doc.fontSize(8).fillColor(COLORS.dim)
       .text(`Assessment ID: ${assessmentId}`, { align: 'left' });

    // Divider
    doc.moveDown(1.5);
    doc.moveTo(M.left, doc.y).lineTo(M.right, doc.y).strokeColor(COLORS.accent).lineWidth(1).stroke();
    doc.moveDown(1);

    // Quick stat boxes
    const overallScore = results.overallScore ?? scores.overall ?? 0;
    const cs = results.categoryScores || {};
    const statBoxes = [
      { label: 'Overall Score', val: overallScore },
      { label: 'Energy',        val: cs.energy ?? scores.energy ?? 0 },
      { label: 'Water',         val: cs.water  ?? scores.water  ?? 0 },
      { label: 'Waste',         val: cs.waste  ?? scores.waste  ?? 0 },
    ];
    let bx = M.left;
    const by = doc.y;
    statBoxes.forEach(({ label, val }) => {
      scoreBadge(doc, label, val, bx, by);
      bx += 122;
    });
    doc.y = by + 58;
    doc.moveDown(0.5);

    // ── Section 1: Org Profile ────────────────────────────────
    sectionHeader(doc, 1, 'Organisation Profile');
    kv(doc, 'Assessment Name', assessment.name);
    kv(doc, 'Sector',          assessment.sector ?? '—');
    kv(doc, 'Building Area',   flags.area ? `${flags.area} sqft` : '—');
    kv(doc, 'Status',          assessment.status ?? '—');
    kv(doc, 'Generated',       new Date().toLocaleString('en-IN'));

    // ── Section 2: Upload Summary ─────────────────────────────
    sectionHeader(doc, 2, 'Data Upload Summary');
    const cats = ['electricity', 'water', 'fuel', 'waste'];
    const uWidths = [130, 80, 100, 185];
    tableHeader(doc, ['Category', 'Months', 'Source', 'Uploaded At'], uWidths);
    cats.forEach((cat, i) => {
      const info = us[cat] || {};
      tableRow(doc, [
        cat.charAt(0).toUpperCase() + cat.slice(1),
        info.monthsUploaded ?? '—',
        info.source ?? '—',
        info.uploadedAt ? new Date(info.uploadedAt).toLocaleDateString('en-IN') : '—',
      ], uWidths, i % 2 === 1);
    });

    // ── Section 3: Emissions ──────────────────────────────────
    sectionHeader(doc, 3, 'Emissions Summary (tCO2e)');
    const em = results.emissionsData || assessment.emissions || {};
    const eWidths = [124, 124, 124, 123];
    tableHeader(doc, ['Scope 1', 'Scope 2', 'Scope 3', 'Total'], eWidths);
    tableRow(doc, [em.scope1 ?? '—', em.scope2 ?? '—', em.scope3 ?? '—', em.total ?? '—'], eWidths, false);

    // ── Section 4: KPI Scores ─────────────────────────────────
    sectionHeader(doc, 4, 'KPI Benchmarks');
    const kvScores = [
      ['Energy Score',      cs.energy     ?? scores.energy  ?? '—'],
      ['Water Score',       cs.water      ?? scores.water   ?? '—'],
      ['Waste Score',       cs.waste      ?? scores.waste   ?? '—'],
      ['Governance Score',  cs.governance ?? scores.gov     ?? '—'],
      ['Overall Score',     overallScore],
      ['Readiness Stage',   results.readinessStage ?? '—'],
    ];
    kvScores.forEach(([label, val]) => kv(doc, label, val));

    // ── Section 5: Certification Matrix ──────────────────────
    doc.addPage();
    doc.rect(0, 0, 595, 6).fill(COLORS.accent);
    doc.moveDown(1);

    sectionHeader(doc, 5, 'Certification Readiness Matrix');
    const certs = results.certificationResults || assessment.certifications || [];
    if (Array.isArray(certs) && certs.length > 0) {
      const cWidths = [150, 65, 75, 90, 115];
      tableHeader(doc, ['Framework', 'Score', 'Tier', 'Timeline', 'Prerequisites'], cWidths);
      certs.forEach((c, i) => {
        tableRow(doc, [
          c.name || c.frameworkId || '—',
          c.score != null ? `${c.score}%` : '—',
          c.tier || '—',
          c.timeline || '—',
          c.prerequisitesMet === false ? 'UNMET' : 'Met',
        ], cWidths, i % 2 === 1);
      });
    } else {
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.dim).text('No certification data available.');
    }

    // ── Section 6: Regulatory ─────────────────────────────────
    sectionHeader(doc, 6, 'Regulatory Readiness');
    const regs = results.regulatoryResults || [];
    if (Array.isArray(regs) && regs.length > 0) {
      const rWidths = [145, 55, 65, 75, 155];
      tableHeader(doc, ['Regulation', 'Score', 'Risk', 'Applicable', 'Notes'], rWidths);
      regs.forEach((r, i) => {
        tableRow(doc, [
          r.name || '—',
          r.score != null ? `${r.score}%` : '—',
          r.riskLevel || '—',
          r.applicable ? 'Yes' : 'No',
          (r.notes || '').substring(0, 60),
        ], rWidths, i % 2 === 1);
      });
    } else {
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.dim).text('No regulatory data available.');
    }

    // ── Section 7: Strengths & Gaps ───────────────────────────
    sectionHeader(doc, 7, 'Strengths & Gaps');
    const sng  = results.strengthsAndGaps || {};
    const strs = sng.strengths || assessment.strengths || [];
    const gps  = sng.gaps      || assessment.gaps      || [];

    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.navy).text('Strengths');
    doc.moveDown(0.3);
    if (strs.length > 0) strs.slice(0, 5).forEach(s => bullet(doc, s));
    else { doc.font('Helvetica').fontSize(9).fillColor(COLORS.dim).text('  No significant strengths identified.'); }

    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.navy).text('Gaps');
    doc.moveDown(0.3);
    if (gps.length > 0) gps.slice(0, 5).forEach(g => bullet(doc, g));
    else { doc.font('Helvetica').fontSize(9).fillColor(COLORS.dim).text('  No critical gaps identified.'); }

    // ── Section 8: Executive Summary ──────────────────────────
    doc.addPage();
    doc.rect(0, 0, 595, 6).fill(COLORS.accent);
    doc.moveDown(1);

    sectionHeader(doc, 8, 'Executive Summary');
    const strTexts = strs.slice(0, 3).map(s => safeStr(s)).filter(s => s !== '—');
    const gapTexts = gps.slice(0, 3).map(g => safeStr(g)).filter(g => g !== '—');

    const summary =
      `Based on the operational data provided, the organisation currently scores ${overallScore}%, ` +
      `placing it in the "${results.readinessStage ?? '—'}" readiness stage. ` +
      (strTexts.length > 0 ? `Key strengths include: ${strTexts.join('; ')}. ` : '') +
      (gapTexts.length  > 0 ? `Primary gaps include: ${gapTexts.join('; ')}.`  : '');

    doc.font('Helvetica').fontSize(10).fillColor(COLORS.slate)
       .text(summary, M.left, doc.y, { width: M.width, lineGap: 4, align: 'justify' });

    // ── Disclaimer ────────────────────────────────────────────
    doc.moveDown(2);
    doc.rect(M.left, doc.y, M.width, 1).fill(COLORS.rule);
    doc.moveDown(0.5);
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(COLORS.dim).text('DISCLAIMER');
    doc.font('Helvetica').fillColor(COLORS.dim).text(DISCLAIMER, { lineGap: 2, width: M.width });

    // ── Page footers ──────────────────────────────────────────
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.rect(0, 826, 595, 16).fill(COLORS.navy);
      doc.fontSize(7).font('Helvetica').fillColor('#94a3b8')
         .text(
           `ESGIQ Readiness Report  ·  ${assessment.name || ''}  ·  Page ${i + 1} of ${pages.count}`,
           M.left, 830, { align: 'center', width: M.width }
         );
    }

    doc.end();
    stream.on('finish', () => resolve({ filePath, filename }));
    stream.on('error', reject);
  });
}

export async function deleteExpiredPdfs() {
  const now = new Date();
  const expired = await Assessment.find({
    pdfExpiresAt: { $lt: now },
    pdfPath:      { $ne: null },
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