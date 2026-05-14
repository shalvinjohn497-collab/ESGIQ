import * as XLSX from 'xlsx';
import {
    detectSpikes,
    toMonthlyElectricityValues,
    toMonthlyWaterValues,
    toMonthlyFuelValues,
    toMonthlyWasteValues,
} from '@/utils/validation/detectSpikes';

const MONTH_KEYS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function num(row, ...keys) {
    if (!row) return 0;
    for (const k of keys) {
        if (row[k] === undefined || row[k] === '') continue;
        const n = Number(row[k]);
        if (!Number.isNaN(n)) return n;
    }
    return 0;
}

const ROW_UNIT_KEYS = ['Unit', 'unit', 'Units', 'units', 'UOM', 'uom', 'Unit_of_Measure', 'unit_of_measure'];

/** Raw label from row "Unit" column, if present. */
function unitFromRow(row) {
    if (!row || typeof row !== 'object') return null;
    for (const k of ROW_UNIT_KEYS) {
        const v = row[k];
        if (v == null || v === '' || v === 0) continue;
        const s = String(v).trim();
        if (s) return s;
    }
    return null;
}

/** Try to read a unit token from the physical sheet name (e.g. "Electricity (MWh)"). */
function unitFromSheetName(sheetDisplayName) {
    const s = String(sheetDisplayName ?? '').toLowerCase();
    const m = s.match(/\b(mwh|gwh|kwh|kl|kg|litres?|liters?|m³|m3|tonnes?|tons?)\b/i);
    if (!m) return null;
    const x = m[1].toLowerCase();
    if (x === 'kwh') return 'kWh';
    if (x === 'mwh') return 'MWh';
    if (x === 'gwh') return 'GWh';
    if (x === 'kl') return 'KL';
    if (x === 'kg') return 'kg';
    if (x.startsWith('litre') || x.startsWith('liter')) return 'L';
    if (x === 'm³' || x === 'm3') return 'm³';
    if (x.startsWith('ton')) return 't';
    return m[1];
}

/**
 * @param {object|null|undefined} row
 * @param {string} sheetDisplayName — actual workbook sheet title for that category
 */
export function extractRowUnit(row, sheetDisplayName) {
    return unitFromRow(row) || unitFromSheetName(sheetDisplayName) || null;
}

/** Normalize for equality (distinct physical units). */
function unitCompareKey(label) {
    if (label == null || label === '') return null;
    const n = String(label)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/²/g, '2')
        .replace(/³/g, '3');
    if (!n) return null;
    if (n.includes('mwh') || n === 'megawatthours' || n === 'megawatt-hour' || n === 'megawatt-h') return 'mwh';
    if (n.includes('kwh') || n.includes('kilowatthour') || n.includes('kilowatt-hour')) return 'kwh';
    if (n.includes('gwh')) return 'gwh';
    if (n.includes('mj')) return 'mj';
    if (n === 'kl' || n.includes('kilolitre') || n.includes('kiloliter')) return 'kl';
    if (n === 'l' || n.includes('litre') || n.includes('liter')) return 'l';
    if (n === 'm3' || n === 'm³' || n.includes('cubicmetre') || n.includes('cubicmeter')) return 'm3';
    if (n.includes('kg') || n.includes('kilogram')) return 'kg';
    if (n.includes('tonne') || n.includes('metricton') || n === 't' || n === 'mt') return 't';
    return n;
}

/**
 * @param {(string|null|undefined)[]} monthUnits — one label per calendar month (same order as rows)
 * @returns {{ status: 'OK' } | { status: 'ERROR', unitMismatch: true, foundUnits: string[] }}
 */
export function assessMonthlyUnitConsistency(monthUnits) {
    const byKey = new Map();
    for (const label of monthUnits) {
        if (label == null || label === '') continue;
        const k = unitCompareKey(String(label));
        if (!k) continue;
        if (!byKey.has(k)) byKey.set(k, String(label).trim());
    }
    if (byKey.size <= 1) return { status: 'OK' };
    return {
        status: 'ERROR',
        unitMismatch: true,
        foundUnits: Array.from(byKey.values()).sort(),
    };
}

function workbookSheetTitle(workbook, logicalLower) {
    const target = String(logicalLower).trim().toLowerCase();
    const key = workbook.SheetNames.find((n) => n.trim().toLowerCase() === target);
    return key || logicalLower;
}

