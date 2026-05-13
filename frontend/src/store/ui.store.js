import { create } from 'zustand';

const useUIStore = create((set) => ({
    presentationMode: false,

    togglePresentation: () => set((s) => ({ presentationMode: !s.presentationMode })),
}));

export default useUIStore;
