/**
 * SAM assessment per–data-category upload coverage status (BRD).
 * Values are string literals for easy persistence and API round-trips.
 */
export const STATUS = Object.freeze({
    COMPLETE: 'COMPLETE',
    PARTIAL: 'PARTIAL',
    INSUFFICIENT: 'INSUFFICIENT',
    ERROR: 'ERROR',
    MISSING: 'MISSING',
});

export const STATUS_LABELS = Object.freeze({
    [STATUS.COMPLETE]: 'Complete',
    [STATUS.PARTIAL]: 'Partial',
    [STATUS.INSUFFICIENT]: 'Insufficient',
    [STATUS.ERROR]: 'Error',
    [STATUS.MISSING]: 'Missing',
});

export default STATUS;