function categoryMismatchMessage(categoryId) {
    const label =
        { electricity: 'Electricity', water: 'Water', fuel: 'Fuel', waste: 'Waste' }[categoryId] || categoryId;
    return `${label}: Mixed units detected — please re-upload with a consistent unit.`;
}

function monthMatch(cellVal, monthKey) {
    const s = String(cellVal ?? '').trim().toLowerCase();
    const m = monthKey.toLowerCase();
    if (!s) return false;
    return s.startsWith(m) || s.startsWith(m.slice(0, 3));
}

const UPLOAD_TS_KEYS = ['uploadedAt', 'UploadedAt', 'upload_timestamp', 'Timestamp', 'timestamp'];

/** @returns {number} epoch ms, or 0 if missing / unparseable */
function parseUploadedAtMs(row) {
    if (!row || typeof row !== 'object') return 0;
    for (const k of UPLOAD_TS_KEYS) {
        const v = row[k];
        if (v == null || v === '') continue;
        const n = Number(v);
        if (Number.isFinite(n) && n > 40000 && n < 600000) {
            return (n - 25569) * 86400000;
        }
        if (Number.isFinite(n) && n > 1e11) return n;
        const t = Date.parse(String(v));
        if (Number.isFinite(t)) return t;
    }
    return 0;
}

/**
 * @param {object[]} matches — raw sheet rows for the same calendar month
 * @param {object[]} raw — full raw array (for stable “last in file” ordering)
 * @returns {{ winner: object|null, duplicatesRemoved: number, keptBy: 'latestTimestamp'|'lastRowInFile'|'single'|'none' }}
 */
function resolveDuplicateRawRows(matches, raw) {
    if (!matches?.length) return { winner: null, duplicatesRemoved: 0, keptBy: 'none' };
    if (matches.length === 1) return { winner: matches[0], duplicatesRemoved: 0, keptBy: 'single' };

    let bestMs = -1;
    let anyTs = false;
    for (const m of matches) {
        const ms = parseUploadedAtMs(m);
        if (ms > 0) anyTs = true;
        if (ms > bestMs) bestMs = ms;
    }
    if (anyTs && bestMs > 0) {
        const candidates = matches.filter((m) => parseUploadedAtMs(m) === bestMs);
        let tieRow = candidates[0];
        let tieIdx = -1;
        for (const m of candidates) {
            const idx = raw.indexOf(m);
            if (idx > tieIdx) {
                tieIdx = idx;
                tieRow = m;
            }
        }
        return {
            winner: tieRow,
            duplicatesRemoved: matches.length - 1,
            keptBy: 'latestTimestamp',
        };
    }

    let bestIdx = -1;
    let lastRow = matches[0];
    for (const m of matches) {
        const idx = raw.indexOf(m);
        if (idx > bestIdx) {
            bestIdx = idx;
            lastRow = m;
        }
    }
    return {
        winner: lastRow,
        duplicatesRemoved: matches.length - 1,
        keptBy: 'lastRowInFile',
    };
}

function emptyDuplicateResolution() {
    return { duplicatesRemoved: 0, months: [], keptDetails: [] };
}

function findSheet(workbook, name) {
    const target = name.trim().toLowerCase();
    const key = workbook.SheetNames.find(
        (n) => n.trim().toLowerCase() === target
    );
    return key ? workbook.Sheets[key] : null;
}

function emptyElectricityRows() {
    return MONTH_KEYS.map((m) => ({ month: m, elec: 0, ren: 0, diesel: 0, cost: 0 }));
}

function emptyWaterRows() {
    return MONTH_KEYS.map((m) => ({
        month: m, municipal: 0, tanker: 0, borewell: 0, recycled: 0, totalWater: 0,
    }));
}

function emptyFuelRows() {
    return MONTH_KEYS.map((m) => ({ month: m, fuelDiesel: 0, png: 0, runtime: 0 }));
}

