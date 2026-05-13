import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { C } from '@/theme/colors';

const PHASES = [
    'Analyzing ESG Metrics',
    'Computing Risk Exposure',
    'Generating Recommendations',
];

/**
 * ESGProcessingOverlay
 * Lightweight 1.2–1.8s orchestration sequence shown on first dashboard load.
 * Calls onComplete() when done so parent can fade in content.
 */
export default function ESGProcessingOverlay({ onComplete }) {
    const [phaseIndex, setPhaseIndex] = useState(0);

    useEffect(() => {
        // Each phase shows for ~500ms, total ~1.5s for 3 phases
        if (phaseIndex < PHASES.length - 1) {
            const t = setTimeout(() => setPhaseIndex(i => i + 1), 480);
            return () => clearTimeout(t);
        } else {
            // After last phase, wait briefly then complete
            const t = setTimeout(() => onComplete?.(), 400);
            return () => clearTimeout(t);
        }
    }, [phaseIndex, onComplete]);

    return (
        <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                backdropFilter: 'blur(6px)',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                {/* Minimal pulse indicator */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.18,
                                ease: 'easeInOut',
                            }}
                            style={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: C.green,
                            }}
                        />
                    ))}
                </div>

                {/* Phase label */}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={phaseIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="t-small"
                        style={{
                            color: 'var(--sub)',
                            letterSpacing: 0.5,
                            fontWeight: 450,
                        }}
                    >
                        {PHASES[phaseIndex]}
                    </motion.span>
                </AnimatePresence>

                {/* Progress track */}
                <div style={{ width: 140, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
                    <motion.div
                        style={{ height: '100%', background: C.green, borderRadius: 1 }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${((phaseIndex + 1) / PHASES.length) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
