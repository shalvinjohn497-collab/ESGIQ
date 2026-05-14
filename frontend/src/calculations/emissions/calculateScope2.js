export function calculateScope2(totalElec = 0, totalRen = 0) {
    const netElec = Math.max(0, totalElec - totalRen);
    return +((netElec * 0.72) / 1000).toFixed(2);
}

export default calculateScope2;
