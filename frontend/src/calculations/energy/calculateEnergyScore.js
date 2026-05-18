import { getConfidenceModifier } from '@/constants/confidenceModifiers';

export function calculateEnergyScore({ filledMonths, renewablePercent, intensity, flags, sector }) {
    const benchmarks = {
        HOSP: 22, BLDG: 18, EDUC: 14, FOOD: 28, LOGI: 12, NGO: 15, GEN: 15, MFGR: 15, TEXT: 15, ELEC: 15,
    };
    const benchmarkMax = benchmarks[sector] || 15;

    // Confidence modifier applied only to electricity-dependent params
    const modifier = getConfidenceModifier(filledMonths) ?? 0;

    const trackingScore  = ((filledMonths / 12) * 20) * modifier;
    const intensityScore = (intensity <= benchmarkMax ? 20 : intensity <= benchmarkMax * 1.1 ? 10 : 0) * modifier;

    // These use questionnaire/other data — no electricity modifier
    const ledScore  = flags.ledPct >= 60 ? 15 : flags.ledPct >= 40 ? 7.5 : 0;
    const hvacScore = flags.hvacEfficient === 'modern' ? 15 : flags.hvacEfficient === 'moderate' ? 7.5 : 0;
    const bmsScore  = flags.hasBMS ? 15 : 0;
    const renScore  = Math.min(10, (renewablePercent / 20) * 10);
    const pfScore   = flags.powerFactor >= 0.85 ? 5 : flags.powerFactor >= 0.80 ? 2.5 : 0;

    return Math.min(100, +(trackingScore + intensityScore + ledScore + hvacScore + bmsScore + renScore + pfScore).toFixed(2));
}

export default calculateEnergyScore;