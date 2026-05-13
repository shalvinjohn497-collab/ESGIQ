/**
 * Calculate total emissions (sum of all scopes)
 * @param {number} scope1
 * @param {number} scope2
 * @param {number} scope3
 * @returns {number} tCO₂e
 */
export function calculateTotalEmissions(scope1, scope2, scope3) {
    return +(scope1 + scope2 + scope3).toFixed(2);
}

export default calculateTotalEmissions;
