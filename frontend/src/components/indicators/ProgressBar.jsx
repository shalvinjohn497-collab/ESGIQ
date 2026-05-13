import { motion } from 'framer-motion';

/**
 * Animated ProgressBar — smooth width transition from 0% on first mount.
 * Falls back to instant display when `animated` is false (pre-overlay).
 */
export default function ProgressBar({ value, color = 'var(--primary)', height = 4, animated = true }) {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <div className="progress-track" style={{ height }}>
            {animated ? (
                <motion.div
                    className="progress-fill"
                    initial={{ width: '0%' }}
                    animate={{ width: `${clampedValue}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
                    style={{ background: color }}
                />
            ) : (
                <div className="progress-fill" style={{ width: `${clampedValue}%`, background: color }} />
            )}
        </div>
    );
}
