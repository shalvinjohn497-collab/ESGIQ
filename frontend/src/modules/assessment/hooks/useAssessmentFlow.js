import useAssessmentStore from '@/modules/assessment/store/assessment.store';

/**
 * Hook to manage assessment wizard navigation flow
 */
export function useAssessmentFlow() {
    const { step, setStep, nextStep, prevStep, resetAssessment } = useAssessmentStore();

    const goToStep = (s) => setStep(s);
    const isFirstStep = step === 1;
    const isLastStep = step === 3;

    const stepLabels = { 1: 'Data Load', 2: 'Upload Summary', 3: 'Readiness Results' };
    const currentLabel = stepLabels[step];

    return {
        step,
        setStep,
        nextStep,
        prevStep,
        goToStep,
        isFirstStep,
        isLastStep,
        currentLabel,
        stepLabels,
        resetAssessment,
    };
}

export default useAssessmentFlow;
