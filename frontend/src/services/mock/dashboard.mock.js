import { MONTHS } from './assessment.mock';

/**
 * Generate trend data for dashboard charts
 */
export function getDashboardTrendData(currentScore) {
    const trendBase = [52, 55, 58, 60, 63, 65, 67, 68, 70, 71, 72, currentScore];
    return MONTHS.map((m, i) => ({ month: m, score: trendBase[i] }));
}

/**
 * Upload category statuses for summary view
 */
export const UPLOAD_CATEGORIES = [
    { cat: 'Electricity', icon: '⚡', months: '12/12', conf: 'Medium', status: 'Partial' },
    { cat: 'Water', icon: '💧', months: '12/12', conf: 'High', status: 'Complete' },
    { cat: 'Fuel', icon: '⛽', months: '12/12', conf: 'High', status: 'Complete' },
    { cat: 'Waste', icon: '♻️', months: '12/12', conf: 'High', status: 'Complete' },
    { cat: 'Refrigerants', icon: '❄️', months: '8/12', conf: 'Medium', status: 'Partial' },
    { cat: 'Transport', icon: '🚛', months: '6/12', conf: 'Medium', status: 'Partial' },
    { cat: 'Governance', icon: '🛡️', months: '—', conf: 'High', status: 'Complete' },
];
