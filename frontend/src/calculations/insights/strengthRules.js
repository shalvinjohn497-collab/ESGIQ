/**
 * BRD §12 — strength rules (16). Higher `priority` surfaces first after sort (desc).
 * @typedef {{ id: string, label: string, condition: (scores: object, benchmarks: object, categoryData: object) => boolean, insight: string, priority: number }} StrengthRule
 */

/** @type {StrengthRule[]} */
export const STRENGTH_RULES = [
    {
        id: 's_energy_intensity_leadership',
        label: 'Energy intensity leadership',
        condition: (s, b, d) => {
            const i = Number(s.intensity) || 0;
            return i > 0 && i <= b.energyIntensityIdealMax;
        },
        insight: 'Site energy intensity sits at or below the lower benchmark band — top-quartile operational efficiency.',
        priority: 100,
    },
    {
        id: 's_energy_intensity_in_band',
        label: 'Energy intensity within benchmark',
        condition: (s, b) => {
            const i = Number(s.intensity) || 0;
            return i > 0 && i > b.energyIntensityIdealMax && i <= b.energyIntensityBandHigh;
        },
        insight: 'Energy intensity falls within the sector benchmark corridor — performance is audit-defensible.',
        priority: 72,
    },
    {
        id: 's_renewable_stretch',
        label: 'Renewable share stretch',
        condition: (s, b) => (Number(s.renPct) || 0) >= b.renewableShareStretch,
        insight: 'Renewable contribution materially exceeds the baseline target — strong decarbonisation signal for certification narratives.',
        priority: 96,
    },
    {
        id: 's_renewable_on_target',
        label: 'Renewable share on target',
        condition: (s, b) => {
            const r = Number(s.renPct) || 0;
            return r >= b.renewableShareTarget && r < b.renewableShareStretch;
        },
        insight: 'Renewable electricity meets or beats the minimum readiness threshold for most green-building frameworks.',
        priority: 78,
    },
    {
        id: 's_energy_score_strong',
        label: 'Energy score strong',
        condition: (s, b) => (Number(s.energy) || 0) >= b.categoryScoreStrong,
        insight: 'Composite energy score reflects strong monitoring, intensity, and renewable posture.',
        priority: 88,
    },
    {
        id: 's_water_score_strong',
        label: 'Water programme strong',
        condition: (s, b) => (Number(s.water) || 0) >= b.categoryScoreStrong,
        insight: 'Water stewardship score indicates mature tracking, reuse, and audit practices.',
        priority: 84,
    },
    {
        id: 's_water_intensity_good',
        label: 'Water intensity favourable',
        condition: (s, b, d) => {
            const w = Number(d.waterIntensityKlPerSqftYr) || 0;
            return w > 0 && w <= b.waterIntensityBandHigh;
        },
        insight: 'Derived water intensity is within or better than the reference band relative to floor area.',
        priority: 70,
    },
    {
        id: 's_waste_score_strong',
        label: 'Waste programme strong',
        condition: (s, b) => (Number(s.waste) || 0) >= b.categoryScoreStrong,
        insight: 'Waste and segregation maturity score supports circular-economy and ISO 14001 storylines.',
        priority: 82,
    },
    {
        id: 's_recycling_above_target',
        label: 'Recycling rate above target',
        condition: (s, b, d) => (Number(d.operationalMetrics?.recyclingPct) || 0) >= b.recyclingTargetPct,
        insight: 'Measured recycling rate clears the 60% benchmark used for readiness dashboards.',
        priority: 90,
    },
    {
        id: 's_governance_mature',
        label: 'Governance maturity',
        condition: (s, b) => (Number(s.gov) || 0) >= b.governanceStrong,
        insight: 'Governance controls exceed the “structured” threshold — evidence owners, SOPs, and audits are likely in place.',
        priority: 86,
    },
    {
        id: 's_overall_cert_ready',
        label: 'Overall certification-ready posture',
        condition: (s, b) => (Number(s.overall) || 0) >= b.overallCertThreshold,
        insight: 'Overall ESG score sits in the certification-ready band for aggregate readiness indices.',
        priority: 92,
    },
    {
        id: 's_scope2_managed',
        label: 'Scope 2 manageable share',
        condition: (s, b, d) => {
            const sh = d.scope2Share;
            return sh != null && sh > 0 && sh <= b.scope2ComfortMaxShare;
        },
        insight: 'Scope 2 electricity emissions are not overwhelmingly dominant — portfolio diversification across scopes is evident.',
        priority: 64,
    },
    {
        id: 's_scope1_light',
        label: 'Scope 1 relatively light',
        condition: (s, b, d) => {
            const sh = d.scope1Share;
            return sh != null && sh < b.scope1LowShareMax;
        },
        insight: 'Direct (Scope 1) emissions represent a minority share — stationary combustion is comparatively controlled.',
        priority: 62,
    },
    {
        id: 's_cert_eligible_plural',
        label: 'Multiple certifications eligible',
        condition: (s, b, d) => (d.certificationResults?.eligible?.length || 0) >= b.certEligibleCountStrong,
        insight: 'Two or more certification pathways exceed the eligibility cut-off simultaneously — strong cross-domain evidence.',
        priority: 94,
    },
    {
        id: 's_primary_cert_advanced',
        label: 'Primary certification advanced readiness',
        condition: (s, b, d) => {
            const all = d.certificationResults?.all;
            if (!Array.isArray(all)) return false;
            return all.some((c) => c.isPrimary && Number(c.score) >= b.certReadinessAdvanced);
        },
        insight: 'At least one primary-sector certification is in Advanced Readiness territory (≥90 equivalent score).',
        priority: 98,
    },
    {
        id: 's_data_coverage_strong',
        label: 'Operational data coverage',
        condition: (s, b, d) => (Number(d.filledMonths) || 0) >= b.dataCoverageFull,
        insight: 'Twelve months of electricity evidence are present — confidence modifiers and annualisation are fully supported.',
        priority: 68,
    },
];

export default STRENGTH_RULES;
