/**
 * Determine certification level based on overall ESG score
 * @param {number} overall - overall score 0–100
 * @returns {{ level: string, color: string, ringColor: string }}
 */
export function determineCertificationLevel(overall) {
    if (overall >= 75) {
        return { level: 'Platinum', color: '#e2e8f0', ringColor: '#e2e8f0' };
    }
    if (overall >= 60) {
        return { level: 'Gold', color: '#fbbf24', ringColor: '#fbbf24' };
    }
    if (overall >= 45) {
        return { level: 'Silver', color: '#94a3b8', ringColor: '#34d399' };
    }
    return { level: 'Bronze', color: '#d97706', ringColor: '#fb923c' };
}

export default determineCertificationLevel;
