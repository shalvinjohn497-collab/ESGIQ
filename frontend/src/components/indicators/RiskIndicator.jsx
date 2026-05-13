import { C } from '@/theme/colors';

export default function RiskIndicator({ level = 'low', label }) {
    const config = {
        low: { color: C.green, bg: C.gDim, text: 'Low Risk' },
        medium: { color: C.amber, bg: C.aDim, text: 'Moderate Risk' },
        high: { color: C.rose, bg: C.rDim, text: 'High Risk' },
        critical: { color: C.red, bg: C.redDim, text: 'Critical' },
    };
    const c = config[level] || config.low;
    return (
        <div className="badge" style={{ background: c.bg, color: c.color }}>
            <span style={{ fontSize: 8 }}>●</span>
            {label || c.text}
        </div>
    );
}
