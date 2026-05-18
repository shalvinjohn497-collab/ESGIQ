import { create } from 'zustand';

const useAssessmentStore = create((set) => ({
    step: 1,
    sector: null,
    rows: [],
    flags: {},
    waterRows: [],
    fuelRows: [],
    wasteRows: [],
    uploadStatus: {
        electricity: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
        water: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
        fuel: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
        waste: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
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

    hydrateFromApi: (data) => set(() => ({
        rows: data.rows?.length ? data.rows : [],
        waterRows: data.waterRows?.length ? data.waterRows : [],
        fuelRows: data.fuelRows?.length ? data.fuelRows : [],
        wasteRows: data.wasteRows?.length ? data.wasteRows : [],
        flags: data.flags && Object.keys(data.flags).length ? data.flags : {},
        uploadStatus: data.uploadStatus || {
            electricity: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
            water: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
            fuel: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
            waste: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
        },
        scores: data.scores && Object.keys(data.scores).length ? data.scores : {},
        assessmentId: data._id || null,
        sector: data.sector ?? null,
        uploadDuplicateResolution:
            data.uploadDuplicateResolution && typeof data.uploadDuplicateResolution === 'object'
                ? data.uploadDuplicateResolution
                : { electricity: null, water: null, fuel: null, waste: null },
        consistencyWarnings: Array.isArray(data.consistencyWarnings)
            ? [...data.consistencyWarnings]
            : [],
        insights:
            data.insights && typeof data.insights === 'object'
                ? {
                      strengths: Array.isArray(data.insights.strengths) ? [...data.insights.strengths] : [],
                      gaps: Array.isArray(data.insights.gaps) ? [...data.insights.gaps] : [],
                  }
                : { strengths: [], gaps: [] },
        certificationByFramework: Array.isArray(data.certificationByFramework)
            ? [...data.certificationByFramework]
            : [],
        regulatoryResults: Array.isArray(data.regulatoryResults)
            ? [...data.regulatoryResults]
            : [],
    })),

    resetAssessment: () =>
        set({
            step: 1,
            sector: null,
            rows: [],
            flags: {},
            waterRows: [],
            fuelRows: [],
            wasteRows: [],
            uploadStatus: {
                electricity: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
                water: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
                fuel: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
                waste: { monthsUploaded: 0, source: null, fileName: null, uploadedAt: null },
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