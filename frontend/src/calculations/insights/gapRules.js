/**
 * BRD §12 — gap rules (18). `severity` drives sort (High → Medium → Low), then `priority` desc.
 * @typedef {{ id: string, label: string, condition: (scores: object, benchmarks: object, categoryData: object) => boolean, gap: string, severity: 'High'|'Medium'|'Low', priority: number }} GapRule
 */

/** @type {GapRule[]} */
export const GAP_RULES = [
    {
        id: 'g_energy_intensity_above_band',
        label: 'Energy intensity above benchmark',
        condition: (s, b) => (Number(s.intensity) || 0) > b.energyIntensityBandHigh,
        gap: 'Energy intensity exceeds the upper benchmark — efficiency retrofits or sub-metering should be prioritised.',
        severity: 'High',
        priority: 100,
    },
    {
        id: 'g_renewable_below_target',
        label: 'Renewable share below target',
        condition: (s, b) =>
            (Number(s.totalElec) || 0) > 0 &&
            (Number(s.renPct) || 0) < b.renewableShareTarget &&
            (Number(s.renPct) || 0) >= b.renewableNegligibleMax,
        gap: 'Renewable electricity is below the 10% readiness threshold while grid draw exists — expand on-site or contracted RE.',
        severity: 'High',
        priority: 92,
    },
    {
        id: 'g_energy_score_weak',
        label: 'Energy score weak',
        condition: (s, b) => (Number(s.energy) || 0) < b.categoryScoreWeak,
        gap: 'Composite energy score is materially below peer readiness — revisit intensity, renewables, and monitoring flags.',
        severity: 'High',
        priority: 88,
    },
    {
        id: 'g_water_score_weak',
        label: 'Water score weak',
        condition: (s, b) => (Number(s.water) || 0) < b.categoryScoreWeak,
        gap: 'Water stewardship score is low — expand metering, STP/reuse evidence, and audit documentation.',
        severity: 'Medium',
        priority: 78,
    },
    {
        id: 'g_water_intensity_high',
        label: 'Water intensity high',
        condition: (s, b, d) => {
            const w = Number(d.waterIntensityKlPerSqftYr) || 0;
            return w > b.waterIntensityBandHigh;
        },
        gap: 'Water intensity per sq.ft.-year exceeds the reference upper bound — investigate leaks, cooling tower blowdown, and reuse.',
        severity: 'High',
        priority: 84,
    },
    {
        id: 'g_waste_score_weak',
        label: 'Waste score weak',
        condition: (s, b) => (Number(s.waste) || 0) < b.categoryScoreWeak,
        gap: 'Waste programme score is weak — strengthen segregation data, vendor traceability, and hazardous handling evidence.',
        severity: 'Medium',
        priority: 76,
    },
    {
        id: 'g_recycling_below_target',
        label: 'Recycling rate below target',
        condition: (s, b, d) => {
            const r = Number(d.operationalMetrics?.recyclingPct) || 0;
            return (Number(d.operationalMetrics?.totalWasteKg) || 0) > 0 && r < b.recyclingWeakPct;
        },
        gap: 'Measured recycling rate trails the 40% floor used for gap detection — improve source segregation and vendor reporting.',
        severity: 'Medium',
        priority: 72,
    },
    {
        id: 'g_governance_weak',
        label: 'Governance weak',
        condition: (s, b) => (Number(s.gov) || 0) < b.governanceWeak,
        gap: 'Governance score is below the structured threshold — assign ESG ownership, formalise SOPs, and document reviews.',
        severity: 'High',
        priority: 90,
    },
    {
        id: 'g_overall_critical',
        label: 'Overall score foundational',
        condition: (s, b) => (Number(s.overall) || 0) < b.overallCritical,
        gap: 'Overall ESG score is in the foundational band — cross-functional remediation is required before certification submissions.',
        severity: 'High',
        priority: 96,
    },
    {
        id: 'g_overall_cert_gap',
        label: 'Overall short of certification-ready',
        condition: (s, b) => {
            const o = Number(s.overall) || 0;
            return o >= b.overallCritical && o < b.overallCertThreshold;
        },
        gap: 'Overall score is improving but still short of the certification-ready corridor — close gaps in the weakest pillar first.',
        severity: 'Medium',
        priority: 70,
    },
    {
        id: 'g_scope1_dominant',
        label: 'Scope 1 dominant',
        condition: (s, b, d) => {
            const sh = d.scope1Share;
            return sh != null && sh > b.scope1DominantMinShare;
        },
        gap: 'Scope 1 (direct) emissions dominate the inventory — prioritise diesel reduction, PNG transition, and DG runtime optimisation.',
        severity: 'High',
        priority: 86,
    },
    {
        id: 'g_scope3_pressure',
        label: 'Scope 3 pressure',
        condition: (s, b, d) => {
            const sh = d.scope3Share;
            return sh != null && sh > b.scope3PressureMinShare;
        },
        gap: 'Scope 3 (value-chain) emissions exceed half of the footprint — expand supplier engagement and water/waste intensity programmes.',
        severity: 'Medium',
        priority: 68,
    },
    {
        id: 'g_cert_none_eligible',
        label: 'No certification eligible',
        condition: (s, b, d) => {
            const n = d.certificationResults?.eligible?.length ?? 0;
            const all = d.certificationResults?.all;
            return Array.isArray(all) && all.length > 0 && n === 0;
        },
        gap: 'No certification pathway currently clears the eligibility score — address prerequisite gaps flagged in the certification matrix.',
        severity: 'High',
        priority: 94,
    },
    {
        id: 'g_cert_blocked_cluster',
        label: 'Multiple certifications blocked',
        condition: (s, b, d) => (d.certificationResults?.blocked?.length || 0) >= b.certBlockedClusterCount,
        gap: 'Several certifications are simultaneously in the blocked band — consolidate prerequisite evidence (energy, water, waste uploads).',
        severity: 'Medium',
        priority: 74,
    },
    {
        id: 'g_low_electricity_coverage',
        label: 'Low electricity data coverage',
        condition: (s, b, d) => {
            const f = Number(d.filledMonths) || 0;
            return f > 0 && f < b.dataCoverageWeak;
        },
        gap: 'Electricity uploads cover fewer than six months — confidence modifiers penalise scores until continuity improves.',
        severity: 'High',
        priority: 82,
    },
    {
        id: 'g_water_tracking_thin',
        label: 'Thin water tracking',
        condition: (s, b, d) => {
            const f = Number(d.filledWaterMonths) || 0;
            return f > 0 && f < b.monthTrackingWeak;
        },
        gap: 'Water operational months with evidence are thin — extend metering uploads to unlock full water scoring potential.',
        severity: 'Low',
        priority: 48,
    },
    {
        id: 'g_waste_tracking_thin',
        label: 'Thin waste tracking',
        condition: (s, b, d) => {
            const f = Number(d.filledWasteMonths) || 0;
            return f > 0 && f < b.monthTrackingWeak;
        },
        gap: 'Waste rows only cover a handful of months — increase upload cadence for audit-grade waste maturity.',
        severity: 'Low',
        priority: 46,
    },
    {
        id: 'g_renewable_stalled',
        label: 'Renewable contribution negligible',
        condition: (s, b) => (Number(s.totalElec) || 0) > 0 && (Number(s.renPct) || 0) < b.renewableNegligibleMax,
        gap: 'Renewable electricity is negligible (<5%) despite material grid draw — initiate RE procurement or onsite generation roadmap.',
        severity: 'Medium',
        priority: 66,
    },
];

export default GAP_RULES;
