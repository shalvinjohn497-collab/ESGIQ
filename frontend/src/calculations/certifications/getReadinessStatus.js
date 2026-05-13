export function getReadinessStatus(score) {
    if (score >= 90) return { status: 'Advanced Readiness', color: '#16a34a' };
    if (score >= 75) return { status: 'Strong Readiness', color: '#22c55e' };
    if (score >= 60) return { status: 'Certification Possible', color: '#f59e0b' };
    if (score >= 40) return { status: 'Foundational', color: '#f97316' };
    return { status: 'Not Ready', color: '#ef4444' };
}

export default getReadinessStatus;
