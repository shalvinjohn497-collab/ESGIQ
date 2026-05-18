import { SCORING_WEIGHTS } from '@/constants/scoring';

export function calculateOverallScore({ energy, water, waste, governance }) {
    return parseFloat(
        (
            energy * SCORING_WEIGHTS.energy +
            water * SCORING_WEIGHTS.water +
            waste * SCORING_WEIGHTS.waste +
            governance * SCORING_WEIGHTS.governance
        ).toFixed(2)
    );
}

export default calculateOverallScore;