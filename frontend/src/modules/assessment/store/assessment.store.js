import { create } from 'zustand';
import {
    INIT_ROWS,
    INIT_FLAGS,
    INIT_WATER_ROWS,
    INIT_FUEL_ROWS,
    INIT_WASTE_ROWS,
} from '@/services/mock/assessment.mock';
import { DEFAULT_SECTOR } from '@/constants/sectors';

const useAssessmentStore = create((set) => ({
    step: 1,
    sector: DEFAULT_SECTOR,
    rows: INIT_ROWS.map((r) => ({ ...r })),
    flags: { ...INIT_FLAGS },
    waterRows: INIT_WATER_ROWS.map((r) => ({ ...r })),
    fuelRows: INIT_FUEL_ROWS.map((r) => ({ ...r })),
    wasteRows: INIT_WASTE_ROWS.map((r) => ({ ...r })),
    uploadStatus: {
        electricity: { monthsUploaded: 12, source: 'mock' },
        water: { monthsUploaded: 12, source: 'mock' },
        fuel: { monthsUploaded: 12, source: 'mock' },
        waste: { monthsUploaded: 12, source: 'mock' },
    },
    scores: {},
    assessmentId: null,
    uploadDuplicateResolution: {
        electricity: null,
        water: null,
        fuel: null,
        waste: null,
    },
    consistencyWarnings: [],

    insights: {
        strengths: [],
        gaps: [],
    },
    certificationByFramework: [],
    regulatoryResults: [],

    setStep: (step) => set({ step }),
    nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 3) })),
    prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

    setRows: (rows) => set({ rows }),
    updateRow: (index, field, value) =>
        set((s) => {
            const newRows = [...s.rows];
            newRows[index] = { ...newRows[index], [field]: Number(value) || 0 };
            return { rows: newRows };
        }),

    setFlags: (flags) => set({ flags }),
    updateFlag: (key, value) =>
        set((s) => ({ flags: { ...s.flags, [key]: value } })),

    setSector: (sector) => set({ sector }),

    setWaterRows: (waterRows) => set({ waterRows }),
    setFuelRows: (fuelRows) => set({ fuelRows }),
    setWasteRows: (wasteRows) => set({ wasteRows }),
    setUploadStatus: (category, status) =>
        set((s) => ({
            uploadStatus: { ...s.uploadStatus, [category]: status },
        })),

    setScores: (scores) => set({ scores }),
    setAssessmentId: (assessmentId) => set({ assessmentId }),

    setUploadDuplicateResolution: (partial) =>
        set((s) => ({
            uploadDuplicateResolution: { ...s.uploadDuplicateResolution, ...partial },
        })),

    setConsistencyWarnings: (consistencyWarnings) =>
        set({
            consistencyWarnings: Array.isArray(consistencyWarnings) ? [...consistencyWarnings] : [],
        }),

    setInsights: (payload) =>
        set({
            insights: {
                strengths: Array.isArray(payload?.strengths) ? [...payload.strengths] : [],
                gaps: Array.isArray(payload?.gaps) ? [...payload.gaps] : [],
            },
        }),

    setCertificationByFramework: (certificationByFramework) =>
        set({
            certificationByFramework: Array.isArray(certificationByFramework)
                ? [...certificationByFramework]
                : [],
        }),

    setRegulatoryResults: (regulatoryResults) =>
        set({
            regulatoryResults: Array.isArray(regulatoryResults) ? [...regulatoryResults] : [],
        }),

    hydrateFromApi: (data) => set((s) => ({
        rows: data.rows?.length ? data.rows : s.rows,
        waterRows: data.waterRows?.length ? data.waterRows : s.waterRows,
        fuelRows: data.fuelRows?.length ? data.fuelRows : s.fuelRows,
        wasteRows: data.wasteRows?.length ? data.wasteRows : s.wasteRows,
        flags: data.flags && Object.keys(data.flags).length ? data.flags : s.flags,
        uploadStatus: data.uploadStatus || s.uploadStatus,
        scores: data.scores && Object.keys(data.scores).length ? data.scores : s.scores,
        assessmentId: data._id ? data._id : s.assessmentId,
        sector: data.sector != null && data.sector !== '' ? data.sector : s.sector,
        uploadDuplicateResolution:
            data.uploadDuplicateResolution && typeof data.uploadDuplicateResolution === 'object'
                ? { ...s.uploadDuplicateResolution, ...data.uploadDuplicateResolution }
                : s.uploadDuplicateResolution,
        consistencyWarnings: Array.isArray(data.consistencyWarnings)
            ? [...data.consistencyWarnings]
            : s.consistencyWarnings,
        insights:
            data.insights && typeof data.insights === 'object'
                ? {
                      strengths: Array.isArray(data.insights.strengths) ? [...data.insights.strengths] : [],
                      gaps: Array.isArray(data.insights.gaps) ? [...data.insights.gaps] : [],
                  }
                : s.insights,
        certificationByFramework: Array.isArray(data.certificationByFramework)
            ? [...data.certificationByFramework]
            : s.certificationByFramework,
        regulatoryResults: Array.isArray(data.regulatoryResults)
            ? [...data.regulatoryResults]
            : s.regulatoryResults,
    })),

    resetAssessment: () =>
        set({
            step: 1,
            sector: DEFAULT_SECTOR,
            rows: INIT_ROWS.map((r) => ({ ...r })),
            flags: { ...INIT_FLAGS },
            waterRows: INIT_WATER_ROWS.map((r) => ({ ...r })),
            fuelRows: INIT_FUEL_ROWS.map((r) => ({ ...r })),
            wasteRows: INIT_WASTE_ROWS.map((r) => ({ ...r })),
            uploadStatus: {
                electricity: { monthsUploaded: 12, source: 'mock' },
                water: { monthsUploaded: 12, source: 'mock' },
                fuel: { monthsUploaded: 12, source: 'mock' },
                waste: { monthsUploaded: 12, source: 'mock' },
            },
            scores: {},
            assessmentId: null,
            uploadDuplicateResolution: {
                electricity: null,
                water: null,
                fuel: null,
                waste: null,
            },
            consistencyWarnings: [],
            insights: { strengths: [], gaps: [] },
            certificationByFramework: [],
            regulatoryResults: [],
        }),
}));

export default useAssessmentStore;
