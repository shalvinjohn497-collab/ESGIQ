import { C } from '@/theme/colors';

/**
 * AssessmentStep — step indicator badge
 */
export default function AssessmentStep({ stepNumber, totalSteps, label }) {
    return (
        <span style={{
            background: C.gDim,
            color: C.green,
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            fontWeight: 600,
        }}>
            STEP {stepNumber} OF {totalSteps}
        </span>
    );
}
