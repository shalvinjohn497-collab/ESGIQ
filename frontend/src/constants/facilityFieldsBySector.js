

/**
 * Master list of facility intelligence toggles (order preserved).
 * Used as the DEFAULT / fallback set for unknown or unmapped sectors.
 */
export const FACILITY_FIELDS = [
    { k: 'hasBMS', l: 'Energy Monitoring System (BMS/EMS)' },
    { k: 'wSplit', l: 'Source-wise Water Split Documented' },
    { k: 'hasSTP', l: 'STP/ETP Available and Operational' },
    { k: 'rainwater', l: 'Rainwater Harvesting Operational' },
    { k: 'wAudit', l: 'Water Quality Testing Conducted' },
    { k: 'leakage', l: 'Leakage Monitoring System in Place' },
    { k: 'authVendor', l: 'Authorized Vendor for Hazardous/Biomedical Waste' },
    { k: 'hazHandling', l: 'Hazardous/Biomedical Handling Procedures Documented' },
    { k: 'wasteAudit', l: 'Waste Audit Records Maintained' },
    { k: 'policy', l: 'Sustainability/Environmental Policy in Place' },
    { k: 'esgOwner', l: 'ESG Owner Designated' },
    { k: 'monthlyRev', l: 'Monthly Utility Review Conducted' },
    { k: 'sops', l: 'SOP Documentation Available' },
    { k: 'audits', l: 'Internal Audits Conducted Within 12 Months' },
    { k: 'compliance', l: 'Compliance Register Maintained' },
    { k: 'iaqMonitoring', l: 'Indoor Air Quality Monitoring Operational' },
];

const ALL_TOGGLE_KEYS = FACILITY_FIELDS.map((f) => f.k);

/** Office / education / NGO: omit clinical‑waste toggles (BRD example: not hospital). */
const OFFICE_LIKE_TOGGLE_KEYS = ALL_TOGGLE_KEYS.filter(
    (k) => !['authVendor', 'hazHandling'].includes(k)
);

/**
 * Allowed facility toggle keys per sector. Unlisted sector codes fall back to DEFAULT.
 * @type {Record<string, string[]>}
 */
export const FACILITY_FIELD_KEYS_BY_SECTOR = {
    DEFAULT: [...ALL_TOGGLE_KEYS],
    HOSP: [...ALL_TOGGLE_KEYS],
    BLDG: [...OFFICE_LIKE_TOGGLE_KEYS],
    EDUC: [...OFFICE_LIKE_TOGGLE_KEYS],
    NGO: [...OFFICE_LIKE_TOGGLE_KEYS],
    MFGR: [...ALL_TOGGLE_KEYS],
    TEXT: [...ALL_TOGGLE_KEYS],
    ELEC: [...ALL_TOGGLE_KEYS],
    FOOD: [...ALL_TOGGLE_KEYS],
    LOGI: [...ALL_TOGGLE_KEYS],
    GEN: [...ALL_TOGGLE_KEYS],
};

/** Sectors that collect licensed bed count (healthcare facilities). */
export const BED_COUNT_SECTORS = new Set(['HOSP']);

/**
 * @param {string | undefined | null} sector
 * @returns {string[]}
 */
export function getFacilityToggleKeysForSector(sector) {
    if (!sector || !FACILITY_FIELD_KEYS_BY_SECTOR[sector]) {
        return FACILITY_FIELD_KEYS_BY_SECTOR.DEFAULT;
    }
    return FACILITY_FIELD_KEYS_BY_SECTOR[sector];
}

/**
 * @param {string | undefined | null} sector
 * @returns {typeof FACILITY_FIELDS}
 */
export function getFacilityToggleFieldsForSector(sector) {
    const allowed = new Set(getFacilityToggleKeysForSector(sector));
    return FACILITY_FIELDS.filter((f) => allowed.has(f.k));
}

/**
 * @param {string | undefined | null} sector
 */
export function shouldShowBedCount(sector) {
    return BED_COUNT_SECTORS.has(sector ?? 'HOSP');
}

export default FACILITY_FIELD_KEYS_BY_SECTOR;
