import { CERTIFICATION_FRAMEWORKS } from '@/constants/certificationFrameworks';
import { SECTOR_CODES } from '@/constants/sectors';

/**
 * Normalise user/assessment sector to a `SECTOR_CODES` key (e.g. `HOSP`).
 * @param {string} [sector]
 * @returns {string}
 */
export function normalizeSectorCode(sector) {
    if (sector == null || String(sector).trim() === '') return 'GEN';
    const s = String(sector).trim();
    if (Object.prototype.hasOwnProperty.call(SECTOR_CODES, s)) return s;
    const hit = Object.entries(SECTOR_CODES).find(([, label]) => label === s);
    return hit ? hit[0] : 'GEN';
}

/**
 * BRD §13.2 — frameworks applicable to the active sector.
 * @param {string} sector — code (`HOSP`) or display label (`Healthcare`)
 * @returns {import('@/constants/certificationFrameworks').CertificationFramework[]}
 */
export function filterApplicableFrameworks(sector) {
    const code = normalizeSectorCode(sector);
    return CERTIFICATION_FRAMEWORKS.filter(
        (f) => f.applicableSectors.includes('ALL') || f.applicableSectors.includes(code),
    );
}

export default filterApplicableFrameworks;
