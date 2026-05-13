import ScoreRing from '@/components/indicators/ScoreRing';
import { C } from '@/theme/colors';

export default function ReadinessGauge({ score, color, label }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <ScoreRing score={score} size={80} strokeWidth={8} color={color}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color }}>{score}%</div>
                </div>
            </ScoreRing>
            {label && <span style={{ color: C.sub, fontSize: 11 }}>{label}</span>}
        </div>
    );
}