function emptyWasteRows() {
    return MONTH_KEYS.map((m) => ({
        month: m, wet: 0, dry: 0, biomedical: 0, hazardous: 0, totalWaste: 0,
    }));
}
export async function parseExcelUpload(file, category = 'all') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    console.log('📋 Sheet names:', workbook.SheetNames);

    // If only one sheet exists and a specific category is being uploaded,
    // alias that sheet to the expected name so findSheet can locate it.
    if (workbook.SheetNames.length === 1 && category !== 'all') {
        const categorySheetName = {
            electricity: 'Electricity',
            water:       'Water',
            fuel:        'Fuel',
            waste:       'Waste',
        }[category];

        if (categorySheetName) {
            const onlySheet = workbook.SheetNames[0];
            workbook.Sheets[categorySheetName] = workbook.Sheets[onlySheet];
            workbook.SheetNames.push(categorySheetName);
            console.log(`📋 Aliased "${onlySheet}" → "${categorySheetName}"`);
        }
    }

    const errors = [];
    const electricityParsed = parseElectricitySheet(workbook, errors);
    const waterParsed = parseWaterSheet(workbook, errors);
    const fuelParsed = parseFuelSheet(workbook, errors);
    const wasteParsed = parseWasteSheet(workbook, errors);

    const parsedCategories = {
        electricity: {
            spikeWarnings: detectSpikes(toMonthlyElectricityValues(electricityParsed.rows)),
            duplicatesRemoved: electricityParsed.duplicateResolution.duplicatesRemoved,
            months: electricityParsed.duplicateResolution.months,
            keptDetails: electricityParsed.duplicateResolution.keptDetails,
            status: electricityParsed.status || 'OK',
            ...(electricityParsed.unitMismatch
                ? { unitMismatch: true, foundUnits: electricityParsed.foundUnits || [] }
                : {}),
        },
        water: {
            spikeWarnings: detectSpikes(toMonthlyWaterValues(waterParsed.rows)),
            duplicatesRemoved: waterParsed.duplicateResolution.duplicatesRemoved,
            months: waterParsed.duplicateResolution.months,
            keptDetails: waterParsed.duplicateResolution.keptDetails,
            status: waterParsed.status || 'OK',
            ...(waterParsed.unitMismatch
                ? { unitMismatch: true, foundUnits: waterParsed.foundUnits || [] }
                : {}),
        },
        fuel: {
            spikeWarnings: detectSpikes(toMonthlyFuelValues(fuelParsed.rows)),
            duplicatesRemoved: fuelParsed.duplicateResolution.duplicatesRemoved,
            months: fuelParsed.duplicateResolution.months,
            keptDetails: fuelParsed.duplicateResolution.keptDetails,
            status: fuelParsed.status || 'OK',
            ...(fuelParsed.unitMismatch
                ? { unitMismatch: true, foundUnits: fuelParsed.foundUnits || [] }
                : {}),
        },
        waste: {
            spikeWarnings: detectSpikes(toMonthlyWasteValues(wasteParsed.rows)),
            duplicatesRemoved: wasteParsed.duplicateResolution.duplicatesRemoved,
            months: wasteParsed.duplicateResolution.months,
            keptDetails: wasteParsed.duplicateResolution.keptDetails,
            status: wasteParsed.status || 'OK',
            ...(wasteParsed.unitMismatch
                ? { unitMismatch: true, foundUnits: wasteParsed.foundUnits || [] }
                : {}),
        },
    };

    const electricityRows = electricityParsed.rows
        .filter(r => r.elec > 0 || r.ren > 0 || r.diesel > 0 || r.cost > 0);
    const waterRows = waterParsed.rows
        .filter(r => r.municipal > 0 || r.tanker > 0 || r.borewell > 0 || r.recycled > 0 || r.totalWater > 0);
    const fuelRows = fuelParsed.rows
        .filter(r => r.fuelDiesel > 0 || r.png > 0 || r.runtime > 0);
    const wasteRows = wasteParsed.rows
        .filter(r => r.wet > 0 || r.dry > 0 || r.biomedical > 0 || r.hazardous > 0 || r.totalWaste > 0);

    const filteredErrors = category === 'all'
    ? errors
    : errors.filter(e => e.toLowerCase().includes(category));

return {
    electricityRows,
    waterRows,
    fuelRows,
    wasteRows,
    parsedCategories,
    errors: filteredErrors,
};
}

