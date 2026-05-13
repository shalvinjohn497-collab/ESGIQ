/**
 * Calculate energy intensity (kWh per square foot)
 * @param {number} totalElectricity - total electricity in kWh
 * @param {number} area - built-up area in sqft
 * @returns {number} intensity value
 */
export function calculateIntensity(totalElectricity, area) {
    const effectiveArea = area > 0 ? area : 10000;
    return +(totalElectricity / effectiveArea).toFixed(2);
}

export default calculateIntensity;
