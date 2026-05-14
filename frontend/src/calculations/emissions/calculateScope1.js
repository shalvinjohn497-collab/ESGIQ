export function calculateScope1(totalDieselLitres = 0, totalPngKg = 0) {
    const dieselEmissions = (totalDieselLitres * 2.68) / 1000;
    const gasEmissions    = (totalPngKg * 2.04) / 1000;
    return +(dieselEmissions + gasEmissions).toFixed(2);
}

export default calculateScope1;
