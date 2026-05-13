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
 * Input  : { waterRows }
 * Output : canonical water metrics object
 */
export function deriveWaterMetrics({ waterRows = [] } = {}) {

  const DEFAULTS = {
    totalWaterKl:          0,
    reusePct:              0,
    tankerDependencyPct:   0,
    waterMonitoringMonths: 0,
    recycledWaterAvailable: false,
    sewageReusePct:        0,
  };

  if (!waterRows.length) return DEFAULTS;

  // ── Aggregate totals ───────────────────────
  let totalWaterKl   = 0;
  let totalTankerKl  = 0;
  let totalRecycledKl = 0;
  const monitoredMonthSet = new Set();

  for (const row of waterRows) {
    const municipal  = toPositiveNumber(row.municipal);
    const tanker     = toPositiveNumber(row.tanker);
    const borewell   = toPositiveNumber(row.borewell);
    const recycled   = toPositiveNumber(row.recycled);

    // Prefer totalWater if available, otherwise sum sources
    const rowTotal = toPositiveNumber(row.totalWater) ||
                     (municipal + tanker + borewell);

    totalWaterKl    += rowTotal;
    totalTankerKl   += tanker;
    totalRecycledKl += recycled;

    // Count unique monitored months only
    if (rowTotal > 0 && row.month) {
      monitoredMonthSet.add(row.month);
    }
  }

  if (totalWaterKl === 0) return DEFAULTS;

  // ── Percentages ────────────────────────────
  const reusePct            = clampPct((totalRecycledKl / totalWaterKl) * 100);
  const tankerDependencyPct = clampPct((totalTankerKl   / totalWaterKl) * 100);

  // sewageReusePct mirrors reusePct until STP-specific column exists
  const sewageReusePct = reusePct;

  // ── Boolean: any reuse occurring ──────────
  // This replaces flags.hasSTP in Step 3
  const recycledWaterAvailable = totalRecycledKl > 0;

  // ── Monitoring months ──────────────────────
  const waterMonitoringMonths = Math.min(12, monitoredMonthSet.size);

  return {
    totalWaterKl:           Math.round(totalWaterKl),
    reusePct,
    tankerDependencyPct,
    waterMonitoringMonths,
    recycledWaterAvailable,
    sewageReusePct,
  };
}