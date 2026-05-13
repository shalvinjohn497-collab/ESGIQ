import { CERTIFICATION_WEIGHTS } from '@/constants/certificationWeights';

export function calculateCertScore(certId, categoryScores) {
    const weights = CERTIFICATION_WEIGHTS;
    if (!weights[certId]) return 0;

    const { energy, water, waste, governance } = categoryScores;

    // Proxy scores for dimensions not yet collected
    // TODO: Replace with dedicated IAQ score when indoor environment
    //       monitoring data is collected (Phase 3)
    const indoorEnv = governance;
    const evidence = Math.round((energy + governance) / 2);

    const w = weights[certId];
    const score =
        energy * w.energy +
        water * w.water +
        waste * w.waste +
        indoorEnv * w.indoorEnv +
        governance * w.governance +
        evidence * w.evidence;

    return Math.min(100, Math.max(0, Math.round(score)));
}

export default calculateCertScore;
