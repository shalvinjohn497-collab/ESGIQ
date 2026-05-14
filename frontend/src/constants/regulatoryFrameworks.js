export const REGULATORY_FRAMEWORKS = [
    {
        id: 'ghg_protocol',
        name: 'GHG Protocol',
        country: 'GLOBAL',
        applicableSectors: ['ALL'],
        scoringCriteria: {
            fields: ['emissions'],
            thresholds: { emissions: 50 },
            weights: { emissions: 1.0 }
        },
        riskRules: {
            high: "No emissions data calculated. Major compliance gap.",
            medium: "Partial emissions scope calculated. Needs comprehensive Scope 1 & 2.",
            low: "Emissions tracking is adequately covered."
        }
    },
    {
        id: 'iso_14001',
        name: 'ISO 14001 EMS',
        country: 'GLOBAL',
        applicableSectors: ['ALL'],
        scoringCriteria: {
            fields: ['governance', 'waste', 'water'],
            thresholds: { governance: 50, waste: 40, water: 40 },
            weights: { governance: 0.6, waste: 0.2, water: 0.2 }
        },
        riskRules: {
            high: "Severe lack of environmental management governance and tracking.",
            medium: "Basic governance exists, but lacking formal EMS practices.",
            low: "Strong Environmental Management System governance in place."
        }
    },
    {
        id: 'sebi_brsr',
        name: 'SEBI BRSR',
        country: 'IN',
        applicableSectors: ['MFGR', 'ELEC', 'TEXT', 'BLDG', 'ALL'],
        scoringCriteria: {
            fields: ['governance', 'emissions', 'water', 'waste'],
            thresholds: { governance: 60, emissions: 40, water: 40, waste: 40 },
            weights: { governance: 0.4, emissions: 0.2, water: 0.2, waste: 0.2 }
        },
        riskRules: {
            high: "Missing fundamental disclosures required by SEBI.",
            medium: "Partial disclosures present; moderate risk of non-compliance.",
            low: "Comprehensive disclosures across all major ESG pillars."
        }
    },
    {
        id: 'eu_csrd',
        name: 'EU CSRD',
        country: 'EU',
        applicableSectors: ['ALL'],
        scoringCriteria: {
            fields: ['governance', 'emissions', 'waste'],
            thresholds: { governance: 75, emissions: 60, waste: 50 },
            weights: { governance: 0.5, emissions: 0.3, waste: 0.2 }
        },
        riskRules: {
            high: "Not prepared for CSRD. Double materiality and deep governance missing.",
            medium: "Basic metrics exist, but lacks rigorous CSRD-level assurance readiness.",
            low: "Strong readiness for detailed CSRD sustainability reporting."
        }
    },
    {
        id: 'sg_greenmark',
        name: 'Singapore GreenMark',
        country: 'SG',
        applicableSectors: ['BLDG', 'HOSP', 'EDUC', 'ALL'],
        scoringCriteria: {
            fields: ['energy', 'water'],
            thresholds: { energy: 70, water: 60 },
            weights: { energy: 0.6, water: 0.4 }
        },
        riskRules: {
            high: "Energy and water efficiency are far below GreenMark requirements.",
            medium: "Moderate resource efficiency, but needs optimization for certification.",
            low: "High energy and water efficiency; strongly aligned with GreenMark."
        }
    }
];

export default REGULATORY_FRAMEWORKS;
