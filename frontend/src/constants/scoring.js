export const SCORING_WEIGHTS = {
    energy:     0.35,
    water:      0.25,
    waste:      0.20,
    governance: 0.20,
};

export const CERTIFICATION_THRESHOLDS = {
    Platinum: 75,
    Gold:     60,
    Silver:   45,
    Bronze:   0,
};

export const CERTIFICATION_COLORS = {
    Platinum: '#e2e8f0',
    Gold:     '#fbbf24',
    Silver:   '#94a3b8',
    Bronze:   '#d97706',
};

export const CERTIFICATION_ICONS = {
    Platinum: '💎',
    Gold:     '🥇',
    Silver:   '🥈',
    Bronze:   '🥉',
};

// FIX: values corrected to match BRD §10.5 stage labels exactly.
// Keys kept unchanged to avoid breaking existing UI imports.
// notReady added as new additive key.
export const MATURITY_LABELS = {
    advanced:     'Advanced Readiness',    // was 'Advanced'
    structured:   'Strong Readiness',      // was 'Structured'
    developing:   'Certification Possible',// was 'Developing'
    foundational: 'Foundational',          // unchanged
    notReady:     'Not Ready',             // new — was missing
};

/**
 * getLabelForScore
 * BRD §10.5 — returns the correct stage label for any numeric score.
 * Use in UI components instead of importing calculateReadiness from the
 * scoring engine — keeps display logic close to the label definitions.
 */
export function getLabelForScore(score) {
    if (score >= 90) return MATURITY_LABELS.advanced;
    if (score >= 75) return MATURITY_LABELS.structured;
    if (score >= 60) return MATURITY_LABELS.developing;
    if (score >= 40) return MATURITY_LABELS.foundational;
    return MATURITY_LABELS.notReady;
}

export default SCORING_WEIGHTS;