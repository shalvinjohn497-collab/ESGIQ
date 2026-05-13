import { EMISSION_FACTORS } from '@/constants/emissionFactors';

/**
 * Calculate Scope 1 emissions (diesel combustion)
 * @param {number} totalDiesel - total diesel in litres
 * @returns {number} tCO₂e
 */
export function calculateScope1(totalDiesel) {
    return +(totalDiesel * EMISSION_FACTORS.DIESEL / 1000).toFixed(2);
}

export default calculateScope1;
