import { create } from 'zustand';
import {
    INIT_ROWS,
    INIT_FLAGS,
    INIT_WATER_ROWS,
    INIT_FUEL_ROWS,
    INIT_WASTE_ROWS,
} from '@/services/mock/assessment.mock';

const useAssessmentStore = create((set) => ({
    step: 1,
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

    setWaterRows: (waterRows) => set({ waterRows }),
    setFuelRows: (fuelRows) => set({ fuelRows }),
    setWasteRows: (wasteRows) => set({ wasteRows }),
    setUploadStatus: (category, status) =>
        set((s) => ({
            uploadStatus: { ...s.uploadStatus, [category]: status },
        })),

    resetAssessment: () =>
        set({
            step: 1,
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
        }),
}));

export default useAssessmentStore;
