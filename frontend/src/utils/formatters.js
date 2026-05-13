/**
 * Format a number with locale-aware separators
 */
export function formatNumber(value) {
    return Number(value).toLocaleString();
}

/**
 * Format a value with a unit suffix
 */
export function formatWithUnit(value, unit) {
    return `${value} ${unit}`;
}

/**
 * Format percentage
 */
export function formatPercent(value) {
    return `${value}%`;
}

/**
 * Format a score with /100 display
 */
export function formatScore(value) {
    return `${value} / 100`;
}
