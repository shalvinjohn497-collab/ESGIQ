import { useMemo } from 'react';
import { applyAnnualization } from '@/calculations/scoring/applyAnnualization';
import { applyConfidenceModifier } from '@/calculations/scoring/applyConfidenceModifier';
import { calculateEnergyScore } from '@/calculations/energy/calculateEnergyScore';
import { calculateIntensity } from '@/calculations/energy/calculateIntensity';
import { calculateRenewableShare } from '@/calculations/energy/calculateRenewableShare';
import {
    calculateWaterScore,
    calculateWasteScore,
    calculateGovernanceScore,
    calculateReadiness,
    buildCategoryUploadStatuses,
} from '@/calculations/scoring/calculateReadiness';
import { calculateScope1 } from '@/calculations/emissions/calculateScope1';
import { calculateScope2 } from '@/calculations/emissions/calculateScope2';
import { calculateScope3 } from '@/calculations/emissions/calculateScope3';
import { calculateTotalEmissions } from '@/calculations/emissions/calculateTotalEmissions';
import { calculateOverallScore } from '@/calculations/scoring/calculateOverallScore';
import { determineCertificationLevel, mapTierToLegacyDisplay, certificationTierFromOverall } from '@/calculations/scoring/determineCertificationLevel';
import { filterApplicableFrameworks } from '@/calculations/certifications/filterApplicableFrameworks';
import { getConfidenceModifier } from '@/constants/confidenceModifiers';
import { STATUS } from '@/constants/uploadCategoryStatus';
import { calculateAllCertifications } from '@/calculations/certifications';
import { evaluateRegulatoryReadiness } from '@/calculations/regulatory/evaluateRegulatoryReadiness';
import useAuthStore from '@/store/auth.store';
import {
    deriveEnergyMetrics,
    deriveWaterMetrics,
    deriveWasteMetrics,
} from '@/calculations/derived';
import { runCrossCategoryConsistencyChecks } from '@/utils/validation/crossCategoryChecks';
import { evaluateInsights, DEFAULT_BENCHMARKS } from '@/calculations/insights/evaluateInsights';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { DEFAULT_SECTOR } from '@/constants/sectors';

