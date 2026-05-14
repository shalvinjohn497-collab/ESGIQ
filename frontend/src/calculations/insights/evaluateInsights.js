import { STRENGTH_RULES } from '@/calculations/insights/strengthRules';
import { GAP_RULES } from '@/calculations/insights/gapRules';

/**
 * @typedef {{ id: string, label: string, insight: string, priority: number }} Strength
 * @typedef {{ id: string, label: string, gap: string, severity: 'High'|'Medium'|'Low', priority: number }} Gap
 */

/** BRD §12 benchmark defaults (aligned with dashboard summary bands where applicable). */
export const DEFAULT_BENCHMARKS = {
    energyIntensityIdealMax: 15,
    energyIntensityBandHigh: 22,
    renewableShareTarget: 10,
    renewableShareStretch: 25,
    renewableNegligibleMax: 5,
    recyclingTargetPct: 60,
    recyclingWeakPct: 40,
    waterIntensityBandHigh: 0.35,
    governanceStrong: 75,
    governanceWeak: 55,
    categoryScoreStrong: 75,
    categoryScoreWeak: 55,
    overallCertThreshold: 75,
    overallCritical: 50,
    dataCoverageFull: 12,
    dataCoverageWeak: 6,
    monthTrackingWeak: 4,
    scope2ComfortMaxShare: 0.78,
    scope1LowShareMax: 0.35,
    scope1DominantMinShare: 0.4,
    scope3PressureMinShare: 0.5,
    certEligibleCountStrong: 2,
    certReadinessAdvanced: 90,
    certBlockedClusterCount: 3,
};

const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 };

/**
 * Merge caller `categoryData` with derived scope shares for rule conditions.
 * @param {object} scores
 * @param {object} categoryData
 */
function enrichCategoryData(scores, categoryData) {
    const totalEm = Number(scores.totalEm) || 0;
    let scope1Share = null;
    let scope2Share = null;
    let scope3Share = null;
    if (totalEm > 0) {
        scope1Share = (Number(scores.scope1) || 0) / totalEm;
        scope2Share = (Number(scores.scope2) || 0) / totalEm;
        scope3Share = (Number(scores.scope3) || 0) / totalEm;
    }
    return {
        ...categoryData,
        scope1Share,
        scope2Share,
        scope3Share,
    };
}

/**
 * BRD §12 — evaluate strength + gap rules, dedupe by `id`, sort for display.
 * @param {{ scores?: object, benchmarks?: object, categoryData?: object }} params
 * @returns {{ strengths: Strength[], gaps: Gap[] }}
 */
export function evaluateInsights({
    scores = {},
    benchmarks = DEFAULT_BENCHMARKS,
    categoryData = {},
} = {}) {
    const b = { ...DEFAULT_BENCHMARKS, ...benchmarks };
    const d = enrichCategoryData(scores, categoryData);

    /** @type {Map<string, Strength>} */
    const strengthById = new Map();
    for (const rule of STRENGTH_RULES) {
        try {
            if (rule.condition(scores, b, d)) {
                strengthById.set(rule.id, {
                    id: rule.id,
                    label: rule.label,
                    insight: rule.insight,
                    priority: rule.priority,
                });
            }
        } catch {
            /* ignore rule runtime errors */
        }
    }

    /** @type {Strength[]} */
    const strengths = Array.from(strengthById.values()).sort((a, b) => b.priority - a.priority);

    /** @type {Map<string, Gap>} */
    const gapById = new Map();
    for (const rule of GAP_RULES) {
        try {
            if (rule.condition(scores, b, d)) {
                gapById.set(rule.id, {
                    id: rule.id,
                    label: rule.label,
                    gap: rule.gap,
                    severity: rule.severity,
                    priority: rule.priority,
                });
            }
        } catch {
            /* ignore */
        }
    }

    /** @type {Gap[]} */
    const gaps = Array.from(gapById.values()).sort((a, b) => {
        const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        if (sev !== 0) return sev;
        return b.priority - a.priority;
    });

    return { strengths, gaps };
}

export default evaluateInsights;
