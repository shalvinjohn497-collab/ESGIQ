// ─────────────────────────────────────────────
// deriveEnergyMetrics.js
// Pure function. No React. No Zustand. No side effects.
// Derives canonical energy metrics from raw upload rows.
// ─────────────────────────────────────────────

// Sanitize any value to a positive number or 0
const toPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// Clamp percentage: calculate → clamp → round → return number
const clampPct = (raw) => {
  return Math.min(100, Math.max(0, parseFloat(raw.toFixed(2))));
};

// Diesel → kWh conversion factor (BRD-defined — do not change)
const DG_KWH_PER_LITRE = 3.5;

/**
 * deriveEnergyMetrics
 * Input  : { rows, fuelRows }
 * Output : canonical energy metrics object
 */
export function deriveEnergyMetrics({ rows = [], fuelRows = [] } = {}) {

  // Safe defaults returned when no data exists
  const DEFAULTS = {
    renewablePct: 0,
    dgDependencyPct: 0,
    gridDependencyPct: 0,
    totalEnergyKwh: 0,
    energyMonitoringMonths: 0,
    dieselLitresTotal: 0,
  };

  if (!rows.length) return DEFAULTS;

  // ── Aggregate totals ───────────────────────
  let totalElecKwh = 0;
  let totalRenKwh  = 0;
  let totalDieselFromRows = 0;
  const monitoredMonthSet = new Set();

  for (const row of rows) {
    const elec    = toPositiveNumber(row.elec);
    const ren     = toPositiveNumber(row.ren);
    const diesel  = toPositiveNumber(row.diesel);

    totalElecKwh         += elec;
    totalRenKwh          += ren;
    totalDieselFromRows  += diesel;

    // Count unique monitored months only
    if ((elec > 0 || ren > 0 || diesel > 0) && row.month) {
      monitoredMonthSet.add(row.month);
    }
  }

  // ── Diesel dual-source resolution ─────────
  // rows[].diesel is canonical. fuelRows fallback only when rows = 0.
  let dieselLitresTotal = totalDieselFromRows;

  if (dieselLitresTotal === 0 && fuelRows.length > 0) {
    dieselLitresTotal = fuelRows.reduce((sum, row) => {
      return sum + toPositiveNumber(row.fuelDiesel);
    }, 0);
  }

  // ── DG energy estimation ───────────────────
  const dgEnergyKwh    = dieselLitresTotal * DG_KWH_PER_LITRE;

  // ── Total energy ───────────────────────────
  const totalEnergyKwh = totalElecKwh + dgEnergyKwh;

  if (totalEnergyKwh === 0) return DEFAULTS;

  // ── Percentages ────────────────────────────
  // Step 1: raw → Step 2: clamp → Step 3: round → Step 4: return number
  const renewablePct    = clampPct((totalRenKwh  / totalEnergyKwh) * 100);
  const dgDependencyPct = clampPct((dgEnergyKwh  / totalEnergyKwh) * 100);

  // Grid is the remainder — prevents floating point drift
  const gridDependencyPct = clampPct(100 - renewablePct - dgDependencyPct);

  // ── Monitoring months ──────────────────────
  const energyMonitoringMonths = Math.min(12, monitoredMonthSet.size);

  return {
    renewablePct,
    dgDependencyPct,
    gridDependencyPct,
    totalEnergyKwh:        Math.round(totalEnergyKwh),
    energyMonitoringMonths,
    dieselLitresTotal:     Math.round(dieselLitresTotal),
  };
}