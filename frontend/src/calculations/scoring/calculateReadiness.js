import { STATUS } from '@/constants/uploadCategoryStatus';

const toPositiveNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
};

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

export function deriveCategoryDataStatus(monthsWithData, { parseFailed = false, unitMismatch = false } = {}) {
    const m = Math.min(12, Math.max(0, Math.floor(Number(monthsWithData)) || 0));
    if (unitMismatch) return STATUS.ERROR;
    if (parseFailed && m === 0) return STATUS.ERROR;
    if (m === 0) return STATUS.MISSING;
    if (m >= 12) return STATUS.COMPLETE;
    if (m >= 3) return STATUS.PARTIAL;
    return STATUS.INSUFFICIENT;
}

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
 * calculateWaterScore
 * BRD §10.2.2 — Total: 100 points
 *
 * FIX 2a: Water reuse = 20pts (reuse > 15% = 20, reuse 5–15% = 10, < 5% = 0)
 *          was incorrectly mapped to hasSTP (which is STP/ETP = 15pts)
 * FIX 2b: STP/ETP = 15pts (was 20pts — wrong weight)
 * FIX 2c: wQuality replaces wAudit (BRD param is water quality testing, 10pts)
 * FIX 2d: Math.round → toFixed(2) for precision
 */
export function calculateWaterScore(flags, filledWaterMonths = 0) {
    // Tracking: (months ÷ 12) × 20 — confidence modifier applied internally per BRD §10.2.2
    const trackingScore = (filledWaterMonths / 12) * 20;

    // Water reuse: 20pts — BRD §10.2.2
    const reuseScore = flags.waterReusePct >= 15
        ? 20
        : flags.waterReusePct >= 5
            ? 10
            : (flags.hasSTP || flags.waterReuse)  // fallback: if flag present but no % value
                ? 10
                : 0;

    // Source-wise split documented: 15pts
    const splitScore = flags.wSplit ? 15 : 0;

    // STP / ETP available and operational: 15pts (was incorrectly 20)
    const stpScore = flags.hasSTP ? 15 : 0;

    // Leakage monitoring: 10pts
    const leakageScore = flags.leakage ? 10 : 0;

    // Rainwater harvesting: 10pts
    const rainwaterScore = flags.rainwater ? 10 : 0;

    // Water quality testing: 10pts (replaces wAudit — BRD §10.2.2)
    const qualityScore = flags.wQuality ? 10 : (flags.wAudit ? 5 : 0);

    return parseFloat(
        Math.min(100,
            trackingScore +
            reuseScore +
            splitScore +
            stpScore +
            leakageScore +
            rainwaterScore +
            qualityScore
        ).toFixed(2)
    );
}

/**
 * calculateWasteScore
 * BRD §10.2.3 — Total: 100 points
 * No structural changes needed — just Math.round → toFixed(2)
 */
export function calculateWasteScore(flags, filledWasteMonths = 0) {
    const trackingScore = (filledWasteMonths / 12) * 15;

    return parseFloat(
        Math.min(100,
            trackingScore +
            (flags.wSegregate >= 95 ? 25 : flags.wSegregate >= 50 ? 12.5 : 0) +
            (flags.recyclingPct >= 60 ? 20 : flags.recyclingPct >= 30 ? 10 : 0) +
            (flags.authVendor  ? 20 : 0) +
            (flags.hazHandling ? 10 : 0) +
            (flags.wasteAudit  ? 10 : 0)
        ).toFixed(2)
    );
}

/**
 * calculateGovernanceScore
 * BRD §10.2.4 — Total: 100 points
 *
 * FIX 3a: policy 25pts → 20pts (BRD §10.2.4)
 * FIX 3b: training 5pts added (was missing entirely)
 * Weights: policy=20, esgOwner=20, monthlyRev=15, sops=15, audits=15, compliance=10, training=5
 */
export function calculateGovernanceScore(f) {
    return Math.min(100,
        (f.policy      ? 20 : 0) +   // FIX 3a: was 25
        (f.esgOwner    ? 20 : 0) +
        (f.monthlyRev  ? 15 : 0) +
        (f.sops        ? 15 : 0) +
        (f.audits      ? 15 : 0) +
        (f.compliance  ? 10 : 0) +
        (f.training    ?  5 : 0)      // FIX 3b: was missing
    );
}

/**
 * calculateReadiness
 * BRD §10.5 — Stage label thresholds
 *
 * FIX 1: All thresholds and labels corrected to match BRD exactly
 * Old: 80→Advanced, 65→Structured, 50→Developing, else→Foundational
 * New: 90→Advanced Readiness, 75→Strong Readiness, 60→Certification Possible,
 *      40→Foundational, else→Not Ready
 */
export function calculateReadiness(overall) {
    if (overall >= 90) return 'Advanced Readiness';
    if (overall >= 75) return 'Strong Readiness';
    if (overall >= 60) return 'Certification Possible';
    if (overall >= 40) return 'Foundational';
    return 'Not Ready';
}

export default calculateReadiness;