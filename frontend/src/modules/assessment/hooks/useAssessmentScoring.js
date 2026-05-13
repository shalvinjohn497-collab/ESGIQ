import { useMemo } from 'react';
import { calculateEnergyScore } from '@/calculations/energy/calculateEnergyScore';
import { calculateIntensity } from '@/calculations/energy/calculateIntensity';
import { calculateRenewableShare } from '@/calculations/energy/calculateRenewableShare';
import { calculateScope1 } from '@/calculations/emissions/calculateScope1';
import { calculateScope2 } from '@/calculations/emissions/calculateScope2';
import { calculateScope3 } from '@/calculations/emissions/calculateScope3';
import { calculateTotalEmissions } from '@/calculations/emissions/calculateTotalEmissions';
import { calculateOverallScore } from '@/calculations/scoring/calculateOverallScore';
import { calculateWaterScore, calculateWasteScore, calculateGovernanceScore } from '@/calculations/scoring/calculateReadiness';
import { determineCertificationLevel } from '@/calculations/scoring/determineCertificationLevel';

/**
 * Hook that computes all ESG scores from rows and flags
 * Preserves exact calculation logic from original calcScores function
 */
export function useAssessmentScoring(rows, flags) {
    return useMemo(() => {
        const filled = rows.filter((r) => r.elec > 0).length;
        const totalElec = rows.reduce((s, r) => s + (Number(r.elec) || 0), 0);
        const totalRen = rows.reduce((s, r) => s + (Number(r.ren) || 0), 0);
        const totalDiesel = rows.reduce((s, r) => s + (Number(r.diesel) || 0), 0);

        const renPct = calculateRenewableShare(totalRen, totalElec);
        const area = Number(flags.area) || 10000;
        const intensity = calculateIntensity(totalElec, area);

        const energy = calculateEnergyScore({ filledMonths: filled, renewablePercent: renPct, intensity, flags });
        const water = calculateWaterScore(flags);
        const waste = calculateWasteScore(flags);
        const gov = calculateGovernanceScore(flags);
        const overall = calculateOverallScore({ energy, water, waste, governance: gov });

        const scope1 = calculateScope1(totalDiesel);
        const scope2 = calculateScope2(totalElec);
        const scope3 = calculateScope3(scope2);
        const totalEm = calculateTotalEmissions(scope1, scope2, scope3);

        const { level: lv, color: lvC, ringColor: ringC } = determineCertificationLevel(overall);

        return {
            energy, water, waste, gov, overall,
            scope1, scope2, scope3, totalEm,
            renPct, intensity, filled,
            totalElec, totalRen, totalDiesel,
            lv, lvC, ringC,
        };
    }, [rows, flags]);
}

export default useAssessmentScoring;
