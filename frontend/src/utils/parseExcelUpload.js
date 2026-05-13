import * as XLSX from 'xlsx';

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

function monthMatch(cellVal, monthKey) {
    const s = String(cellVal ?? '').trim().toLowerCase();
    const m = monthKey.toLowerCase();
    if (!s) return false;
    return s.startsWith(m) || s.startsWith(m.slice(0, 3));
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
    const electricityRows = parseElectricitySheet(workbook, errors);
    const waterRows       = parseWaterSheet(workbook, errors);
    const fuelRows        = parseFuelSheet(workbook, errors);
    const wasteRows       = parseWasteSheet(workbook, errors);

    return { electricityRows, waterRows, fuelRows, wasteRows, errors };
}

function parseElectricitySheet(workbook, errors) {
    const sheet = findSheet(workbook, 'electricity');
    if (!sheet) {
        errors.push('Sheet "Electricity" not found — skipping.');
        return emptyElectricityRows();
    }
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
        // ── RAW XLSX DEBUG ─────────────────────────────────────────
    console.log('RAW row count:', raw.length);
    console.log('RAW first row (all keys):', raw[0]);
    console.log('RAW all keys in first row:', Object.keys(raw[0] ?? {}));
    // ──────────────────────────────────────────────────────────
    return MONTH_KEYS.map((monthKey) => {
        const found = raw.find((r) => monthMatch(r.Month ?? r.month, monthKey));
        return {
            month:  monthKey,
            elec:   num(found, 'Electricity_kWh', 'elec'),
            ren:    num(found, 'Renewable_kWh', 'ren'),
            diesel: num(found, 'Diesel_Litres', 'diesel'),
            cost:   num(found, 'Cost_INR', 'cost'),
        };
    });
}

function parseWaterSheet(workbook, errors) {
    const sheet = findSheet(workbook, 'water');
    if (!sheet) {
        errors.push('Sheet "Water" not found — skipping.');
        return emptyWaterRows();
    }
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    return MONTH_KEYS.map((monthKey) => {
        const found = raw.find((r) => monthMatch(r.Month ?? r.month, monthKey));
        return {
            month:      monthKey,
            municipal:  num(found, 'Municipal_KL', 'municipal'),
            tanker:     num(found, 'Tanker_KL', 'tanker'),
            borewell:   num(found, 'Borewell_KL', 'borewell'),
            recycled:   num(found, 'Recycled_KL', 'recycled'),
            totalWater: num(found, 'Total_KL', 'totalWater'),
        };
    });
}

function parseFuelSheet(workbook, errors) {
    const sheet = findSheet(workbook, 'fuel');
    if (!sheet) {
        errors.push('Sheet "Fuel" not found — skipping.');
        return emptyFuelRows();
    }
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    return MONTH_KEYS.map((monthKey) => {
        const found = raw.find((r) => monthMatch(r.Month ?? r.month, monthKey));
        return {
            month:      monthKey,
            fuelDiesel: num(found, 'Diesel_Litres', 'fuelDiesel'),
            png:        num(found, 'PNG_kg', 'png'),
            runtime:    num(found, 'Runtime_Hours', 'runtime'),
        };
    });
}

function parseWasteSheet(workbook, errors) {
    const sheet = findSheet(workbook, 'waste');
    if (!sheet) {
        errors.push('Sheet "Waste" not found — skipping.');
        return emptyWasteRows();
    }
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    return MONTH_KEYS.map((monthKey) => {
        const found = raw.find((r) => monthMatch(r.Month ?? r.month, monthKey));
        return {
            month:      monthKey,
            wet:        num(found, 'Wet_kg', 'wet'),
            dry:        num(found, 'Dry_kg', 'dry'),
            biomedical: num(found, 'Biomedical_kg', 'biomedical'),
            hazardous:  num(found, 'Hazardous_kg', 'hazardous'),
            totalWaste: num(found, 'Total_kg', 'totalWaste'),
        };
    });
}

export default parseExcelUpload;