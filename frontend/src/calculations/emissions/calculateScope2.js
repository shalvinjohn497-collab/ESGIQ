export function calculateScope2(annualizedElec, annualizedRen = 0) {
    if (!annualizedElec) return 0;
    const netElec = Math.max(0, annualizedElec - annualizedRen);
    return +((netElec * 0.72) / 1000).toFixed(2);
}

export default calculateScope2;
