export const MIN_VALID_MONTHS = 3;

export function getConfidenceModifier(months) {
    if (months >= 12) return 1.00;
    if (months >= 9) return 0.95;
    if (months >= 6) return 0.85;
    if (months >= 3) return 0.70;
    return null;
}
