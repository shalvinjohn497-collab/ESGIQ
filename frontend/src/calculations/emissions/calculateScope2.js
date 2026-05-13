import { EMISSION_FACTORS } from '@/constants/emissionFactors';

/**
 * Calculate Scope 2 emissions (grid electricity)
 * @param {number} totalElectricity - total electricity in kWh
 * @returns {number} tCO₂e
 */
export function calculateScope2(totalElectricity) {
    return +(totalElectricity * EMISSION_FACTORS.GRID_ELECTRICITY_INDIA / 1000).toFixed(2);
}

export default calculateScope2;
