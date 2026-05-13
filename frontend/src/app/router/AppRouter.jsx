/**
 * AppRouter — since the app uses nav state (not URL routing), this is a
 * content router that selects the active page based on the nav state.
 */
export default function AppRouter({ nav, step, scores, rows, setRows, flags, setFlags, onStartWizard, onNext, onBack }) {
    // Lazy-loaded imports handled by Vite, but kept simple for now
    return { nav, step, scores, rows, setRows, flags, setFlags, onStartWizard, onNext, onBack };
}
