/**
 * BRD §7 Step 7 — logical consistency across uploaded categories.
 *
 * @typedef {'warning' | 'error'} ConsistencySeverity
 * @typedef {{ id: string, severity: ConsistencySeverity, message: string, rule: string }} ConsistencyWarning
 */

const RULE_BRD = 'BRD §7 Step 7';

const EPS = 1e-6;

function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
}

/**
 * Renewable generation must not exceed total site electricity (grid + renewable).
 * @param {number} energyTotal — total electricity (kWh), inclusive of renewable
 * @param {number} renewableTotal — renewable electricity (kWh)
 * @returns {ConsistencyWarning | null}
 */
export function checkRenewableVsTotal(energyTotal, renewableTotal) {
    const e = toNum(energyTotal);
    const r = toNum(renewableTotal);
    if (!Number.isFinite(e) || !Number.isFinite(r)) return null;
    if (e < 0 || r < 0) {
        return {
            id: 'renewable_vs_total',
            severity: 'error',
            message: 'Electricity totals contain negative values; review uploaded grid and renewable kWh.',
            rule: RULE_BRD,
        };
    }
    if (r > e + EPS) {
        return {
            id: 'renewable_vs_total',
            severity: 'error',
            message:
                'Renewable electricity exceeds total electricity — this is physically inconsistent. Correct grid vs renewable kWh before proceeding.',
            rule: RULE_BRD,
        };
    }
    return null;
}

/**
 * Recycled waste mass must not exceed reported total waste.
 * @param {number} totalWaste
 * @param {number} recycledWaste
 * @returns {ConsistencyWarning | null}
 */
export function checkRecycledVsWaste(totalWaste, recycledWaste) {
    const t = toNum(totalWaste);
    const c = toNum(recycledWaste);
    if (!Number.isFinite(t) || !Number.isFinite(c)) return null;
    if (t < 0 || c < 0) {
        return {
            id: 'recycled_vs_waste',
            severity: 'error',
            message: 'Waste totals contain negative values; review uploaded waste quantities.',
            rule: RULE_BRD,
        };
    }
    if (t === 0 && c === 0) return null;
    if (c > t + EPS) {
        return {
            id: 'recycled_vs_waste',
            severity: 'error',
            message:
                'Recycled waste exceeds total waste — this is physically inconsistent. Align recycled and total waste columns.',
            rule: RULE_BRD,
        };
    }
    return null;
}

/**
 * Refrigerant annual leakage must be expressible as 0–100% of installed charge capacity.
 * @param {null|undefined|{
 *   installedCapacityKg?: number,
 *   annualLeakageKg?: number,
 *   leakageRatePct?: number
 * }} refrigerantData
 * @returns {ConsistencyWarning | null}
 */
export function checkRefrigerantLogic(refrigerantData) {
    if (refrigerantData == null || typeof refrigerantData !== 'object') return null;

    const cap = toNum(refrigerantData.installedCapacityKg);
    const leakKg = toNum(refrigerantData.annualLeakageKg);
    const directPct = toNum(refrigerantData.leakageRatePct);

    const hasCapacity = Number.isFinite(cap) && cap > 0;
    const hasLeakKg = Number.isFinite(leakKg) && leakKg >= 0;
    const hasDirectPct = Number.isFinite(directPct);

    if (hasLeakKg && leakKg > EPS && !hasDirectPct && !(Number.isFinite(cap) && cap > 0)) {
        return {
            id: 'refrigerant_leakage_rate',
            severity: 'error',
            message:
                'Refrigerant annual leakage is reported without a positive installed capacity — add capacity (kg) or a 0–100% leakage rate.',
            rule: RULE_BRD,
        };
    }

    if (!hasDirectPct && !(hasCapacity && hasLeakKg)) return null;

    let ratePct = null;
    if (hasDirectPct) {
        ratePct = directPct;
    } else if (hasCapacity && hasLeakKg) {
        ratePct = (leakKg / cap) * 100;
    }

    if (ratePct == null || !Number.isFinite(ratePct)) return null;

    if (ratePct < -EPS) {
        return {
            id: 'refrigerant_leakage_rate',
            severity: 'error',
            message: 'Refrigerant leakage rate is negative — check installed capacity and annual leakage inputs.',
            rule: RULE_BRD,
        };
    }
    if (ratePct > 100 + EPS) {
        return {
            id: 'refrigerant_leakage_rate',
            severity: 'error',
            message:
                'Refrigerant leakage exceeds 100% of installed capacity — physically impossible. Correct leakage or capacity figures.',
            rule: RULE_BRD,
        };
    }
    return null;
}

