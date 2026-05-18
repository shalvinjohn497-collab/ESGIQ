/**
 * Calculate renewable energy share as a percentage
 * @param {number} totalRenewable - total renewable energy in kWh
 * @param {number} totalElectricity - total electricity in kWh
 * @returns {number} percentage 0–100
 */
export function calculateRenewableShare(totalRenewable, totalElectricity) {
    if (totalElectricity <= 0) return 0;
    const result = Math.round((totalRenewable / totalElectricity) * 100);
    return Math.min(result, 100);
}

export default calculateRenewableShare;
