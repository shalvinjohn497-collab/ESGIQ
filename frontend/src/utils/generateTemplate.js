const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function triggerDownload(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export function downloadElectricityTemplate() {
    const headers = 'Month,Electricity_kWh,Renewable_kWh,Diesel_Litres,Cost_INR';
    const rows = MONTHS.map(month => `${month},,,,`);
    const csvContent = [headers, ...rows].join('\n');
    triggerDownload('electricity_template.csv', csvContent);
}

export function downloadWaterTemplate() {
    const headers = 'Month,Municipal_KL,Tanker_KL,Borewell_KL,Recycled_KL';
    const rows = MONTHS.map(month => `${month},,,,`);
    const csvContent = [headers, ...rows].join('\n');
    triggerDownload('water_template.csv', csvContent);
}

export function downloadFuelTemplate() {
    const headers = 'Month,Diesel_Litres,PNG_kg,Runtime_Hours';
    const rows = MONTHS.map(month => `${month},,,`);
    const csvContent = [headers, ...rows].join('\n');
    triggerDownload('fuel_template.csv', csvContent);
}

export function downloadWasteTemplate() {
    const headers = 'Month,Wet_kg,Dry_kg,Biomedical_kg,Hazardous_kg';
    const rows = MONTHS.map(month => `${month},,,,`);
    const csvContent = [headers, ...rows].join('\n');
    triggerDownload('waste_template.csv', csvContent);
}
