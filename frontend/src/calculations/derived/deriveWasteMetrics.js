// ─────────────────────────────────────────────
// deriveWasteMetrics.js
// Pure function. No React. No Zustand. No side effects.
// Derives canonical waste metrics from raw upload rows.
// ─────────────────────────────────────────────

const toPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const clampPct = (raw) => {
  return Math.min(100, Math.max(0, parseFloat(raw.toFixed(2))));
};

/**
 * segregationMaturity ordinal — FROZEN
 * 0 = no tracking
 * 1 = self-reported only (flags, no upload evidence)
 * 2 = measured and documented (upload rows exist)
 * 3 = third-party verified
 *
 * Flags alone max out at level 1.
 * Level 2+ requires actual upload evidence.
 */
function resolveSegregationMaturity({ wasteMonitoringMonths, biomedicalWasteTracked, flags }) {
  if (wasteMonitoringMonths > 0) {
    // Upload evidence exists — at minimum level 2
    return biomedicalWasteTracked ? 2 : 2;
  }
  if (flags.segregation) {
    // Flag only — self-reported, no upload evidence
    return 1;
  }
  return 0;
}

/**
 * deriveWasteMetrics
 * Input  : { wasteRows, flags }
 * Output : canonical waste metrics object
 */
export function deriveWasteMetrics({ wasteRows = [], flags = {} } = {}) {

  const DEFAULTS = {
    totalWasteKg:          0,
    recyclingPct:          0,
    biomedicalWasteTracked: false,
    hazardousWasteTracked:  false,
    wasteMonitoringMonths:  0,
    segregationMaturity:    flags.segregation ? 1 : 0,
  };

  if (!wasteRows.length) return DEFAULTS;

  // ── Aggregate totals ───────────────────────
  let totalWasteKg      = 0;
  let totalDryKg        = 0;
  let totalBiomedicalKg = 0;
  let totalHazardousKg  = 0;
  const monitoredMonthSet = new Set();

  for (const row of wasteRows) {
    const wet        = toPositiveNumber(row.wet);
    const dry        = toPositiveNumber(row.dry);
    const biomedical = toPositiveNumber(row.biomedical);
    const hazardous  = toPositiveNumber(row.hazardous);

    // Prefer totalWaste if available, otherwise sum streams
    const rowTotal = toPositiveNumber(row.totalWaste) ||
                     (wet + dry + biomedical + hazardous);

    totalWasteKg      += rowTotal;
    totalDryKg        += dry;
    totalBiomedicalKg += biomedical;
    totalHazardousKg  += hazardous;

    // Count unique monitored months only
    if (rowTotal > 0 && row.month) {
      monitoredMonthSet.add(row.month);
    }
  }

  if (totalWasteKg === 0) return DEFAULTS;

  // ── Recycling percentage ───────────────────
  // dry waste is recyclable proxy until dedicated recycled column exists
  const recyclingPct = clampPct((totalDryKg / totalWasteKg) * 100);

  // ── Booleans ──────────────────────────────
  const biomedicalWasteTracked = totalBiomedicalKg > 0;
  const hazardousWasteTracked  = totalHazardousKg  > 0;

  // ── Monitoring months ──────────────────────
  const wasteMonitoringMonths = Math.min(12, monitoredMonthSet.size);

  // ── Segregation maturity ordinal ──────────
  const segregationMaturity = resolveSegregationMaturity({
    wasteMonitoringMonths,
    biomedicalWasteTracked,
    flags,
  });

  return {
    totalWasteKg:           Math.round(totalWasteKg),
    recyclingPct,
    biomedicalWasteTracked,
    hazardousWasteTracked,
    wasteMonitoringMonths,
    segregationMaturity,
  };
}