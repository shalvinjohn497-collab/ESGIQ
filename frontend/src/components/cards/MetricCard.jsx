import { C } from '@/theme/colors';

export default function MetricCard({ label, value, sub, color, ok }) {
    return (
        <div className="card flex-col gap-2">
            <span className="t-caption" style={{ color: 'var(--dim)' }}>{label}</span>
            <span className="t-heading t-800" style={{ color: ok ? C.green : C.amber }}>{value}</span>
            <div className="flex items-center gap-2">
                <span className="t-caption" style={{ color: 'var(--dim)' }}>{sub}</span>
                <span style={{ fontSize: 10 }}>{ok ? '🟢' : '🟠'}</span>
            </div>
        </div>
    );
}
