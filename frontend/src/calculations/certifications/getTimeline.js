export function getTimeline(score) {
    if (score >= 90) return '< 3 months';
    if (score >= 75) return '3–6 months';
    if (score >= 60) return '6–12 months';
    if (score >= 40) return '12–18 months';
    return '18+ months';
}

export default getTimeline;
