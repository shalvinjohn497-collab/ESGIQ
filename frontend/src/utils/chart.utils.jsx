import { C } from '@/theme/colors';

export function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="card-sm" style={{ padding: '8px 12px' }}>
            <p className="t-caption mb-1" style={{ color: 'var(--sub)' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="t-body t-bold" style={{ color: p.color || C.green }}>
                    {Number(p.value).toLocaleString()}
                </p>
            ))}
        </div>
    );
}

export const AREA_GRADIENT_ID = 'sg';

export function createGradientDef(id, color, startOpacity = 0.25, endOpacity = 0) {
    return { id, color, startOpacity, endOpacity };
}
