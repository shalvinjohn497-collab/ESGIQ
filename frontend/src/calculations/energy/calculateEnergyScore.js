/**
 * Calculate energy score based on data completeness, efficiency, and features
 * Uses sector-specific benchmarks for intensity comparison
 * @param {Object} params
 * @param {number} params.filledMonths - number of months with electricity > 0
 * @param {number} params.renewablePercent - renewable energy percentage
 * @param {number} params.intensity - energy intensity in kWh/sqft
 * @param {Object} params.flags - feature flags (ledPct, hvacEfficient, hasBMS, powerFactor)
 * @param {string} params.sector - sector code (HOSP, BLDG, EDUC, etc.)
 * @returns {number} energy score 0–100
 */
export function calculateEnergyScore({ filledMonths, renewablePercent, intensity, flags, sector }) {
    const benchmarks = {
        HOSP: 22, BLDG: 18, EDUC: 14, FOOD: 28, LOGI: 12, NGO: 15, GEN: 15, MFGR: 15, TEXT: 15, ELEC: 15,
    };
    const benchmarkMax = benchmarks[sector] || 15;

    const trackingScore  = (filledMonths / 12) * 20;
    const intensityScore = intensity <= benchmarkMax ? 20 : 0;
    const ledScore       = flags.ledPct >= 60 ? 15 : flags.ledPct >= 40 ? 7.5 : 0;
    const hvacScore      = flags.hvacEfficient === 'modern' ? 15 : flags.hvacEfficient === 'moderate' ? 7.5 : 0;
    const bmsScore       = flags.hasBMS ? 15 : 0;
    const renScore       = Math.min(10, (renewablePercent / 20) * 10);
    const pfScore        = flags.powerFactor >= 0.85 ? 5 : flags.powerFactor >= 0.80 ? 2.5 : 0;

    return Math.min(100, Math.round(trackingScore + intensityScore + ledScore + hvacScore + bmsScore + renScore + pfScore));
}

export default calculateEnergyScore;
