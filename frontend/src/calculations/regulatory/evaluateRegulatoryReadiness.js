import { REGULATORY_FRAMEWORKS } from '@/constants/regulatoryFrameworks';

export function evaluateRegulatoryReadiness(sector, country, scores, assessmentData = {}) {
    const safeCountry = country || 'IN';
    const safeSector = sector || 'GEN';
    
    return REGULATORY_FRAMEWORKS.map((fw) => {
        const matchesCountry = fw.country === 'GLOBAL' || fw.country === safeCountry;
        const matchesSector = fw.applicableSectors.includes('ALL') || fw.applicableSectors.includes(safeSector);
        const applicable = matchesCountry && matchesSector;

        if (!applicable) {
            return {
                regulationId: fw.id,
                name: fw.name,
                country: fw.country,
                score: 0,
                riskLevel: 'N/A',
                notes: 'Not applicable for this sector/country.',
                applicable: false
            };
        }

        const { fields, thresholds, weights } = fw.scoringCriteria;
        
        let totalScore = 0;
        let totalWeight = 0;

        fields.forEach((field) => {
            const val = Number(scores[field]) || 0;
            const w = weights[field] || 1;
            totalWeight += w;
            totalScore += val * w;
        });

        const complianceScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
        
        let riskLevel = 'Low';
        if (complianceScore < 50) riskLevel = 'High';
        else if (complianceScore < 75) riskLevel = 'Medium';

        const notes = fw.riskRules[riskLevel.toLowerCase()] || '';

        return {
            regulationId: fw.id,
            name: fw.name,
            country: fw.country,
            score: complianceScore,
            riskLevel,
            notes,
            applicable: true
        };
    });
}

export default evaluateRegulatoryReadiness;
