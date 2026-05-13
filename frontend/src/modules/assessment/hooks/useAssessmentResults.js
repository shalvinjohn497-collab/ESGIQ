import { useMemo } from 'react';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { applyAnnualization } from '@/calculations/scoring/applyAnnualization';
import { applyConfidenceModifier } from '@/calculations/scoring/applyConfidenceModifier';
import { calculateEnergyScore } from '@/calculations/energy/calculateEnergyScore';
import { calculateIntensity } from '@/calculations/energy/calculateIntensity';
import { calculateRenewableShare } from '@/calculations/energy/calculateRenewableShare';
import { calculateWaterScore, calculateWasteScore, calculateGovernanceScore, calculateReadiness } from '@/calculations/scoring/calculateReadiness';
import { calculateScope1 } from '@/calculations/emissions/calculateScope1';
import { calculateScope2 } from '@/calculations/emissions/calculateScope2';
import { calculateScope3 } from '@/calculations/emissions/calculateScope3';
import { calculateTotalEmissions } from '@/calculations/emissions/calculateTotalEmissions';
import { calculateOverallScore } from '@/calculations/scoring/calculateOverallScore';
import { determineCertificationLevel } from '@/calculations/scoring/determineCertificationLevel';
import { getConfidenceModifier } from '@/constants/confidenceModifiers';
import { calculateAllCertifications } from '@/calculations/certifications';
import useAuthStore from '@/store/auth.store';
import {
  deriveEnergyMetrics,
  deriveWaterMetrics,
  deriveWasteMetrics,
} from '@/calculations/derived';

export function useAssessmentResults() {
    const { rows, flags } = useAssessmentStore();
    const waterRows = useAssessmentStore((s) => s.waterRows);
    const fuelRows = useAssessmentStore((s) => s.fuelRows);
    const wasteRows = useAssessmentStore((s) => s.wasteRows);
    const sector = useAuthStore((s) => s.user?.sector || 'HOSP');

    return useMemo(() => {
         console.log('useAssessmentResults running');
        const filledMonths = rows.filter((row) => Number(row.elec) > 0).length;
        const totalElec = rows.reduce((sum, row) => sum + (Number(row.elec) || 0), 0);
        const totalRen = rows.reduce((sum, row) => sum + (Number(row.ren) || 0), 0);
        const totalDiesel = rows.reduce((sum, row) => sum + (Number(row.diesel) || 0), 0);
        const totalWater = waterRows?.reduce((sum, r) => sum + (Number(r.totalWater) || 0), 0) ?? 0;
        const filledWaterMonths = waterRows?.filter((r) => Number(r.totalWater) > 0).length ?? 0;
        const totalWaste = wasteRows?.reduce((sum, r) => sum + (Number(r.totalWaste) || 0), 0) ?? 0;
        const totalBiomedical = wasteRows?.reduce((sum, r) => sum + (Number(r.biomedical) || 0), 0) ?? 0;
        const totalFuelDiesel = fuelRows?.reduce((sum, r) => sum + (Number(r.fuelDiesel) || 0), 0) ?? 0;
        const area = Number(flags.area) || 10000;

         
    const energyMetrics = deriveEnergyMetrics({
        rows,
        fuelRows,
    });

    const waterMetrics = deriveWaterMetrics({
        waterRows,
    });

    const wasteMetrics = deriveWasteMetrics({
        wasteRows,
        flags,
    });

    const operationalMetrics = {
        ...energyMetrics,
        ...waterMetrics,
        ...wasteMetrics,
    };
    console.log('Operational Metrics:', operationalMetrics);


        const { annualizedValue: annualizedElec, isValid: isDataValid } = applyAnnualization(totalElec, filledMonths);
        const renewablePercent = calculateRenewableShare(totalRen, totalElec);
        const intensity = calculateIntensity(totalElec, area);
        const baseEnergyScore = calculateEnergyScore({
            filledMonths,
            renewablePercent,
            intensity,
            flags,
        });

        const energy = Math.round(applyConfidenceModifier(baseEnergyScore, filledMonths));
        const water = calculateWaterScore(flags);
        const waste = calculateWasteScore(flags);
        const gov = calculateGovernanceScore(flags);
        const overall = calculateOverallScore({ energy, water, waste, governance: gov });
        const readinessLabel = calculateReadiness(overall);
       const certificationResults = calculateAllCertifications(
    sector,
    { energy, water, waste, governance: gov },
    flags,
    filledMonths,
    totalElec,
    totalDiesel,
    operationalMetrics,
);
console.log('Certification Results:', certificationResults);

        const scope1 = calculateScope1(totalDiesel);
        const scope2 = calculateScope2(totalElec);
        const scope3 = calculateScope3(scope2);
        const totalEmissions = calculateTotalEmissions(scope1, scope2, scope3);

        const { level: certLevel, color: certColor, ringColor } = determineCertificationLevel(overall);
        const confidenceModifier = getConfidenceModifier(filledMonths);

        const scores = {
            energy,
            water,
            waste,
            gov,
            overall,
            filled: filledMonths,
            totalElec,
            totalRen,
            totalDiesel,
            totalWater,
            filledWaterMonths,
            totalWaste,
            totalBiomedical,
            totalFuelDiesel,
            intensity,
            renPct: renewablePercent,
            scope1,
            scope2,
            scope3,
            totalEm: totalEmissions,
            lv: certLevel,
            lvC: certColor,
            ringC: ringColor,
        };

        const radarData = [
            { subject: 'Energy', val: energy, full: 100 },
            { subject: 'Water', val: water, full: 100 },
            { subject: 'Waste', val: waste, full: 100 },
            { subject: 'Governance', val: gov, full: 100 },
            { subject: 'Emissions', val: Math.max(0, 100 - Math.round(totalEmissions / 1.5)), full: 100 },
        ];

       return {
    scores,
    annualizedElec,
    isDataValid,
    readinessLabel,
    ringColor,
    certLevel,
    radarData,
    scope1,
    scope2,
    scope3,
    totalEmissions,
    confidenceModifier,
    certificationResults,

    operationalMetrics,
};
    }, [rows, flags, sector, waterRows, fuelRows, wasteRows]);
}

export default useAssessmentResults;
