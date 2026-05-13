import { C } from '@/theme/colors';
import ProgressBar from '@/components/indicators/ProgressBar';
import { getMaturityLabel } from '@/utils/score.utils';

export default function StatusCard({ name, score, color }) {
    return (
        <div className="card flex-col gap-3">
            <div className="flex-between">
                <span className="t-caption t-bold" style={{ color }}>{name}</span>
                <span className="badge" style={{ background: color + '18', color, fontSize: 10 }}>
                    {getMaturityLabel(score)}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <span className="t-sub t-800 t-text">{score}</span>
                <span className="t-caption t-dim">/ 100</span>
            </div>
            <ProgressBar value={score} color={color} />
        </div>
    );
}
