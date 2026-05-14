import { useState, useCallback } from 'react';
import { parseExcelUpload } from '@/utils/parseExcelUpload';
import { runCrossCategoryConsistencyChecks } from '@/utils/validation/crossCategoryChecks';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';
import { assessmentApi } from '@/services/api/assessment.api';

export function useFileUpload() {
    const [uploading, setUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [lastUploaded, setLastUploaded] = useState(null);

    const { hydrateFromApi } = useAssessmentStore();

    const handleFile = useCallback(async (file, category) => {
        if (!file) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            setUploadErrors(['Invalid file type. Please upload .xlsx, .xls, or .csv files.']);
            if (category === 'all') {
                ['electricity', 'water', 'fuel', 'waste'].forEach((c) =>
                    useAssessmentStore.getState().setUploadStatus(c, {
                        monthsUploaded: 0,
                        source: 'error',
                        parseFailed: true,
                    })
                );
            } else {
                useAssessmentStore.getState().setUploadStatus(category, {
                    monthsUploaded: 0,
                    source: 'error',
                    parseFailed: true,
                });
            }
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
            const {
                electricityRows,
                waterRows,
                fuelRows,
                wasteRows,
                errors,
                parsedCategories,
            } = await parseExcelUpload(file, category);

            const dupPatch = {};
            const pickDup = (catId) => {
                const pc = parsedCategories?.[catId];
                if (!pc || !pc.duplicatesRemoved) return null;
                return {
                    duplicatesRemoved: pc.duplicatesRemoved,
                    months: pc.months || [],
                    keptDetails: pc.keptDetails || [],
                };
            };
            if (category === 'all') {
                for (const c of ['electricity', 'water', 'fuel', 'waste']) {
                    dupPatch[c] = pickDup(c);
                }
            } else {
                dupPatch[category] = pickDup(category);
            }
            useAssessmentStore.getState().setUploadDuplicateResolution(dupPatch);

            const applyParserUnitFlagsToStore = () => {
                const cats = category === 'all' ? ['electricity', 'water', 'fuel', 'waste'] : [category];
                for (const c of cats) {
                    const pc = parsedCategories?.[c];
                    const prev = useAssessmentStore.getState().uploadStatus[c] || {};
                    const next = { ...prev };
                    if (pc?.unitMismatch) {
                        next.unitMismatch = true;
                        next.foundUnits = Array.isArray(pc.foundUnits) ? pc.foundUnits : [];
                    } else {
                        delete next.unitMismatch;
                        delete next.foundUnits;
                    }
                    useAssessmentStore.getState().setUploadStatus(c, next);
                }
            };

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

            // Find current assessment ID
            let currentId = null;
            const latestRes = await assessmentApi.latest();
            currentId = latestRes.data?.assessment?._id;
            
            if (!currentId) {
                const createRes = await assessmentApi.create({});
                currentId = createRes.data?.assessment?._id;
            }

            if (!currentId) throw new Error("Could not find or create assessment for upload.");

            // Upload only the relevant category
            let updatedAssessment = null;
            const categoryRowsMap = {
                electricity: electricityRows,
                water:       waterRows,
                fuel:        fuelRows,
                waste:       wasteRows,
            };
            const categoryEmojis = {
                electricity: '⚡',
                water:       '💧',
                fuel:        '⛽',
                waste:       '🗑️',
            };

            if (category === 'all') {
                // Upload all categories
                for (const cat of ['electricity', 'water', 'fuel', 'waste']) {
                    console.log(`${categoryEmojis[cat]} Uploading ${cat} to API`);
                    const res = await assessmentApi.upload(currentId, {
                        category: cat,
                        rows: categoryRowsMap[cat],
                    });
                    updatedAssessment = res.data?.assessment;
                }
            } else {
                // Upload only the selected category
                console.log(`${categoryEmojis[category]} Uploading ${category} to API`);
                const res = await assessmentApi.upload(currentId, {
                    category,
                    rows: categoryRowsMap[category],
                });
                updatedAssessment = res.data?.assessment;
            }

            // ── CHECKPOINT 3: Zustand hydration ──────────────────
            console.group('✅ Upload complete — hydrating store from API response');
            console.log('Category    :', category);
            console.log('File        :', file.name);
            console.log('Timestamp   :', new Date().toISOString());
            console.log('API Response:', updatedAssessment);
            console.groupEnd();

            if (updatedAssessment) {
                hydrateFromApi(updatedAssessment);
            }
            applyParserUnitFlagsToStore();
            {
                const s = useAssessmentStore.getState();
                s.setConsistencyWarnings(
                    runCrossCategoryConsistencyChecks({
                        electricityRows: s.rows,
                        wasteRows: s.wasteRows,
                        flags: s.flags,
                        refrigerantData: s.flags?.refrigerantData,
                    }),
                );
            }

            setLastUploaded({ category, fileName: file.name, timestamp: Date.now() });
            if (errors.length > 0) setUploadErrors(errors); // errors are already filtered in parser

        } catch (err) {
            // ── CHECKPOINT ERR: Parse failure ────────────────────
            console.group('❌ Upload failed');
            console.error('Error message :', err.message);
            console.error('Stack         :', err.stack);
            console.groupEnd();

            if (category === 'all') {
                ['electricity', 'water', 'fuel', 'waste'].forEach((c) =>
                    useAssessmentStore.getState().setUploadStatus(c, {
                        monthsUploaded: 0,
                        source: 'error',
                        parseFailed: true,
                    })
                );
            } else {
                useAssessmentStore.getState().setUploadStatus(category, {
                    monthsUploaded: 0,
                    source: 'error',
                    parseFailed: true,
                });
            }

            setUploadErrors([`Failed to parse file: ${err.message}`]);
        } finally {
            setUploading(false);
        }
    }, [hydrateFromApi]);

    return { handleFile, uploading, uploadErrors, lastUploaded };
}

export default useFileUpload;