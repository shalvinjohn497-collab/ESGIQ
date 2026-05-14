/**
 * BRD §7 Step 4 — month-on-month spike / drop detection.
 * @typedef {{ month: string, previousMonth: string, changePercent: number, direction: 'spike'|'drop' }} SpikeWarning
 */

/**
 * @param {{ month: string, value: number }[]} monthlyValues — chronological order (e.g. Jan→Dec)
 * @returns {SpikeWarning[]}
 */
export function detectSpikes(monthlyValues) {
    const warnings = [];
    if (!Array.isArray(monthlyValues) || monthlyValues.length < 2) return warnings;

    for (let i = 1; i < monthlyValues.length; i++) {
        const cur = monthlyValues[i];
        const prev = monthlyValues[i - 1];
        const v0 = Number(prev?.value);
        const v1 = Number(cur?.value);
        if (!Number.isFinite(v0) || !Number.isFinite(v1)) continue;
        if (v0 === 0) continue;

        const changePercent = ((v1 - v0) / v0) * 100;

        if (changePercent > 100) {
            warnings.push({
                month: String(cur.month ?? ''),
                previousMonth: String(prev.month ?? ''),
                changePercent: Math.round(changePercent * 10) / 10,
                direction: 'spike',
            });
        } else if (changePercent < -70) {
            warnings.push({
                month: String(cur.month ?? ''),
                previousMonth: String(prev.month ?? ''),
                changePercent: Math.round(changePercent * 10) / 10,
                direction: 'drop',
            });
        }
    }
    return warnings;
}

/** Total energy activity proxy (kWh + renewable + diesel litres) for spike detection */
export function toMonthlyElectricityValues(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => ({
        month: r.month,
        value:
            (Number(r.elec) || 0) +
            (Number(r.ren) || 0) +
            (Number(r.diesel) || 0),
    }));
}

export function toMonthlyWaterValues(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => ({
        month: r.month,
        value: Number(r.totalWater) || 0,
    }));
}

export function toMonthlyFuelValues(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => ({
        month: r.month,
        value: (Number(r.fuelDiesel) || 0) + (Number(r.png) || 0),
    }));
}

export function toMonthlyWasteValues(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => ({
        month: r.month,
        value: Number(r.totalWaste) || 0,
    }));
}

export default detectSpikes;
