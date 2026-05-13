/**
 * Calculate water score from flags
 * @param {Object} f - flags object
 * @returns {number} score 0–100
 */
export function calculateWaterScore(f) {
    return Math.min(100,
        (f.wTrack ? 25 : 0) +
        (f.wSplit ? 15 : 0) +
        (f.hasSTP ? 20 : 0) +
        (f.rainwater ? 15 : 0) +
        (f.wAudit ? 15 : 0) +
        (f.leakage ? 10 : 0)
    );
}

/**
 * Calculate waste score from flags
 * @param {Object} f - flags object
 * @returns {number} score 0–100
 */
export function calculateWasteScore(f) {
    return Math.min(100,
        (f.wtTrack ? 20 : 0) +
        (f.segregation ? 30 : 0) +
        (f.authVendor ? 25 : 0) +
        (f.recycling ? 15 : 0) +
        (f.wtAudit ? 10 : 0)
    );
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
