import { SECTOR_CERTIFICATIONS } from '@/constants/sectorCertifications';
import { CERTIFICATION_META } from '@/constants/certificationMeta';
import { calculateCertScore } from './calculateCertScore';
import { checkPrerequisites } from './checkPrerequisites';
import { applyPrerequisiteCap } from './applyPrerequisiteCap';
import { getReadinessStatus } from './getReadinessStatus';
import { getTimeline } from './getTimeline';

export function calculateAllCertifications(
    sector,
    categoryScores,
    flags,
    filledMonths,
    totalElec,
    totalDiesel,
    operationalMetrics = {},
) {
    const sectorCerts = SECTOR_CERTIFICATIONS[sector] || SECTOR_CERTIFICATIONS.GEN;
    const allCertIds = [...sectorCerts.primary, ...sectorCerts.secondary];

    const results = allCertIds.map((certId) => {
        const meta = CERTIFICATION_META[certId] || { name: certId };
        const rawScore = calculateCertScore(certId, categoryScores);
        const prereqResult = checkPrerequisites(
    certId,
    flags,
    filledMonths,
    totalElec,
    totalDiesel,
    operationalMetrics,
);
        const finalScore = applyPrerequisiteCap(rawScore, prereqResult);
        const { status, color } = getReadinessStatus(finalScore);
        const timeline = getTimeline(finalScore);
        const majorGap = prereqResult.missing[0] || null;

        return {
            id: certId,
            name: meta.name,
            category: meta.category,
            score: finalScore,
            rawScore,
            status,
            color,
            timeline,
            isPrimary: sectorCerts.primary.includes(certId),
            prerequisitesPassed: prereqResult.passed,
            missingPrerequisites: prereqResult.missing,
            majorGap,
        };
    });

    return {
        all: results,
        eligible: results.filter((c) => c.score >= 60),
        blocked: results.filter((c) => c.score < 40),
    };
}

export default calculateAllCertifications;
