import { useLayoutEffect } from 'react';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { runCrossCategoryConsistencyChecks } from '@/utils/validation/crossCategoryChecks';

/**
 * Recomputes BRD §7 Step 7 cross-category checks whenever electricity / waste rows or flags change,
 * and writes the result to `consistencyWarnings` on the assessment store.
 */
export function useCrossCategoryConsistencySync() {
    const rows = useAssessmentStore((s) => s.rows);
    const wasteRows = useAssessmentStore((s) => s.wasteRows);
    const flags = useAssessmentStore((s) => s.flags);

    useLayoutEffect(() => {
        const warnings = runCrossCategoryConsistencyChecks({
            electricityRows: rows,
            wasteRows,
            flags,
            refrigerantData: flags?.refrigerantData,
        });
        useAssessmentStore.getState().setConsistencyWarnings(warnings);
    }, [rows, wasteRows, flags]);
}

export default useCrossCategoryConsistencySync;
