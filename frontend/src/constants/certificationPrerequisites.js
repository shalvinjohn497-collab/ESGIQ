export const CERTIFICATION_PREREQUISITES = {
    NABH: {
        minScore: 75,
        prerequisites: [
            { key: 'biomedicalWasteVendor', label: 'CPCB-authorized biomedical waste vendor' },
            { key: 'infectionControlSOPs', label: 'Infection control SOPs documented' },
            { key: 'biomedicalWasteRecords', label: 'Daily biomedical waste disposal records' },
        ],
    },
    IGBC_HEALTHCARE: {
        minScore: 65,
        prerequisites: [
            { key: 'energyTracking6Months', label: 'Energy tracking for minimum 6 months' },
            { key: 'waterTracking6Months', label: 'Water tracking for minimum 6 months' },
        ],
    },
    LEED_HEALTHCARE: {
        minScore: 65,
        prerequisites: [
            { key: 'energyMonitoringSystem', label: 'Energy monitoring system in place' },
            { key: 'waterMeteringBySource', label: 'Water metering by source' },
        ],
    },
    ISO_14001: {
        minScore: 70,
        prerequisites: [
            { key: 'policy', label: 'Environmental policy document available' },
            { key: 'esgOwner', label: 'ESG owner designated' },
            { key: 'compliance', label: 'Legal compliance register maintained' },
        ],
    },
    WELL: {
        minScore: 55,
        prerequisites: [
            { key: 'iaqMonitoring', label: 'Indoor air quality monitoring system operational' },
        ],
    },
    BRSR: {
        minScore: 60,
        prerequisites: [
            { key: 'esgOwner', label: 'ESG owner designated' },
            { key: 'scope1Available', label: 'Scope 1 emissions data available' },
            { key: 'scope2Available', label: 'Scope 2 emissions data available' },
        ],
    },
};
