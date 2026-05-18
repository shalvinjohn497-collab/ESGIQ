// ─────────────────────────────────────────────
// deriveWaterMetrics.js
// Pure function. No React. No Zustand. No side effects.
// Derives canonical water metrics from raw upload rows.
// ─────────────────────────────────────────────

const toPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const clampPct = (raw) => {
  return Math.min(100, Math.max(0, parseFloat(raw.toFixed(2))));
};

/**
 * deriveWaterMetrics
 * Input  : { waterRows, builtUpArea }
 * Output : canonical water metrics object
 *
 * FIX: Accept builtUpArea and compute waterIntensity (KL/sqft/yr)
 *      BRD §11.2.2 — intensity = annualizedWaterKl ÷ builtUpArea
 */
export function deriveWaterMetrics({ waterRows = [], builtUpArea = 0 } = {}) {

  const DEFAULTS = {
    totalWaterKl:           0,
    annualizedWaterKl:      0,   // added: parallel to annualizedKwh in energy
    waterIntensity:         null, // FIX: null = cannot calculate
    reusePct:               0,
    tankerDependencyPct:    0,
    waterMonitoringMonths:  0,
    recycledWaterAvailable: false,
    sewageReusePct:         0,
  };

  if (!waterRows.length) return DEFAULTS;

  // ── Aggregate totals ───────────────────────
  let totalWaterKl    = 0;
  let totalTankerKl   = 0;
  let totalRecycledKl = 0;
  const monitoredMonthSet = new Set();

  for (const row of waterRows) {
    const municipal  = toPositiveNumber(row.municipal);
    const tanker     = toPositiveNumber(row.tanker);
    const borewell   = toPositiveNumber(row.borewell);
    const recycled   = toPositiveNumber(row.recycled);

    const rowTotal = toPositiveNumber(row.totalWater) ||
                     (municipal + tanker + borewell);

    totalWaterKl    += rowTotal;
    totalTankerKl   += tanker;
    totalRecycledKl += recycled;

    if (rowTotal > 0 && row.month) {
      monitoredMonthSet.add(row.month);
    }
  }

  if (totalWaterKl === 0) return DEFAULTS;

  // ── Monitoring months ──────────────────────
  const waterMonitoringMonths = Math.min(12, monitoredMonthSet.size);

  // ── Annualized water (parallel to energy annualization) ───────────
  // BRD §6.1 — annualized = (total ÷ months) × 12; min 3 months required
  const annualizedWaterKl = waterMonitoringMonths >= 3
    ? parseFloat(((totalWaterKl / waterMonitoringMonths) * 12).toFixed(2))
    : 0;

  // ── FIX: Water intensity ───────────────────
  // BRD §11.2.2 — intensity = annualizedWaterKl ÷ builtUpArea (sqft)
  const waterIntensity =
    annualizedWaterKl > 0 && builtUpArea > 0
      ? parseFloat((annualizedWaterKl / builtUpArea).toFixed(4))
      : null;

  // ── Percentages ────────────────────────────
  const reusePct            = clampPct((totalRecycledKl / totalWaterKl) * 100);
  const tankerDependencyPct = clampPct((totalTankerKl   / totalWaterKl) * 100);
  const sewageReusePct      = reusePct;
  const recycledWaterAvailable = totalRecycledKl > 0;

  return {
    totalWaterKl:           Math.round(totalWaterKl),
    annualizedWaterKl,
    waterIntensity,          // FIX
    reusePct,
    tankerDependencyPct,
    waterMonitoringMonths,
    recycledWaterAvailable,
    sewageReusePct,
  };
}