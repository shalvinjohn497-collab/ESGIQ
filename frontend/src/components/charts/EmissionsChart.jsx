import { C } from '@/theme/colors';

export default function EmissionsChart({ scope1, scope2, scope3, totalEm }) {
    const max = Math.max(scope1, scope2, scope3, 1);
    const scopes = [
        { label: 'Scope 1', value: scope1, color: C.orange, desc: 'Fuel combustion' },
        { label: 'Scope 2', value: scope2, color: C.rose, desc: 'Grid electricity' },
        { label: 'Scope 3', value: scope3, color: C.violet, desc: 'Indirect estimates' },
    ];

    return (
        <div className="card flex-col gap-4">
            <span className="t-micro" style={{ color: 'var(--dim)' }}>EMISSIONS</span>
            <div>
                <span className="t-heading t-800 t-text">{totalEm}</span>
                <span className="t-caption" style={{ color: 'var(--sub)', marginLeft: 6 }}>tCO₂e/yr</span>
            </div>
            <div className="flex-col gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)' }}>
                {scopes.map((s) => (
                    <div key={s.label} className="flex-col gap-1">
                        <div className="flex-between">
                            <span className="t-caption" style={{ color: 'var(--dim)' }}>{s.label}</span>
                            <span className="t-small t-bold" style={{ color: s.color }}>{s.value}</span>
                        </div>
                        <div className="progress-track" style={{ height: 3 }}>
                            <div className="progress-fill" style={{ width: `${(s.value / max) * 100}%`, background: s.color }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
