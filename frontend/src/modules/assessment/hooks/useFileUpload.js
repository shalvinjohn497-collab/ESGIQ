import { useState, useCallback } from 'react';
import { parseExcelUpload } from '@/utils/parseExcelUpload';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';

export function useFileUpload() {
    const [uploading, setUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [lastUploaded, setLastUploaded] = useState(null);

    const { setRows, setWaterRows, setFuelRows, setWasteRows, setUploadStatus } = useAssessmentStore();

    const handleFile = useCallback(async (file, category) => {
        if (!file) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            setUploadErrors(['Invalid file type. Please upload .xlsx, .xls, or .csv files.']);
            return;
        }

        setUploading(true);
        setUploadErrors([]);

        // ── CHECKPOINT 1: File received ───────────────────────────
        console.group(`📂 Upload started — category: "${category}"`);
        console.log('File name   :', file.name);
        console.log('File type   :', file.type);
        console.log('File size   :', (file.size / 1024).toFixed(1) + ' KB');
        console.groupEnd();

        try {
            const { electricityRows, waterRows, fuelRows, wasteRows, errors } = await parseExcelUpload(file, category);

            // ── CHECKPOINT 2: Raw parser output ──────────────────
            console.group(`🔍 Parser output — category: "${category}"`);
            console.log('Parser errors   :', errors.length ? errors : 'none');
            console.log('electricityRows :', electricityRows);
            console.log('waterRows       :', waterRows);
            console.log('fuelRows        :', fuelRows);
            console.log('wasteRows       :', wasteRows);

            // Show which rows have non-zero values
            const nonZeroElec  = electricityRows.filter(r => r.elec > 0 || r.ren > 0 || r.diesel > 0);
            const nonZeroWater = waterRows.filter(r => r.totalWater > 0);
            const nonZeroFuel  = fuelRows.filter(r => r.fuelDiesel > 0 || r.png > 0);
            const nonZeroWaste = wasteRows.filter(r => r.totalWaste > 0 || r.biomedical > 0);

            console.log('Non-zero electricity months :', nonZeroElec.length, nonZeroElec.map(r => r.month));
            console.log('Non-zero water months       :', nonZeroWater.length, nonZeroWater.map(r => r.month));
            console.log('Non-zero fuel months        :', nonZeroFuel.length, nonZeroFuel.map(r => r.month));
            console.log('Non-zero waste months       :', nonZeroWaste.length, nonZeroWaste.map(r => r.month));
            console.groupEnd();

            const countMonths = (rows, key) => rows.filter((r) => Number(r[key]) > 0).length;

            if (category === 'electricity' || category === 'all') {
                const monthsUploaded = countMonths(electricityRows, 'elec');
                const statusPayload = { monthsUploaded, source: 'excel', fileName: file.name };

                // ── CHECKPOINT 3: Zustand write — electricity ─────
                console.group('⚡ Zustand write — electricity');
                console.log('Rows being set    :', electricityRows);
                console.log('uploadStatus set  :', statusPayload);
                console.log('First 3 rows      :', electricityRows.slice(0, 3));
                console.groupEnd();

                setRows(electricityRows);
                setUploadStatus('electricity', statusPayload);
            }

            if (category === 'water' || category === 'all') {
                const monthsUploaded = countMonths(waterRows, 'totalWater');
                const statusPayload = { monthsUploaded, source: 'excel', fileName: file.name };

                // ── CHECKPOINT 3: Zustand write — water ──────────
                console.group('💧 Zustand write — water');
                console.log('Rows being set    :', waterRows);
                console.log('uploadStatus set  :', statusPayload);
                console.groupEnd();

                setWaterRows(waterRows);
                setUploadStatus('water', statusPayload);
            }

            if (category === 'fuel' || category === 'all') {
                const monthsUploaded = countMonths(fuelRows, 'fuelDiesel');
                const statusPayload = { monthsUploaded, source: 'excel', fileName: file.name };

                // ── CHECKPOINT 3: Zustand write — fuel ───────────
                console.group('⛽ Zustand write — fuel');
                console.log('Rows being set    :', fuelRows);
                console.log('uploadStatus set  :', statusPayload);
                console.groupEnd();

                setFuelRows(fuelRows);
                setUploadStatus('fuel', statusPayload);
            }

            if (category === 'waste' || category === 'all') {
                const monthsUploaded = countMonths(wasteRows, 'totalWaste');
                const statusPayload = { monthsUploaded, source: 'excel', fileName: file.name };

                // ── CHECKPOINT 3: Zustand write — waste ──────────
                console.group('🗑️ Zustand write — waste');
                console.log('Rows being set    :', wasteRows);
                console.log('uploadStatus set  :', statusPayload);
                console.groupEnd();

                setWasteRows(wasteRows);
                setUploadStatus('waste', statusPayload);
            }

            // ── CHECKPOINT 4: Final Zustand state snapshot ───────
            console.group('✅ Upload complete — store state after write');
            console.log('Category    :', category);
            console.log('File        :', file.name);
            console.log('Timestamp   :', new Date().toISOString());
            console.groupEnd();

            setLastUploaded({ category, fileName: file.name, timestamp: Date.now() });
            if (errors.length > 0) setUploadErrors(errors);

        } catch (err) {
            // ── CHECKPOINT ERR: Parse failure ────────────────────
            console.group('❌ Upload failed');
            console.error('Error message :', err.message);
            console.error('Stack         :', err.stack);
            console.groupEnd();

            setUploadErrors([`Failed to parse file: ${err.message}`]);
        } finally {
            setUploading(false);
        }
    }, [setRows, setWaterRows, setFuelRows, setWasteRows, setUploadStatus]);

    return { handleFile, uploading, uploadErrors, lastUploaded };
}

export default useFileUpload;