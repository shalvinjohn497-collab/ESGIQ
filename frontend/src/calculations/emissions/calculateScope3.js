/**
 * Calculate Scope 3 emissions (estimated indirect, 12% of Scope 2)
 * @param {number} scope2 - Scope 2 emissions in tCO₂e
 * @returns {number} tCO₂e
 */
export function calculateScope3(scope2) {
    return +(scope2 * 0.12).toFixed(2);
}

export default calculateScope3;
