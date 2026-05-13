import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DataUploadStep from '@/modules/assessment/steps/DataUploadStep';
import SummaryStep from '@/modules/assessment/steps/SummaryStep';
import ResultsStep from '@/modules/assessment/steps/ResultsStep';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { ROUTES } from '@/constants/routes';
import { useAssessmentPersistence } from '@/modules/assessment/hooks/useAssessmentPersistence';

/**
 * AssessmentWizardPage — thin shell; wizard steps read from Zustand store directly.
 */
export default function AssessmentWizardPage() {
    const location = useLocation();
    const setStep = useAssessmentStore((state) => state.setStep);
     useAssessmentPersistence();
    useEffect(() => {
        if (location.pathname === ROUTES.ASSESSMENT_UPLOAD) setStep(1);
        else if (location.pathname === ROUTES.ASSESSMENT_SUMMARY) setStep(2);
        else if (location.pathname === ROUTES.ASSESSMENT_RESULTS) setStep(3);
    }, [location.pathname, setStep]);

    if (location.pathname === ROUTES.ASSESSMENT_UPLOAD) return <DataUploadStep />;
    if (location.pathname === ROUTES.ASSESSMENT_SUMMARY) return <SummaryStep />;
    if (location.pathname === ROUTES.ASSESSMENT_RESULTS) return <ResultsStep />;
    return null;
}