function parseElectricitySheet(workbook, errors) {
    const sheet = findSheet(workbook, 'electricity');
    if (!sheet) {
        errors.push('Sheet "Electricity" not found — skipping.');
        return {
            rows: emptyElectricityRows(),
            duplicateResolution: emptyDuplicateResolution(),
            status: 'OK',
        };
    }
    const sheetTitle = workbookSheetTitle(workbook, 'electricity');
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
        // ── RAW XLSX DEBUG ─────────────────────────────────────────
    console.log('RAW row count:', raw.length);
    console.log('RAW first row (all keys):', raw[0]);
    console.log('RAW all keys in first row:', Object.keys(raw[0] ?? {}));
    // ──────────────────────────────────────────────────────────
    let duplicatesRemoved = 0;
    const dupMonths = [];
    const keptDetails = [];
    const monthUnits = [];

    const rows = MONTH_KEYS.map((monthKey) => {
        const matches = raw.filter((r) => monthMatch(r.Month ?? r.month, monthKey));
        const { winner, duplicatesRemoved: dr, keptBy } = resolveDuplicateRawRows(matches, raw);
        if (dr > 0) {
            duplicatesRemoved += dr;
            dupMonths.push(monthKey);
            const e = num(winner, 'Electricity_kWh', 'elec');
            const r = num(winner, 'Renewable_kWh', 'ren');
            const d = num(winner, 'Diesel_Litres', 'diesel');
            const basis = keptBy === 'latestTimestamp' ? 'latest uploadedAt' : 'last row in spreadsheet';
            keptDetails.push({
                month: monthKey,
                summary: `${e} kWh grid, ${r} kWh RE, ${d} L DG — kept (${basis})`,
            });
        }
        const found = winner;
        monthUnits.push(extractRowUnit(found, sheetTitle));
        return {
            month:  monthKey,
            elec:   num(found, 'Electricity_kWh', 'elec'),
            ren:    num(found, 'Renewable_kWh', 'ren'),
            diesel: num(found, 'Diesel_Litres', 'diesel'),
            cost:   num(found, 'Cost_INR', 'cost'),
        };
    });

    const unitCheck = assessMonthlyUnitConsistency(monthUnits);
    if (unitCheck.status === 'ERROR') {
        errors.push(categoryMismatchMessage('electricity'));
    }

    return {
        rows,
        duplicateResolution: { duplicatesRemoved, months: dupMonths, keptDetails },
        ...unitCheck,
    };
}

function parseWaterSheet(workbook, errors) {
    const sheet = findSheet(workbook, 'water');
    if (!sheet) {
        errors.push('Sheet "Water" not found — skipping.');
        return {
            rows: emptyWaterRows(),
            duplicateResolution: emptyDuplicateResolution(),
            status: 'OK',
        };
    }
    const sheetTitle = workbookSheetTitle(workbook, 'water');
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    let duplicatesRemoved = 0;
    const dupMonths = [];
    const keptDetails = [];
    const monthUnits = [];

    const rows = MONTH_KEYS.map((monthKey) => {
        const matches = raw.filter((r) => monthMatch(r.Month ?? r.month, monthKey));
        const { winner, duplicatesRemoved: dr, keptBy } = resolveDuplicateRawRows(matches, raw);
        if (dr > 0) {
            duplicatesRemoved += dr;
            dupMonths.push(monthKey);
            const municipal = num(winner, 'Municipal_KL', 'municipal');
            const tanker = num(winner, 'Tanker_KL', 'tanker');
            const borewell = num(winner, 'Borewell_KL', 'borewell');
            const recycled = num(winner, 'Recycled_KL', 'recycled');
            const total = municipal + tanker + borewell + recycled;
            const basis = keptBy === 'latestTimestamp' ? 'latest uploadedAt' : 'last row in spreadsheet';
            keptDetails.push({
                month: monthKey,
                summary: `Total ${total} KL (mun ${municipal}, tanker ${tanker}, …) — kept (${basis})`,
            });
        }
        const found = winner;
        monthUnits.push(extractRowUnit(found, sheetTitle));
        const municipal = num(found, 'Municipal_KL', 'municipal');
        const tanker = num(found, 'Tanker_KL', 'tanker');
        const borewell = num(found, 'Borewell_KL', 'borewell');
        const recycled = num(found, 'Recycled_KL', 'recycled');
        return {
            month:      monthKey,
            municipal,
            tanker,
            borewell,
            recycled,
            totalWater: municipal + tanker + borewell + recycled,
        };
    });

    const unitCheck = assessMonthlyUnitConsistency(monthUnits);
    if (unitCheck.status === 'ERROR') {
        errors.push(categoryMismatchMessage('water'));
    }

    return {
        rows,
        duplicateResolution: { duplicatesRemoved, months: dupMonths, keptDetails },
        ...unitCheck,
    };
}