function sumElectricityGrid(rows) {
    if (!Array.isArray(rows)) return 0;
    return rows.reduce((s, row) => s + (Number(row.elec) || 0), 0);
}

function sumRenewable(rows) {
    if (!Array.isArray(rows)) return 0;
    return rows.reduce((s, row) => s + (Number(row.ren) || 0), 0);
}

function sumTotalWaste(wasteRows) {
    if (!Array.isArray(wasteRows)) return 0;
    return wasteRows.reduce((s, row) => s + (Number(row.totalWaste) || 0), 0);
}

/** Sum recycled-waste stream (explicit columns only; no guessing from dry waste). */
function sumRecycledWaste(wasteRows) {
    if (!Array.isArray(wasteRows)) return 0;
    return wasteRows.reduce((s, row) => {
        const v =
            row.recycledWaste ??
            row.Recycled_kg ??
            row.recycledKg ??
            row.recycled_waste ??
            0;
        return s + (Number(v) || 0);
    }, 0);
}

/**
 * Non-blocking: renewable exceeds grid draw (metering boundary QA).
 * @param {number} gridKwh
 * @param {number} renewableKwh
 * @returns {ConsistencyWarning | null}
 */
function checkRenewableExceedsGridDraw(gridKwh, renewableKwh) {
    const g = toNum(gridKwh);
    const r = toNum(renewableKwh);
    if (!Number.isFinite(g) || !Number.isFinite(r) || g <= EPS) return null;
    if (r <= g + EPS) return null;
    return {
        id: 'renewable_vs_grid_draw',
        severity: 'warning',
        message:
            'Renewable kWh exceeds grid kWh across the year — confirm metering boundaries (e.g. gross vs net import) and that totals are not double-counted.',
        rule: RULE_BRD,
    };
}

/**
 * Run all BRD §7 cross-category checks on current assessment slices.
 * @param {{
 *   electricityRows?: object[],
 *   wasteRows?: object[],
 *   flags?: object,
 *   refrigerantData?: object | null
 * }} input
 * @returns {ConsistencyWarning[]}
 */
export function runCrossCategoryConsistencyChecks({
    electricityRows = [],
    wasteRows = [],
    flags = {},
    refrigerantData = undefined,
} = {}) {
    /** @type {ConsistencyWarning[]} */
    const out = [];

    const gridKwh = sumElectricityGrid(electricityRows);
    const renKwh = sumRenewable(electricityRows);
    const totalEnergy = gridKwh + renKwh;

    const wImpossible = checkRenewableVsTotal(totalEnergy, renKwh);
    if (wImpossible) out.push(wImpossible);
    else {
        const wGrid = checkRenewableExceedsGridDraw(gridKwh, renKwh);
        if (wGrid) out.push(wGrid);
    }

    const totW = sumTotalWaste(wasteRows);
    const recW = sumRecycledWaste(wasteRows);
    const wRec = checkRecycledVsWaste(totW, recW);
    if (wRec) out.push(wRec);

    const refData =
        refrigerantData !== undefined ? refrigerantData : flags?.refrigerantData ?? null;
    const wRef = checkRefrigerantLogic(refData);
    if (wRef) out.push(wRef);

    return out;
}

export default runCrossCategoryConsistencyChecks;
