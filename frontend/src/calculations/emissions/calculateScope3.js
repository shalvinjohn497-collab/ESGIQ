import { EMISSION_FACTORS } from '@/constants/emissionFactors';

/**
 * Calculate Scope 3 emissions (waste to landfill + water treatment)
 * Per BRD Section 9.5
 * @param {number} wasteToLandfillKg - annual waste to landfill (wet + dry) in kg
 * @param {number} waterTreatedKl - annual water treated in KL
 * @returns {number} tCO₂e
 */
export function calculateScope3(wasteToLandfillKg = 0, waterTreatedKl = 0) {
    const scope3Waste = (wasteToLandfillKg * EMISSION_FACTORS.WASTE_TO_LANDFILL) / 1000;
    const scope3Water = (waterTreatedKl * 0.71) / 1000;  // 0.71 kgCO₂e/KL per BRD
    return +(scope3Waste + scope3Water).toFixed(2);
}

export default calculateScope3;
