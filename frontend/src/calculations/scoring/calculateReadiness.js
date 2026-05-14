import { STATUS } from '@/constants/uploadCategoryStatus';

/**
 * Months with operational data present (non-zero), per upload category.
 * Used for coverage status only; does not alter annualization.
 */
export function getFilledMonthsForUploadCategory(categoryId, { rows, waterRows, fuelRows, wasteRows } = {}) {
    switch (categoryId) {
        case 'electricity':
            if (!Array.isArray(rows)) return 0;
            return rows.filter(
                (row) => Number(row.elec) > 0 || Number(row.ren) > 0 || Number(row.diesel) > 0
            ).length;
        case 'water':
            return waterRows?.filter((r) => Number(r.totalWater) > 0 || Number(r.municipal) > 0).length ?? 0;
        case 'fuel':
            return fuelRows?.filter((r) => Number(r.fuelDiesel) > 0 || Number(r.png) > 0).length ?? 0;
        case 'waste':
            return wasteRows?.filter(
                (r) =>
                    Number(r.wet) > 0 ||
                    Number(r.dry) > 0 ||
                    Number(r.biomedical) > 0 ||
                    Number(r.hazardous) > 0
            ).length ?? 0;
        default:
            return 0;
    }
}

/**
 * Derive BRD upload status from months-with-data and parse/validation outcome.
 * @param {number} monthsWithData
 * @param {{ parseFailed?: boolean, unitMismatch?: boolean }} meta
 * @returns {string} One of the `STATUS` string constants from `@/constants/uploadCategoryStatus`.
 */
export function deriveCategoryDataStatus(monthsWithData, { parseFailed = false, unitMismatch = false } = {}) {
    const m = Math.min(12, Math.max(0, Math.floor(Number(monthsWithData)) || 0));
    if (unitMismatch) return STATUS.ERROR;
    if (parseFailed && m === 0) return STATUS.ERROR;
    if (m === 0) return STATUS.MISSING;
    if (m >= 12) return STATUS.COMPLETE;
    if (m >= 3) return STATUS.PARTIAL;
    return STATUS.INSUFFICIENT;
}

/**
 * @param {{ rows?: unknown[], waterRows?: unknown[], fuelRows?: unknown[], wasteRows?: unknown[], uploadStatus?: Record<string, { monthsUploaded?: number, parseFailed?: boolean, source?: string, unitMismatch?: boolean }> }} params
 * @returns {Record<string, { months: number, status: string }>}
 */
export function buildCategoryUploadStatuses({ rows, waterRows, fuelRows, wasteRows, uploadStatus } = {}) {
    const coreIds = ['electricity', 'water', 'fuel', 'waste'];
    const out = {};
    for (const id of coreIds) {
        const months = getFilledMonthsForUploadCategory(id, { rows, waterRows, fuelRows, wasteRows });
        const entry = uploadStatus?.[id];
        const parseFailed = Boolean(entry?.parseFailed || entry?.source === 'error');
        const unitMismatch = Boolean(entry?.unitMismatch);
        out[id] = { months, status: deriveCategoryDataStatus(months, { parseFailed, unitMismatch }) };
    }
    for (const id of ['refrigerants', 'transport', 'governance']) {
        const entry = uploadStatus?.[id];
        const parseFailed = Boolean(entry?.parseFailed || entry?.source === 'error');
        const unitMismatch = Boolean(entry?.unitMismatch);
        const months = Math.min(12, Math.max(0, Math.floor(Number(entry?.monthsUploaded)) || 0));
        out[id] = { months, status: deriveCategoryDataStatus(months, { parseFailed, unitMismatch }) };
    }
    return out;
}

/**
 * Gate: required categories must not be INSUFFICIENT, ERROR, or MISSING.
 * @param {Record<string, { status: string }>} categoryStatusesMap from buildCategoryUploadStatuses
 * @param {{ id: string, optional?: boolean }[]} categoriesConfig
 * @returns {{ ok: boolean, blockers: { id: string, status: string }[] }}
 */
export function canProceedToSummary(categoryStatusesMap, categoriesConfig = []) {
    const blockers = [];
    const bad = new Set([STATUS.INSUFFICIENT, STATUS.ERROR, STATUS.MISSING]);
    for (const cat of categoriesConfig) {
        if (cat.optional) continue;
        const rec = categoryStatusesMap[cat.id];
        if (!rec) continue;
        if (bad.has(rec.status)) blockers.push({ id: cat.id, status: rec.status });
    }
    return { ok: blockers.length === 0, blockers };
}

/**
 * Calculate water score from flags
 * @param {Object} f - flags object
 * @returns {number} score 0–100
 */
export function calculateWaterScore(flags, filledWaterMonths = 0) {
    const trackingScore = (filledWaterMonths / 12) * 20;
    return Math.min(100, Math.round(
        trackingScore +
        (flags.wSplit    ? 15 : 0) +
        (flags.hasSTP    ? 20 : 0) +
        (flags.rainwater ? 10 : 0) +
        (flags.wAudit    ? 10 : 0) +
        (flags.leakage   ? 10 : 0)
    ));
}

/**
 * Calculate waste score from flags
 * @param {Object} f - flags object
 * @returns {number} score 0–100
 */
export function calculateWasteScore(flags, filledWasteMonths = 0) {
    const trackingScore = (filledWasteMonths / 12) * 15;
    return Math.min(100, Math.round(
        trackingScore +
        (flags.wSegregate >= 95 ? 25 : flags.wSegregate >= 50 ? 12.5 : 0) +
        (flags.recyclingPct >= 60 ? 20 : flags.recyclingPct >= 30 ? 10 : 0) +
        (flags.authVendor  ? 20 : 0) +
        (flags.hazHandling ? 10 : 0) +
        (flags.wasteAudit  ? 10 : 0)
    ));
}

/**
 * Calculate governance score from flags
 * @param {Object} f - flags object
 * @returns {number} score 0–100
 */
export function calculateGovernanceScore(f) {
    return Math.min(100,
        (f.policy ? 25 : 0) +
        (f.esgOwner ? 20 : 0) +
        (f.monthlyRev ? 15 : 0) +
        (f.sops ? 15 : 0) +
        (f.audits ? 15 : 0) +
        (f.compliance ? 10 : 0)
    );
}

/**
 * Calculate readiness level label
 * @param {number} overall - overall score
 * @returns {string}
 */
export function calculateReadiness(overall) {
    if (overall >= 80) return 'Advanced';
    if (overall >= 65) return 'Structured';
    if (overall >= 50) return 'Developing';
    return 'Foundational';
}

export default calculateReadiness;
