import { CERTIFICATION_WEIGHTS } from '@/constants/certificationWeights';

export function calculateCertScore(certId, categoryScores) {
    const weights = CERTIFICATION_WEIGHTS[certId];
    if (!weights) return 0;

    const {
        energy     = 0,
        water      = 0,
        waste      = 0,
        indoorEnv  = 0,  // Phase 3 — 0 until IAQ questionnaire built
        governance = 0,
        evidence   = 0,  // 0 until EMS/documentation scoring built
    } = categoryScores;

    const score =
        energy     * weights.energy +
        water      * weights.water +
        waste      * weights.waste +
        indoorEnv  * weights.indoorEnv +
        governance * weights.governance +
        evidence   * weights.evidence;

    return Math.min(100, Math.max(0, +score.toFixed(2)));
}

export default calculateCertScore;