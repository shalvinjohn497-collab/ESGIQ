import { C } from '@/theme/colors';

/**
 * ScoreRing – SVG circular progress indicator
 */
export default function ScoreRing({ score, size = 110, strokeWidth = 10, color = C.green, children }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
        <div className="relative flex-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="var(--surface3)" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s var(--ease)' }} />
            </svg>
            <div className="absolute flex-center" style={{ inset: 0 }}>
                {children}
            </div>
        </div>
    );
}
