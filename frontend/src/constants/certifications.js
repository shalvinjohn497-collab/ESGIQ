/**
 * SINGLE SOURCE OF TRUTH for all certification data.
 *
 * DashboardPage, CertificationsPage, and ResultsStep all import from here.
 * Do NOT duplicate this data in individual page files.
 */

// ─── Detailed Certification Database (used on CertificationsPage) ──────────
export const CERT_DATABASE = [
    {
        id: 'nabh', name: 'NABH', fullName: 'National Accreditation Board for Hospitals',
        score: 82, color: '#34d399', timeline: '3–6 months', category: 'Healthcare',
        status: 'Strong Readiness',
        requirements: [
            { name: 'Environmental monitoring system', met: true },
            { name: 'Waste management protocol', met: true },
            { name: 'Water quality testing', met: true },
            { name: 'Energy audit documentation', met: true },
            { name: 'Indoor air quality monitoring', met: false },
            { name: 'Emergency preparedness plan', met: true },
        ],
    },
    {
        id: 'igbc', name: 'IGBC Healthcare', fullName: 'Indian Green Building Council',
        score: 74, color: '#f59e0b', timeline: '6–12 months', category: 'Green Building',
        status: 'Cert. Possible',
        requirements: [
            { name: 'Energy performance benchmarking', met: true },
            { name: 'Renewable energy >10%', met: false },
            { name: 'Water efficiency measures', met: true },
            { name: 'Waste segregation at source', met: true },
            { name: 'Indoor environmental quality', met: false },
            { name: 'Sustainable site development', met: true },
            { name: 'Materials & resources policy', met: false },
        ],
    },
    {
        id: 'iso14001', name: 'ISO 14001', fullName: 'Environmental Management System',
        score: 76, color: '#34d399', timeline: '6 months', category: 'Management',
        status: 'Strong Readiness',
        requirements: [
            { name: 'Environmental policy documented', met: true },
            { name: 'Aspects & impacts register', met: true },
            { name: 'Legal compliance register', met: true },
            { name: 'Operational controls defined', met: true },
            { name: 'Internal audit program', met: false },
            { name: 'Management review process', met: true },
        ],
    },
    {
        id: 'leed', name: 'LEED Healthcare', fullName: 'Leadership in Energy & Environmental Design',
        score: 68, color: '#f59e0b', timeline: '12–18 months', category: 'Green Building',
        status: 'Moderate Readiness',
        requirements: [
            { name: 'Energy star benchmarking', met: true },
            { name: 'Minimum energy performance', met: true },
            { name: 'Renewable energy generation', met: false },
            { name: 'Water use reduction >20%', met: false },
            { name: 'Construction waste management', met: true },
            { name: 'Indoor air quality (IAQ) plan', met: false },
            { name: 'Daylight & views optimization', met: false },
            { name: 'Commissioning of systems', met: false },
        ],
    },
    {
        id: 'gri', name: 'GRI', fullName: 'Global Reporting Initiative',
        score: 62, color: '#3b82f6', timeline: '12 months', category: 'Reporting',
        status: 'Early Readiness',
        requirements: [
            { name: 'Stakeholder identification', met: true },
            { name: 'Materiality assessment', met: false },
            { name: 'GHG emissions disclosure (Scope 1 & 2)', met: true },
            { name: 'Scope 3 emissions tracking', met: false },
            { name: 'Water & waste data reporting', met: true },
            { name: 'Social metrics reporting', met: false },
            { name: 'Governance structure disclosure', met: true },
        ],
    },
    {
        id: 'brsr', name: 'BRSR', fullName: 'Business Responsibility & Sustainability Report',
        score: 58, color: '#f59e0b', timeline: '12 months', category: 'Reporting',
        status: 'Foundational',
        requirements: [
            { name: 'Principle-wise disclosures', met: true },
            { name: 'Energy consumption data', met: true },
            { name: 'Water withdrawal data', met: true },
            { name: 'Waste generated & diverted', met: true },
            { name: 'Employee well-being metrics', met: false },
            { name: 'Value chain ESG assessment', met: false },
            { name: 'CSR spend disclosure', met: false },
        ],
    },
    {
        id: 'cdp', name: 'CDP', fullName: 'Carbon Disclosure Project',
        score: 52, color: '#f97316', timeline: '12–18 months', category: 'Climate',
        status: 'Foundational',
        requirements: [
            { name: 'GHG inventory (Scope 1 & 2)', met: true },
            { name: 'Scope 3 screening completed', met: false },
            { name: 'Climate risk assessment', met: false },
            { name: 'Science-based targets set', met: false },
            { name: 'Board-level climate oversight', met: true },
            { name: 'Transition plan documented', met: false },
        ],
    },
    {
        id: 'issb', name: 'ISSB', fullName: 'Intl Sustainability Standards Board',
        score: 45, color: '#64748b', timeline: '18+ months', category: 'Reporting',
        status: 'Early Stage',
        requirements: [
            { name: 'Climate-related financial disclosures', met: false },
            { name: 'Transition risk assessment', met: false },
            { name: 'Physical risk assessment', met: false },
            { name: 'GHG emissions (all scopes)', met: false },
            { name: 'Industry-specific metrics defined', met: true },
            { name: 'Governance & strategy alignment', met: true },
        ],
    },
];

// ─── Summary list used for dashboard badges, ResultsStep table, DashboardPage strip ──────────
export const CERTIFICATIONS = CERT_DATABASE.map((c) => ({
    cert: c.name,
    score: c.score,
    status: c.status,
    c: c.color,
    time: c.timeline,
    gaps: c.requirements.filter((r) => !r.met).length,
    total: c.requirements.length,
}));

// ─── Dashboard preview (top-4 by score) ─────────────────────────────────────
export const CERT_DASHBOARD_PREVIEWS = CERT_DATABASE
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((c) => ({
        name: c.name,
        score: c.score,
        c: c.color,
        gaps: c.requirements.filter((r) => !r.met).length,
        total: c.requirements.length,
        time: c.timeline,
    }));

// ─── Certification pathway (ordered progression) ────────────────────────────
export const CERTIFICATION_PATHWAY = [
    { n: 1, name: 'NABH', time: '0–6 Mo', c: '#34d399' },
    { n: 2, name: 'IGBC Healthcare', time: '6–12 Mo', c: '#f59e0b' },
    { n: 3, name: 'ISO 14001', time: '6–12 Mo', c: '#3b82f6' },
    { n: 4, name: 'WELL', time: '12+ Mo', c: '#8b5cf6' },
];

export default CERTIFICATIONS;