function parseFuelSheet(workbook, errors) {
    const sheet = findSheet(workbook, 'fuel');
    if (!sheet) {
        errors.push('Sheet "Fuel" not found — skipping.');
        return {
            rows: emptyFuelRows(),
            duplicateResolution: emptyDuplicateResolution(),
            status: 'OK',
        };
    }
    const sheetTitle = workbookSheetTitle(workbook, 'fuel');
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    let duplicatesRemoved = 0;
    const dupMonths = [];
    const keptDetails = [];
    const monthUnits = [];

    const rows = MONTH_KEYS.map((monthKey) => {
        const matches = raw.filter((r) => monthMatch(r.Month ?? r.month, monthKey));
        const { winner, duplicatesRemoved: dr, keptBy } = resolveDuplicateRawRows(matches, raw);
        if (dr > 0) {
            duplicatesRemoved += dr;
            dupMonths.push(monthKey);
            const fd = num(winner, 'Diesel_Litres', 'fuelDiesel');
            const png = num(winner, 'PNG_kg', 'png');
            const basis = keptBy === 'latestTimestamp' ? 'latest uploadedAt' : 'last row in spreadsheet';
            keptDetails.push({
                month: monthKey,
                summary: `${fd} L diesel, ${png} kg PNG — kept (${basis})`,
            });
        }
        const found = winner;
        monthUnits.push(extractRowUnit(found, sheetTitle));
        return {
            month:      monthKey,
            fuelDiesel: num(found, 'Diesel_Litres', 'fuelDiesel'),
            png:        num(found, 'PNG_kg', 'png'),
            runtime:    num(found, 'Runtime_Hours', 'runtime'),
        };
    });

    const unitCheck = assessMonthlyUnitConsistency(monthUnits);
    if (unitCheck.status === 'ERROR') {
        errors.push(categoryMismatchMessage('fuel'));
    }

    return {
        rows,
        duplicateResolution: { duplicatesRemoved, months: dupMonths, keptDetails },
        ...unitCheck,
    };
}

function parseWasteSheet(workbook, errors) {
    const sheet = findSheet(workbook, 'waste');
    if (!sheet) {
        errors.push('Sheet "Waste" not found — skipping.');
        return {
            rows: emptyWasteRows(),
            duplicateResolution: emptyDuplicateResolution(),
            status: 'OK',
        };
    }
    const sheetTitle = workbookSheetTitle(workbook, 'waste');
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    let duplicatesRemoved = 0;
    const dupMonths = [];
    const keptDetails = [];
    const monthUnits = [];

    const rows = MONTH_KEYS.map((monthKey) => {
        const matches = raw.filter((r) => monthMatch(r.Month ?? r.month, monthKey));
        const { winner, duplicatesRemoved: dr, keptBy } = resolveDuplicateRawRows(matches, raw);
        if (dr > 0) {
            duplicatesRemoved += dr;
            dupMonths.push(monthKey);
            const tw = num(winner, 'Total_kg', 'totalWaste');
            const basis = keptBy === 'latestTimestamp' ? 'latest uploadedAt' : 'last row in spreadsheet';
            keptDetails.push({
                month: monthKey,
                summary: `Total waste ${tw} kg — kept (${basis})`,
            });
        }
        const found = winner;
        monthUnits.push(extractRowUnit(found, sheetTitle));
        return {
            month:      monthKey,
            wet:        num(found, 'Wet_kg', 'wet'),
            dry:        num(found, 'Dry_kg', 'dry'),
            biomedical: num(found, 'Biomedical_kg', 'biomedical'),
            hazardous:  num(found, 'Hazardous_kg', 'hazardous'),
            totalWaste: num(found, 'Total_kg', 'totalWaste'),
        };
    });

    const unitCheck = assessMonthlyUnitConsistency(monthUnits);
    if (unitCheck.status === 'ERROR') {
        errors.push(categoryMismatchMessage('waste'));
    }

    return {
        rows,
        duplicateResolution: { duplicatesRemoved, months: dupMonths, keptDetails },
        ...unitCheck,
    };
}

export default parseExcelUpload;