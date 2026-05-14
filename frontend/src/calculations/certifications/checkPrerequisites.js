import { CERTIFICATION_PREREQUISITES } from '@/constants/certificationPrerequisites';

export function checkPrerequisites(framework, scores, assessmentData = {}) {
    // Fallback for legacy calls (e.g. checkPrerequisites(certId, flags, filledMonths, totalElec, totalDiesel, operationalMetrics))
    if (typeof framework === 'string') {
        const certId = framework;
        const flags = scores || {};
        const filledMonths = assessmentData || 0;
        
        // Very basic fallback
        const passed = filledMonths >= 6;
        return { passed, missing: passed ? [] : ['Minimum 6 months data required'] };
    }

    const failedChecks = [];
    const minMonths = framework.minEvidenceMonths ?? 6;
    const filledMonths = Number(assessmentData.filledMonths) || 0;

    if (filledMonths < minMonths) {
        failedChecks.push(`At least ${minMonths} months of operational data required`);
    }

    // Example per-framework checks
    const fwId = framework.id || '';
    if (fwId.includes('IGBC')) {
        if ((scores.governance || 0) < 50) {
            failedChecks.push('Minimum 50% Governance score required');
        }
    } else if (fwId.includes('LEED')) {
        if ((scores.emissions || 0) < 40) {
            failedChecks.push('Scope 2 calculation present required');
        }
    } else if (fwId.includes('ISO_50001')) {
        if ((scores.energy || 0) < 60) {
            failedChecks.push('Minimum 60% Energy score required');
        }
    } else if (fwId.includes('ISO_14001')) {
        if ((scores.governance || 0) < 40) {
            failedChecks.push('Minimum Governance score required');
        }
    }

    return {
        met: failedChecks.length === 0,
        failedChecks,
    };
}

export default checkPrerequisites;
