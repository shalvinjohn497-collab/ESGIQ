import { C } from '@/theme/colors';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function ValidationPanel({ validations }) {
    return (
        <div className="flex-col gap-2">
            {validations.map((v, i) => {
                const icon = v.pass
                    ? <CheckCircle size={16} style={{ color: C.green, flexShrink: 0 }} />
                    : v.warn
                        ? <AlertTriangle size={16} style={{ color: C.amber, flexShrink: 0 }} />
                        : <XCircle size={16} style={{ color: C.rose, flexShrink: 0 }} />;
                return (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: v.pass ? 'transparent' : 'var(--surface2)' }}>
                        {icon}
                        <span className="t-small" style={{ color: v.pass ? 'var(--sub)' : 'var(--text)' }}>{v.check}</span>
                        <span className="t-micro" style={{ color: 'var(--dim)', marginLeft: 'auto' }}>
                            {v.pass ? 'Pass' : v.warn ? 'Warning' : 'Fail'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
