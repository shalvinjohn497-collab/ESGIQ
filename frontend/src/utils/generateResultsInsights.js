/**
 * generateResultsInsights
 * Deterministic insight engine for the Assessment Results page.
 * Derives strengths, gaps, and roadmap from actual scores and flags.
 *
 * Rules:
 * - Pure function: same input → same output
 * - No randomness, no AI, no hardcoded static strings
 * - Enterprise tone throughout
 */

// ─── Threshold constants ─────────────────────────────────────────────────────
const RENEWABLE_THRESHOLD = 10;   // % — minimum for green building certs
const ENERGY_INTENSITY_BENCH = 22; // kWh/sqft — healthcare benchmark
const ENERGY_SCORE_STRONG = 75;
const WATER_SCORE_STRONG = 70;
const WASTE_SCORE_STRONG = 70;
const GOV_SCORE_STRONG = 70;

/**
 * Generate strengths from flags and scores.
 * @param {object} scores
 * @param {object} flags
 * @returns {string[]}
 */
export function generateStrengths(scores, flags) {
    const items = [];

    if (flags.segregation && flags.authVendor)
        items.push('Waste segregation and authorized vendor compliance are in place.');
    if (flags.wTrack && flags.wSplit)
        items.push('Water consumption is tracked with metered sub-category splits.');
    if (flags.hasLED)
        items.push('LED lighting coverage meets minimum energy efficiency standard.');
    if (scores.energy >= ENERGY_SCORE_STRONG)
        items.push(`Energy score of ${scores.energy} exceeds the healthcare sector baseline.`);
    if (scores.gov >= GOV_SCORE_STRONG)
        items.push(`Governance score of ${scores.gov} demonstrates structured compliance posture.`);
    if (flags.policy && flags.sops)
        items.push('Sustainability policy and standard operating procedures are formally documented.');
    if (scores.renPct > RENEWABLE_THRESHOLD)
        items.push(`Renewable energy share (${scores.renPct}%) clears the 10% minimum certification threshold.`);
    if (scores.water >= WATER_SCORE_STRONG)
        items.push('Water management score meets ISO 14001 baseline water criteria.');
    if (scores.waste >= WASTE_SCORE_STRONG)
        items.push('Waste tracking and disposal processes satisfy IGBC Healthcare category requirements.');
    if (scores.intensity < ENERGY_INTENSITY_BENCH)
        items.push(`Energy intensity (${scores.intensity} kWh/sqft/yr) is within the healthcare benchmark range.`);

    return items.slice(0, 5);
}

/**
 * Generate critical gaps from flags and scores.
 * @param {object} scores
 * @param {object} flags
 * @returns {string[]}
 */
export function generateGaps(scores, flags) {
    const items = [];

    if (scores.renPct < RENEWABLE_THRESHOLD)
        items.push('Renewable energy share is below the 10% threshold required for IGBC and LEED certification.');
    if (!flags.hasBMS)
        items.push('No centralized Building Management System (BMS) for energy monitoring is in place.');
    if (!flags.esgOwner)
        items.push('No designated ESG Owner — governance accountability is absent.');
    if (!flags.audits)
        items.push('Internal audit program is missing — required for ISO 14001 compliance.');
    if (!flags.hasSTP)
        items.push('No Sewage Treatment Plant (STP) or water reuse system detected.');
    if (scores.intensity >= ENERGY_INTENSITY_BENCH)
        items.push(`Energy intensity (${scores.intensity} kWh/sqft/yr) exceeds the ${ENERGY_INTENSITY_BENCH} kWh/sqft benchmark.`);
    if (!flags.submetering)
        items.push('Sub-metering is not implemented — limiting energy attribution granularity.');
    if (!flags.policy)
        items.push('No documented sustainability policy — blocks all primary certification pathways.');

    return items.slice(0, 5);
}

/**
 * Generate prioritized roadmap actions from flags and scores.
 * @param {object} scores
 * @param {object} flags
 * @returns {{ phase: string, action: string, cert: string, priority: 'high'|'medium'|'low' }[]}
 */
export function generateRoadmap(scores, flags) {
    const items = [];

    if (!flags.esgOwner)
        items.push({ phase: 'Immediate', action: 'Designate a sustainability governance owner', cert: 'All certifications', priority: 'high' });
    if (!flags.hasBMS)
        items.push({ phase: '0–3 Months', action: 'Implement centralized energy monitoring (BMS)', cert: 'ISO 50001, LEED', priority: 'high' });
    if (scores.renPct < RENEWABLE_THRESHOLD)
        items.push({ phase: '3–6 Months', action: 'Begin renewable energy procurement or rooftop solar feasibility', cert: 'IGBC, GRI', priority: 'high' });
    if (!flags.audits)
        items.push({ phase: '3–6 Months', action: 'Establish internal ESG audit program', cert: 'ISO 14001', priority: 'medium' });
    if (!flags.hasSTP)
        items.push({ phase: '6–12 Months', action: 'Install Sewage Treatment Plant or water recycling system', cert: 'IGBC, NABH', priority: 'medium' });
    if (!flags.submetering)
        items.push({ phase: '6–12 Months', action: 'Deploy utility sub-metering across facility zones', cert: 'ISO 50001', priority: 'medium' });
    if (scores.renPct >= RENEWABLE_THRESHOLD && scores.energy < ENERGY_SCORE_STRONG)
        items.push({ phase: '6–12 Months', action: 'Expand renewable energy share to improve energy intensity score', cert: 'LEED, IGBC', priority: 'medium' });
    items.push({ phase: '12+ Months', action: 'Deploy indoor air quality (IAQ) monitoring system', cert: 'WELL, LEED', priority: 'low' });

    return items.slice(0, 5);
}

export default { generateStrengths, generateGaps, generateRoadmap };
