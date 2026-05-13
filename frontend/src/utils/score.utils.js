import { C } from '@/theme/colors';

/**
 * @deprecated Phase 0 routing/calculation migration uses module-level calculation hooks.
 * This file remains temporarily for backward compatibility and will be removed post-migration.
 */

/**
 * Get maturity label based on score
 */
export function getMaturityLabel(score) {
    if (score >= 80) return '✦ Advanced';
    if (score >= 60) return '◈ Structured';
    if (score >= 40) return '◇ Developing';
    return '○ Foundational';
}

/**
 * Get readiness label based on overall score
 */
export function getReadinessLabel(score) {
    if (score >= 75) return 'Advanced';
    if (score >= 65) return 'Structured';
    if (score >= 50) return 'Developing';
    return 'Foundational';
}

/**
 * Get ring color based on overall score
 */
export function getRingColor(score) {
    if (score >= 75) return '#e2e8f0';
    if (score >= 60) return '#fbbf24';
    if (score >= 45) return C.green;
    return C.orange;
}

/**
 * Determine certification level based on overall score
 */
export function getCertificationLevel(score) {
    if (score >= 75) return 'Platinum';
    if (score >= 60) return 'Gold';
    if (score >= 45) return 'Silver';
    return 'Bronze';
}

/**
 * Get certification level color
 */
export function getCertificationColor(level) {
    const map = { Platinum: '#e2e8f0', Gold: '#fbbf24', Silver: '#94a3b8', Bronze: '#d97706' };
    return map[level] || '#d97706';
}
