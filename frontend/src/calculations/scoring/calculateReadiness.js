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
