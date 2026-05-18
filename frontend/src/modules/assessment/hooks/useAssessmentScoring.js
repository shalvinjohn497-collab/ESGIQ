import { useMemo } from 'react';
import { applyAnnualization } from '@/calculations/scoring/applyAnnualization';
import { calculateEnergyScore } from '@/calculations/energy/calculateEnergyScore';
import { calculateIntensity } from '@/calculations/energy/calculateIntensity';
import { calculateRenewableShare } from '@/calculations/energy/calculateRenewableShare';
import { calculateScope1 } from '@/calculations/emissions/calculateScope1';
import { calculateScope2 } from '@/calculations/emissions/calculateScope2';
import { calculateScope3 } from '@/calculations/emissions/calculateScope3';
import { calculateTotalEmissions } from '@/calculations/emissions/calculateTotalEmissions';
import { calculateOverallScore } from '@/calculations/scoring/calculateOverallScore';
import {
    calculateWaterScore,
    calculateWasteScore,
    calculateGovernanceScore,
    calculateReadiness,
} from '@/calculations/scoring/calculateReadiness';
import {
    determineCertificationLevel,
    mapTierToLegacyDisplay,
    certificationTierFromOverall,
} from '@/calculations/scoring/determineCertificationLevel';
import { filterApplicableFrameworks } from '@/calculations/certifications/filterApplicableFrameworks';

export function useAssessmentScoring(rows, flags, waterRows = [], wasteRows = [], fuelRows = [], sector = 'GEN') {
    return useMemo(() => {
        const filled = rows.filter((r) => Number(r.elec) > 0).length;
        const totalElec = rows.reduce((s, r) => s + (Number(r.elec) || 0), 0);
        const totalRen = rows.reduce((s, r) => s + (Number(r.ren) || 0), 0);
        const totalDiesel = rows.reduce((s, r) => s + (Number(r.diesel) || 0), 0);

        // FIX 1: Annualize electricity before using for intensity and scope2
        // BRD §11.2.1 — energy intensity = annualized kWh ÷ area, not partial total
        const { annualizedValue: annualizedElec } = applyAnnualization(totalElec, filled);
        const { annualizedValue: annualizedRen } = applyAnnualization(totalRen, filled);

        const filledWaterMonths = waterRows.filter(
            (r) => Number(r.totalWater) > 0 || Number(r.municipal) > 0
        ).length;
        const filledWasteMonths = wasteRows.filter(
            (r) => Number(r.wet) > 0 || Number(r.dry) > 0 || Number(r.biomedical) > 0 || Number(r.hazardous) > 0
        ).length;

        const area = Number(flags.area) || 10000;

        // FIX 1 (cont): intensity uses annualizedElec, not raw totalElec
        const renPct = calculateRenewableShare(annualizedRen, annualizedElec);
        const intensity = calculateIntensity(annualizedElec, area);

        // calculateEnergyScore already applies confidence modifier internally
        const energy = calculateEnergyScore({
            filledMonths: filled,
            renewablePercent: renPct,
            intensity,
            flags,
            sector,
        });

        // FIX 2: Pass filledMonths to water and waste score functions
        // Without this, the tracking parameter (20pts) always scores 0
        const water = calculateWaterScore(flags, filledWaterMonths);
        const waste = calculateWasteScore(flags, filledWasteMonths);
        const gov = calculateGovernanceScore(flags);
        const overall = calculateOverallScore({ energy, water, waste, governance: gov });

        // FIX 4: Compute readinessLabel and include in return
        // Was missing entirely — consumers relying on this hook had no stage label
        const readinessLabel = calculateReadiness(overall);

        // FIX 3: Scope emissions use annualized electricity and correct diesel source
        // Previously: calculateScope2(totalElec) used raw partial total — understated Scope 2
        // Previously: calculateScope3(scope2) used Scope 2 as a proxy — wrong entirely
        const totalFuelDiesel = fuelRows?.reduce((s, r) => s + (Number(r.fuelDiesel) || 0), 0) ?? 0;
const totalPng = fuelRows?.reduce((s, r) => s + (Number(r.png) || 0), 0) ?? 0;
const totalWater = waterRows?.reduce((s, r) => s + (Number(r.totalWater) || 0), 0) ?? 0;
const wetWasteToLandfill = wasteRows?.reduce((s, r) => s + (Number(r.wet) || 0), 0) ?? 0;

const scope1 = calculateScope1(totalFuelDiesel, totalPng);
        const scope2 = calculateScope2(annualizedElec, annualizedRen);
        const scope3 = calculateScope3(wetWasteToLandfill, totalWater);
        const totalEm = calculateTotalEmissions(scope1, scope2, scope3);
        const emissionsPillar = Math.max(0, 100 - Math.round(totalEm / 1.5));

        const categoryScoresForCertification = {
            energy,
            water,
            waste,
            governance: gov,
            emissions: emissionsPillar,
        };

        const applicableFrameworks = filterApplicableFrameworks(sector);
        const primaryCert = applicableFrameworks[0]
            ? determineCertificationLevel(
                  categoryScoresForCertification,
                  applicableFrameworks[0],
                  { filledMonths: filled }
              )
            : null;

        const { level: lv, color: lvC, ringColor: ringC } = primaryCert
            ? mapTierToLegacyDisplay(primaryCert.tier)
            : certificationTierFromOverall(overall);

        return {
            energy, water, waste, gov, overall,
            readinessLabel,       // FIX 4: added
            scope1, scope2, scope3, totalEm,
            renPct, intensity, filled,
            annualizedElec, annualizedRen,   // exposed for consumers
            totalElec, totalRen, totalDiesel,
            lv, lvC, ringC,
        };
    }, [rows, flags, waterRows, wasteRows, fuelRows, sector]);
}

export default useAssessmentScoring;