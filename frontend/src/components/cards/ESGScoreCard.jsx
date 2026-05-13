import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { C } from '@/theme/colors';
import ScoreRing from '@/components/indicators/ScoreRing';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Count-up hook: animates from 0 → target over `duration` ms.
 * Only runs when `active` is true (after overlay resolves).
 */
function useCountUp(target, duration = 900, active = true) {
    const [display, setDisplay] = useState(active ? 0 : target);

    useEffect(() => {
        if (!active) {
            setDisplay(target);
            return;
        }
        setDisplay(0);
        const steps = 40;
        const interval = duration / steps;
        let step = 0;
        const t = setInterval(() => {
            step++;
            setDisplay(Math.round((target / steps) * step));
            if (step >= steps) clearInterval(t);
        }, interval);
        return () => clearInterval(t);
    }, [target, duration, active]);

    return display;
}

export default function ESGScoreCard({ score, ringColor, delta, animated = true }) {
    const deltaNum = delta ? parseInt(delta) : 0;
    const isUp = deltaNum >= 0;
    const displayScore = useCountUp(score, 900, animated);

    return (
        <div className="flex-col items-center gap-2" style={{ justifyContent: 'center' }}>
            <ScoreRing score={score} size={150} strokeWidth={11} color={ringColor}>
                <div className="t-center" style={{ marginTop: -2 }}>
                    <div className="t-800" style={{ fontSize: 48, lineHeight: 1, color: ringColor, letterSpacing: -1 }}>
                        {displayScore}
                    </div>
                    <div className="t-micro" style={{ color: 'var(--dim)', marginTop: 2 }}>/ 100</div>
                </div>
            </ScoreRing>

            {delta && (
                <motion.div
                    className="flex-center gap-1 mt-2"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                >
                    {isUp ? <TrendingUp size={12} style={{ color: C.green }} /> : <TrendingDown size={12} style={{ color: C.rose }} />}
                    <span className="t-small t-bold" style={{ color: isUp ? C.green : C.rose }}>
                        {isUp ? '+' : ''}{delta} pts
                    </span>
                </motion.div>
            )}
        </div>
    );
}
