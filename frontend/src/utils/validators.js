/**
 * Validate that a value is a positive number
 */
export function isPositiveNumber(value) {
    return typeof value === 'number' && value > 0;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate that required fields are present
 */
export function hasRequiredFields(obj, fields) {
    return fields.every((field) => obj[field] !== undefined && obj[field] !== null && obj[field] !== '');
}
