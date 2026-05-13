import { CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import useUIStore from '@/store/ui.store';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';

export default function Topbar() {
    const steps = [
        { n: 1, label: 'Data Upload' },
        { n: 2, label: 'Summary & Validation' },
        { n: 3, label: 'Readiness Results' },
    ];

    const { presentationMode, togglePresentation } = useUIStore();
    const step = useAssessmentStore((state) => state.step);

    return (
        <div style={{
            height: 52,
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 24,
            paddingRight: 24,
            flexShrink: 0,
        }}>
            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {steps.map((s, i) => {
                    const done = s.n < step;
                    const current = s.n === step;
                    return (
                        <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {i > 0 && (
                                <div style={{
                                    width: 32,
                                    height: 1,
                                    background: done ? '#10b981' : '#e2e8f0',
                                }} />
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    background: done ? '#10b981' : current ? 'rgba(16,185,129,0.08)' : 'transparent',
                                    border: `1.5px solid ${done || current ? '#10b981' : '#e2e8f0'}`,
                                    color: done ? '#fff' : current ? '#10b981' : '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}>
                                    {done ? <CheckCircle size={13} /> : s.n}
                                </div>
                                <span style={{
                                    fontSize: 12,
                                    fontWeight: current ? 600 : 400,
                                    color: current ? '#0f172a' : done ? '#475569' : '#94a3b8',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {s.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Presentation toggle */}
            <button
                onClick={togglePresentation}
                title={presentationMode ? 'Exit Presentation Mode' : 'Presentation Mode'}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: `1px solid ${presentationMode ? 'rgba(16,185,129,0.3)' : '#e2e8f0'}`,
                    background: presentationMode ? 'rgba(16,185,129,0.06)' : 'transparent',
                    color: presentationMode ? '#10b981' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    transition: 'all 0.15s ease',
                }}
            >
                {presentationMode
                    ? <><Minimize2 size={12} /> EXIT PRESENT</>
                    : <><Maximize2 size={12} /> PRESENT</>}
            </button>
        </div>
    );
}