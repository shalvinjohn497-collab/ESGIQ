import { SCORING_WEIGHTS } from '@/constants/scoring';

/**
 * Weighted overall ESG score (0–100) from pillar scores only.
 *
 * BRD §12 strength/gap insights are evaluated separately in `evaluateInsights` once extended
 * `scores`, benchmarks, and `categoryData` exist — see `useAssessmentResults` (orchestrator).
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
