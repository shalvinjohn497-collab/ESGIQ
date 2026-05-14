/**
 * BRD §13.2–13.3 — certification framework catalogue (10 frameworks).
 * `categoryWeights` are dimension weights (0–1 pillar scores); each row sums to **1.0**.
 * `applicableSectors` uses sector **codes** (see `SECTOR_CODES`) plus `ALL` for cross-sector frameworks.
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   applicableSectors: string[],
 *   categoryWeights: { energy: number, water: number, waste: number, governance: number, emissions: number }
 * }} CertificationFramework
 */

/** @type {CertificationFramework[]} */
export const CERTIFICATION_FRAMEWORKS = [
    {
        id: 'ISSP_CORE',
        name: 'Integrated Sustainability Performance (Core)',
        applicableSectors: ['ALL'],
        categoryWeights: { energy: 0.22, water: 0.22, waste: 0.18, governance: 0.2, emissions: 0.18 },
    },
    {
        id: 'ISO_14001_EMS',
        name: 'ISO 14001 Environmental Management System',
        applicableSectors: ['ALL'],
        categoryWeights: { energy: 0.25, water: 0.22, waste: 0.18, governance: 0.2, emissions: 0.15 },
    },
    {
        id: 'ISO_50001_ENMS',
        name: 'ISO 50001 Energy Management System',
        applicableSectors: ['ALL'],
        categoryWeights: { energy: 0.45, water: 0.12, waste: 0.08, governance: 0.15, emissions: 0.2 },
    },
    {
        id: 'IGBC_HEALTHCARE',
        name: 'IGBC Healthcare',
        applicableSectors: ['HOSP'],
        categoryWeights: { energy: 0.28, water: 0.24, waste: 0.12, governance: 0.16, emissions: 0.2 },
    },
    {
        id: 'LEED_OPS',
        name: 'LEED Operations & Maintenance',
        applicableSectors: ['BLDG', 'HOSP', 'EDUC'],
        categoryWeights: { energy: 0.3, water: 0.22, waste: 0.1, governance: 0.18, emissions: 0.2 },
    },
    {
        id: 'BRSR_CORE',
        name: 'BRSR (Business Responsibility & Sustainability Reporting)',
        applicableSectors: ['MFGR', 'TEXT', 'ELEC', 'FOOD', 'LOGI', 'GEN', 'NGO', 'BLDG'],
        categoryWeights: { energy: 0.18, water: 0.18, waste: 0.14, governance: 0.35, emissions: 0.15 },
    },
    {
        id: 'GRI_STANDARDS',
        name: 'GRI Standards (Disclosure-aligned)',
        applicableSectors: ['NGO', 'GEN', 'MFGR', 'TEXT', 'ELEC', 'FOOD', 'LOGI', 'BLDG', 'HOSP', 'EDUC'],
        categoryWeights: { energy: 0.15, water: 0.15, waste: 0.12, governance: 0.38, emissions: 0.2 },
    },
    {
        id: 'NABH_ESG',
        name: 'NABH with ESG / Quality–Sustainability bridge',
        applicableSectors: ['HOSP'],
        categoryWeights: { energy: 0.2, water: 0.22, waste: 0.22, governance: 0.26, emissions: 0.1 },
    },
    {
        id: 'CDP_CLIMATE',
        name: 'CDP Climate & emissions disclosure',
        applicableSectors: ['ALL'],
        categoryWeights: { energy: 0.2, water: 0.14, waste: 0.1, governance: 0.16, emissions: 0.4 },
    },
    {
        id: 'WELL_BUILDING',
        name: 'WELL Building Standard',
        applicableSectors: ['BLDG', 'HOSP', 'EDUC'],
        categoryWeights: { energy: 0.22, water: 0.28, waste: 0.1, governance: 0.2, emissions: 0.2 },
    },
];

export default CERTIFICATION_FRAMEWORKS;
