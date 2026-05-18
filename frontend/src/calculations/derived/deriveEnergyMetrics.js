// ─────────────────────────────────────────────
// deriveEnergyMetrics.js
// Pure function. No React. No Zustand. No side effects.
// Derives canonical energy metrics from raw upload rows.
// ─────────────────────────────────────────────

const toPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const clampPct = (raw) => {
  return Math.min(100, Math.max(0, parseFloat(raw.toFixed(2))));
};

// Diesel → kWh conversion factor (BRD-defined — do not change)
const DG_KWH_PER_LITRE = 3.5;

/**
 * deriveEnergyMetrics
 * Input  : { rows, fuelRows, builtUpArea }
 * Output : canonical energy metrics object
 *
 * FIX 1: Accept builtUpArea and compute energyIntensity (kWh/sqft/yr)
 *         BRD §11.2.1 — intensity = annualizedKwh ÷ builtUpArea
 * FIX 2: Expose annualizedKwh in return so consumers don't re-derive it
 */
export function deriveEnergyMetrics({ rows = [], fuelRows = [], builtUpArea = 0 } = {}) {

  const DEFAULTS = {
    renewablePct: 0,
    dgDependencyPct: 0,
    gridDependencyPct: 0,
    totalEnergyKwh: 0,
    annualizedKwh: 0,          // FIX 2: added
    energyIntensity: null,     // FIX 1: added — null signals "cannot calculate"
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
    const elec   = toPositiveNumber(row.elec);
    const ren    = toPositiveNumber(row.ren);
    const diesel = toPositiveNumber(row.diesel);

    totalElecKwh        += elec;
    totalRenKwh         += ren;
    totalDieselFromRows += diesel;

    if ((elec > 0 || ren > 0 || diesel > 0) && row.month) {
      monitoredMonthSet.add(row.month);
    }
  }

  // ── Diesel dual-source resolution ─────────
  let dieselLitresTotal = totalDieselFromRows;
  if (dieselLitresTotal === 0 && fuelRows.length > 0) {
    dieselLitresTotal = fuelRows.reduce((sum, row) => {
      return sum + toPositiveNumber(row.fuelDiesel);
    }, 0);
  }

  // ── DG energy estimation ───────────────────
  const dgEnergyKwh    = dieselLitresTotal * DG_KWH_PER_LITRE;
  const totalEnergyKwh = totalElecKwh + dgEnergyKwh;

  if (totalEnergyKwh === 0) return DEFAULTS;

  // ── Monitoring months ──────────────────────
  const energyMonitoringMonths = Math.min(12, monitoredMonthSet.size);

  // ── FIX 2: Annualized kWh ─────────────────
  // BRD §6.1 — annualized = (total ÷ months) × 12
  // Only annualize if we have at least 3 months (BRD §6.2 Step 1)
  const annualizedKwh = energyMonitoringMonths >= 3
    ? parseFloat(((totalElecKwh / energyMonitoringMonths) * 12).toFixed(2))
    : 0;

  // ── FIX 1: Energy intensity ────────────────
  // BRD §11.2.1 — intensity = annualizedKwh ÷ builtUpArea (sqft)
  // null if area is 0 or annualization threshold not met
  const energyIntensity =
    annualizedKwh > 0 && builtUpArea > 0
      ? parseFloat((annualizedKwh / builtUpArea).toFixed(2))
      : null;

  // ── Percentages ────────────────────────────
  const renewablePct    = clampPct((totalRenKwh  / totalEnergyKwh) * 100);
  const dgDependencyPct = clampPct((dgEnergyKwh  / totalEnergyKwh) * 100);
  const gridDependencyPct = clampPct(100 - renewablePct - dgDependencyPct);

  return {
    renewablePct,
    dgDependencyPct,
    gridDependencyPct,
    totalEnergyKwh:        Math.round(totalEnergyKwh),
    annualizedKwh,         // FIX 2
    energyIntensity,       // FIX 1
    energyMonitoringMonths,
    dieselLitresTotal:     Math.round(dieselLitresTotal),
  };
}