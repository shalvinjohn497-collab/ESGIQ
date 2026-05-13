/**
 * Calculate energy score based on data completeness, renewable share, intensity, and features
 * @param {Object} params
 * @param {number} params.filledMonths - number of months with electricity > 0
 * @param {number} params.renewablePercent - renewable energy percentage
 * @param {number} params.intensity - energy intensity in kWh/sqft
 * @param {Object} params.flags - feature flags (hasLED, hasBMS, submetering)
 * @returns {number} energy score 0–100
 */
export function calculateEnergyScore({ filledMonths, renewablePercent, intensity, flags }) {
    let score = Math.min(40, (filledMonths / 12) * 40);
    score += renewablePercent > 0 ? 15 : 0;
    score += intensity < 20 ? 20 : intensity < 30 ? 12 : intensity < 40 ? 6 : 0;
    score += flags.hasLED ? 10 : 0;
    score += flags.hasBMS ? 10 : 0;
    score += flags.submetering ? 5 : 0;
    return Math.min(100, Math.round(score));
}

export default calculateEnergyScore;