export function useAssessmentResults() {
    const { rows, flags } = useAssessmentStore();
    const waterRows = useAssessmentStore((s) => s.waterRows);
    const fuelRows = useAssessmentStore((s) => s.fuelRows);
    const wasteRows = useAssessmentStore((s) => s.wasteRows);
    const uploadStatus = useAssessmentStore((s) => s.uploadStatus);
    const assessmentSector = useAssessmentStore((s) => s.sector);
    const authSector = useAuthStore((s) => s.user?.sector);
    const sector = assessmentSector || authSector || DEFAULT_SECTOR;

    return useMemo(() => {
        console.log('useAssessmentResults running');

        const filledMonths = rows.filter(
            (row) => Number(row.elec) > 0 || Number(row.ren) > 0 || Number(row.diesel) > 0
        ).length;
        const totalElec = rows.reduce((sum, row) => sum + (Number(row.elec) || 0), 0);
        const totalRen = rows.reduce((sum, row) => sum + (Number(row.ren) || 0), 0);
        const totalDiesel = rows.reduce((sum, row) => sum + (Number(row.diesel) || 0), 0);
        const totalWater = waterRows?.reduce((sum, r) => sum + (Number(r.totalWater) || 0), 0) ?? 0;
        const filledWaterMonths = waterRows?.filter(
            (r) => Number(r.totalWater) > 0 || Number(r.municipal) > 0
        ).length ?? 0;
        const totalWaste = wasteRows?.reduce((sum, r) => sum + (Number(r.totalWaste) || 0), 0) ?? 0;
        const totalBiomedical = wasteRows?.reduce((sum, r) => sum + (Number(r.biomedical) || 0), 0) ?? 0;
        const filledWasteMonths = wasteRows?.filter(
            (r) => Number(r.wet) > 0 || Number(r.dry) > 0 || Number(r.biomedical) > 0 || Number(r.hazardous) > 0
        ).length ?? 0;
        const totalFuelDiesel = fuelRows?.reduce((sum, r) => sum + (Number(r.fuelDiesel) || 0), 0) ?? 0;
        const area = Number(flags.area) || 10000;

        // FIX 1: Pass builtUpArea to deriveEnergyMetrics and deriveWaterMetrics
        // Previously missing — caused energyIntensity, waterIntensity, annualizedKwh to be null
        const energyMetrics = deriveEnergyMetrics({
            rows,
            fuelRows,
            builtUpArea: area,
        });

        const waterMetrics = deriveWaterMetrics({
            waterRows,
            builtUpArea: area,
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

        const consistencyWarnings = runCrossCategoryConsistencyChecks({
            electricityRows: rows,
            wasteRows,
            flags,
            refrigerantData: flags?.refrigerantData,
        });
        const hasBlockingConsistencyErrors = consistencyWarnings.some((w) => w.severity === 'error');

        const categoryUploadStatuses = buildCategoryUploadStatuses({
            rows,
            waterRows,
            fuelRows,
            wasteRows,
            uploadStatus,
        });

        const blockAnnualizationForCategory = (catId) =>
            categoryUploadStatuses[catId]?.status === STATUS.ERROR;

        let annualizedElecResult = applyAnnualization(totalElec, filledMonths);
        if (blockAnnualizationForCategory('electricity') || hasBlockingConsistencyErrors) {
            annualizedElecResult = { annualizedValue: 0, isValid: false, isEstimated: false };
        }
        const { annualizedValue: annualizedElec, isValid: isDataValid } = annualizedElecResult;

        let annualizedRenResult = applyAnnualization(totalRen, filledMonths);
        let annualizedRen = annualizedRenResult.annualizedValue;
        if (blockAnnualizationForCategory('electricity') || hasBlockingConsistencyErrors) {
            annualizedRen = 0;
        }

        let annualizedWaterResult = applyAnnualization(totalWater, filledWaterMonths);
        if (blockAnnualizationForCategory('water') || hasBlockingConsistencyErrors) {
            annualizedWaterResult = { annualizedValue: 0, isValid: false, isEstimated: false };
        }
        const { annualizedValue: annualizedWater } = annualizedWaterResult;

        let annualizedWasteResult = applyAnnualization(totalWaste, filledWasteMonths);
        if (blockAnnualizationForCategory('waste') || hasBlockingConsistencyErrors) {
            annualizedWasteResult = { annualizedValue: 0, isValid: false, isEstimated: false };
        }
        const { annualizedValue: annualizedWaste } = annualizedWasteResult;

        const renewablePercent = calculateRenewableShare(annualizedRen, annualizedElec);

        // FIX 2: Use annualizedElec (not raw totalElec) for intensity
        // BRD §11.2.1 — intensity must use annualized annual kWh, not partial uploaded total
        const intensity = calculateIntensity(annualizedElec, area);

        // FIX 3: Do NOT wrap the whole energy score in applyConfidenceModifier
        // calculateEnergyScore already applies the modifier internally to only the 2
        // electricity-dependent params (tracking + intensity) per BRD §10.2.1
        // Wrapping the whole score double-applies the modifier
        const energy = calculateEnergyScore({
            filledMonths,
            renewablePercent,
            intensity,
            flags,
            sector,
        });

        // FIX 4: Do NOT wrap water/waste scores in applyConfidenceModifier
        // calculateWaterScore and calculateWasteScore already apply the modifier
        // internally to their tracking param. Wrapping here double-applies it.
        const water = calculateWaterScore(flags, filledWaterMonths);
        const waste = calculateWasteScore(flags, filledWasteMonths);

        const gov = calculateGovernanceScore(flags);
        const overall = calculateOverallScore({ energy, water, waste, governance: gov });

        // FIX 6: readinessLabel was computed but never returned — added to return below
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

        const totalPng = fuelRows?.reduce((sum, r) => sum + (Number(r.png) || 0), 0) ?? 0;
        const scope1 = calculateScope1(totalFuelDiesel, totalPng);
        const scope2 = calculateScope2(annualizedElec, annualizedRen);

        // FIX 5: Scope 3 — only send non-recycled waste to landfill
        // BRD §9.5 — "Recycled waste is excluded from this calculation (it does not go to landfill)"
        // dry waste is recyclable and must be excluded; only wet (organic) goes to landfill
        const wetWasteToLandfill = wasteRows?.reduce(
            (sum, r) => sum + (Number(r.wet) || 0), 0
        ) ?? 0;
        const scope3 = calculateScope3(wetWasteToLandfill, totalWater);
        const totalEmissions = calculateTotalEmissions(scope1, scope2, scope3);

        const emissionsPillarScore = Math.max(0, 100 - Math.round(totalEmissions / 1.5));

        const categoryScoresForCertification = {
            energy,
            water,
            waste,
            governance: gov,
            emissions: emissionsPillarScore,
        };

        const applicableFrameworks = filterApplicableFrameworks(sector);
        const certificationByFramework = applicableFrameworks.map((fw) =>
            determineCertificationLevel(categoryScoresForCertification, fw, { filledMonths })
        );

        const country = flags?.country || 'IN';
        const regulatoryResults = evaluateRegulatoryReadiness(
            sector,
            country,
            categoryScoresForCertification,
            { filledMonths, ...operationalMetrics }
        );

        let certLevel, certColor, ringColor;
        if (certificationByFramework.length > 0) {
            const disp = mapTierToLegacyDisplay(certificationByFramework[0].tier);
            certLevel = disp.level;
            certColor = disp.color;
            ringColor = disp.ringColor;
        } else {
            const disp = certificationTierFromOverall(overall);
            certLevel = disp.level;
            certColor = disp.color;
            ringColor = disp.ringColor;
        }

        const confidenceModifier = getConfidenceModifier(filledMonths);

        const scores = {
            energy,
            water,
            waste,
            gov,
            overall,
            filled: filledMonths,
            filledWaterMonths,
            filledWasteMonths,
            totalElec,
            totalRen,
            totalDiesel,
            totalWater,
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

        const waterIntensityKlPerSqftYr =
            filledWaterMonths > 0 && area > 0
                ? ((totalWater / filledWaterMonths) * 12) / area
                : 0;

        const insightCategoryData = {
            flags,
            operationalMetrics,
            certificationResults,
            filledMonths,
            filledWaterMonths,
            filledWasteMonths,
            waterIntensityKlPerSqftYr,
        };

        const insightEvaluation = evaluateInsights({
            scores,
            benchmarks: DEFAULT_BENCHMARKS,
            categoryData: insightCategoryData,
        });

        if (typeof queueMicrotask === 'function') {
            queueMicrotask(() => {
                const st = useAssessmentStore.getState();
                st.setInsights(insightEvaluation);
                st.setCertificationByFramework(certificationByFramework);
                st.setRegulatoryResults(regulatoryResults);
            });
        } else {
            setTimeout(() => {
                const st = useAssessmentStore.getState();
                st.setInsights(insightEvaluation);
                st.setCertificationByFramework(certificationByFramework);
                st.setRegulatoryResults(regulatoryResults);
            }, 0);
        }

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
            annualizedWater,
            annualizedWaste,
            isDataValid,
            electricityAnnualizationBlocked:
                blockAnnualizationForCategory('electricity') || hasBlockingConsistencyErrors,
            waterAnnualizationBlocked:
                blockAnnualizationForCategory('water') || hasBlockingConsistencyErrors,
            fuelAnnualizationBlocked:
                blockAnnualizationForCategory('fuel') || hasBlockingConsistencyErrors,
            wasteAnnualizationBlocked:
                blockAnnualizationForCategory('waste') || hasBlockingConsistencyErrors,
            consistencyWarnings,
            hasBlockingConsistencyErrors,
            readinessLabel,       // FIX 6: was missing from return
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
            categoryUploadStatuses,
            insightEvaluation,
            certificationByFramework,
            regulatoryResults,
        };
    }, [rows, flags, assessmentSector, authSector, waterRows, fuelRows, wasteRows, uploadStatus]);
}

export default useAssessmentResults;