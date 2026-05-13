import { C } from '@/theme/colors';

export default function ValidationAlert({ type = 'info', children }) {
    const config = {
        info: { color: C.blue, bg: C.bDim },
        warning: { color: C.amber, bg: C.aDim },
        error: { color: C.rose, bg: C.rDim },
        success: { color: C.green, bg: C.gDim },
    };
    const c = config[type] || config.info;
    return (
        <div className="card-sm mb-4" style={{ borderColor: c.color + '30', background: c.bg }}>
            <p className="t-small" style={{ color: c.color, lineHeight: 1.5 }}>{children}</p>
        </div>
    );
}
