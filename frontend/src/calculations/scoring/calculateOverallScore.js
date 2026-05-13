import { SCORING_WEIGHTS } from '@/constants/scoring';

/**
 * Calculate overall ESG score from individual category scores
 * @param {Object} scores - { energy, water, waste, governance }
 * @returns {number} overall score 0–100
 */
export function calculateOverallScore({ energy, water, waste, governance }) {
    return Math.round(
        energy * SCORING_WEIGHTS.energy +
        water * SCORING_WEIGHTS.water +
        waste * SCORING_WEIGHTS.waste +
        governance * SCORING_WEIGHTS.governance
    );
}

export default calculateOverallScore;
