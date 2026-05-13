/**
 * Deterministic ESG Insight Engine
 * Generates 4 concise, executive-quality insights from scoring data.
 * Pure function — no API calls, no randomness.
 */

export function generateInsights(scores = {}) {
    const {
        overall = 0,
        energy = 0,
        water = 0,
        waste = 0,
        gov = 0,
    } = scores;

    const insights = [];

    // 1. Renewable / Energy threshold
    if (energy < 60) {
        insights.push({
            id: 'energy-threshold',
            text: 'Renewable energy adoption is below LEED readiness threshold.',
            severity: 'warning',
        });
    } else if (energy >= 80) {
        insights.push({
            id: 'energy-strong',
            text: `Energy performance is above the 80-point healthcare benchmark.`,
            severity: 'positive',
        });
    } else {
        insights.push({
            id: 'energy-mid',
            text: `Energy score of ${energy} meets baseline but falls short of top-quartile targets.`,
            severity: 'neutral',
        });
    }

    // 2. Governance insight
    if (gov >= 75) {
        insights.push({
            id: 'gov-strong',
            text: `Governance maturity (${gov}) exceeds healthcare sector benchmark of 68.`,
            severity: 'positive',
        });
    } else if (gov < 55) {
        insights.push({
            id: 'gov-gap',
            text: 'Governance controls show audit gaps — internal review process is incomplete.',
            severity: 'warning',
        });
    } else {
        insights.push({
            id: 'gov-mid',
            text: `Governance score of ${gov} indicates moderate compliance posture.`,
            severity: 'neutral',
        });
    }

    // 3. Scope 2 emissions / water proxy
    if (water < 65) {
        insights.push({
            id: 'water-gap',
            text: 'Water efficiency score indicates unmet sustainability criteria for ISO 14001.',
            severity: 'warning',
        });
    } else {
        insights.push({
            id: 'water-ok',
            text: `Water management metrics satisfy baseline ISO 14001 water criteria.`,
            severity: 'positive',
        });
    }

    // 4. Overall / certification readiness
    if (overall >= 75) {
        insights.push({
            id: 'cert-ready',
            text: 'Overall ESG posture qualifies for NABH and ISO 14001 submission pathways.',
            severity: 'positive',
        });
    } else if (overall >= 55) {
        insights.push({
            id: 'cert-close',
            text: 'Formalizing EMS documentation may unlock ISO 14001 certification eligibility.',
            severity: 'neutral',
        });
    } else {
        insights.push({
            id: 'cert-gap',
            text: 'Critical gaps in environmental metrics are blocking primary certification readiness.',
            severity: 'warning',
        });
    }

    // Return max 4 insights
    return insights.slice(0, 4);
}
