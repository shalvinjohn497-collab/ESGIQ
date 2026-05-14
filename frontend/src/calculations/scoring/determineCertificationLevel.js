import { CERTIFICATION_THRESHOLDS, CERTIFICATION_COLORS } from '@/constants/scoring';
import { checkPrerequisites } from '../certifications/checkPrerequisites';

/**
 * @typedef {{ energy?: number, water?: number, waste?: number, governance?: number, emissions?: number }} CategoryScores
 * @typedef {import('@/constants/certificationFrameworks').CertificationFramework} CertificationFramework
 * @typedef {{ filledMonths?: number, minEvidenceMonths?: number }} CertificationLevelContext
 * @typedef {{ frameworkId: string, score: number, tier: string, prerequisitesMet: boolean, timeline: string }} FrameworkCertificationResult
 */

/**
 * Weighted composite score (0–100) from pillar scores using the framework vector (BRD §13.3).
 * @param {CategoryScores} categoryScores
 * @param {CertificationFramework} framework
 */
export function weightedCertificationScore(categoryScores, framework) {
    const w = framework?.categoryWeights;
    if (!w || typeof w !== 'object') return NaN;
    let sum = 0;
    for (const [key, wt] of Object.entries(w)) {
        sum += (Number(categoryScores[key]) || 0) * Number(wt);
    }
    return Math.round(sum * 100) / 100;
}

function tierFromScore(score) {
    const s = Number(score) || 0;
    if (s >= CERTIFICATION_THRESHOLDS.Platinum) return 'Platinum';
    if (s >= CERTIFICATION_THRESHOLDS.Gold) return 'Gold';
    if (s >= CERTIFICATION_THRESHOLDS.Silver) return 'Silver';
    return 'Bronze';
}

export function assignTimeline(score, tier, prerequisitesMet) {
    if (score >= 90 && prerequisitesMet) return '<3 months';
    if (score >= 75) return '3–6 months';
    if (score >= 60) return '6–12 months';
    return '12+ months';
}

/**
 * Map tier label to legacy UI tokens (ring/badge colours).
 * @param {string} tier
 */
export function mapTierToLegacyDisplay(tier) {
    const level = tier;
    const color = CERTIFICATION_COLORS[tier] || CERTIFICATION_COLORS.Bronze;
    const ringColor = tier === 'Silver' ? '#34d399' : color;
    return { level, color, ringColor };
}

/**
 * BRD §13 — per-framework certification level using that framework’s category weights.
 * @param {CategoryScores} categoryScores — pillar scores 0–100 (incl. `emissions` proxy)
 * @param {CertificationFramework} framework
 * @param {CertificationLevelContext} [context]
 * @returns {FrameworkCertificationResult}
 */
export function determineCertificationLevel(categoryScores, framework, context = {}) {
    const score = weightedCertificationScore(categoryScores, framework);
    let safeScore = Number.isFinite(score) ? score : 0;
    
    const prereqs = checkPrerequisites(framework, categoryScores, context);
    
    if (!prereqs.met && safeScore > 74) {
        safeScore = 74;
    }

    const tier = tierFromScore(safeScore);
    const timeline = assignTimeline(safeScore, tier, prereqs.met);

    return {
        frameworkId: framework.id,
        score: safeScore,
        tier,
        prerequisitesMet: prereqs.met,
        failedChecks: prereqs.failedChecks,
        timeline,
    };
}

/**
 * Fallback when only the legacy overall index is available (equal pillar weights not applied).
 * @param {number} overall
 */
export function certificationTierFromOverall(overall) {
    const tier = tierFromScore(overall);
    return { score: Number(overall) || 0, ...mapTierToLegacyDisplay(tier) };
}

export default determineCertificationLevel;
