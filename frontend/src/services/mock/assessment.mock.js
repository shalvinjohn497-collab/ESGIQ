export const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const INIT_ROWS = MONTHS.map((m, i) => ({
    month: m,
    elec: [7200, 6800, 7400, 8100, 8900, 9200, 9800, 9500, 8600, 7800, 7200, 6900][i],
    ren: [0, 0, 0, 0, 0, 0, 800, 900, 700, 0, 0, 0][i],
    diesel: [100, 95, 110, 90, 85, 80, 75, 80, 90, 100, 105, 110][i],
    cost: [72000, 68000, 74000, 81000, 89000, 92000, 98000, 95000, 86000, 78000, 72000, 69000][i],
}));

export const INIT_FLAGS = {
    area: 15000,
    hasLED: true,
    hasBMS: false,
    submetering: false,
    wTrack: true,
    wSplit: true,
    hasSTP: false,
    rainwater: false,
    wAudit: false,
    leakage: false,
    wtTrack: true,
    segregation: true,
    authVendor: true,
    recycling: false,
    wtAudit: false,
    policy: true,
    esgOwner: false,
    monthlyRev: false,
    sops: true,
    audits: false,
    compliance: false,
};

export const INIT_WATER_ROWS = MONTHS.map((m) => ({
    month: m,
    municipal: 80, tanker: 20, borewell: 30, recycled: 10, totalWater: 140,
}));

export const INIT_FUEL_ROWS = MONTHS.map((m) => ({
    month: m,
    fuelDiesel: 100, png: 0, runtime: 8,
}));

export const INIT_WASTE_ROWS = MONTHS.map((m) => ({
    month: m,
    wet: 500, dry: 300, biomedical: 80, hazardous: 20, totalWaste: 900,
}));
