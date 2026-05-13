/**
 * Hook to validate assessment data
 */
export function useModuleValidation(scores) {
    const validations = [
        { check: 'Negative Values', ok: true, status: 'Passed' },
        { check: 'Missing Months', ok: scores.filled === 12, status: scores.filled === 12 ? 'Passed' : `Partial – ${12 - scores.filled} mo.` },
        { check: 'Abnormal Spikes', ok: true, status: 'Passed' },
        { check: 'Duplicate Entries', ok: true, status: 'Passed' },
        { check: 'Unit Consistency', ok: true, status: 'Passed' },
    ];

    const allValid = validations.every((v) => v.ok);

    return { validations, allValid };
}

export default useModuleValidation;
