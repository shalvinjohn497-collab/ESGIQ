import { useEffect, useRef, useCallback } from 'react';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { assessmentApi } from '@/services/api/assessment.api';

/**
 * Persists computed assessment results to the backend when they become available.
 * Designed to be called once from the ResultsStep after calculation completes.
 *
 * @param {object} computedResults - The full results object from useAssessmentResults
 * @param {object} options
 * @param {function} options.onSuccess - Called on successful save
 * @param {function} options.onError   - Called on save failure
 */
export function useSaveAssessmentResults(computedResults, { onSuccess, onError } = {}) {
    const assessmentId = useAssessmentStore((s) => s.assessmentId);
    const hasSaved = useRef(false);

    const saveResults = useCallback(async () => {
        if (!assessmentId || !computedResults?.scores || hasSaved.current) return;

        const payload = {
            overallScore: computedResults.scores.overall,
            readinessStage: computedResults.readinessLabel,
            categoryScores: {
                energy: computedResults.scores.energy,
                water: computedResults.scores.water,
                waste: computedResults.scores.waste,
                governance: computedResults.scores.gov,
            },
            emissionsData: {
                scope1: computedResults.scope1,
                scope2: computedResults.scope2,
                scope3: computedResults.scope3,
                total: computedResults.totalEmissions,
            },
            certificationResults: computedResults.certificationByFramework || [],
            regulatoryResults: computedResults.regulatoryResults || [],
            strengthsAndGaps: {
                strengths: computedResults.insightEvaluation?.strengths || [],
                gaps: computedResults.insightEvaluation?.gaps || [],
            },
            computedAt: new Date().toISOString(),
        };

        try {
            await assessmentApi.saveResults(assessmentId, payload);
            hasSaved.current = true;
            onSuccess?.();
        } catch (err) {
            console.error('[useSaveAssessmentResults] Failed to persist results:', err);
            onError?.(err);
        }
    }, [assessmentId, computedResults, onSuccess, onError]);

    useEffect(() => {
        saveResults();
    }, [saveResults]);

    return { saveResults, hasSaved: hasSaved.current };
}

export default useSaveAssessmentResults;
