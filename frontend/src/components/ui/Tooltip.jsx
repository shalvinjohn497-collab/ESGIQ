import { C } from '@/theme/colors';

export default function Tooltip({ text, children }) {
    return (
        <div style={{ position: 'relative', display: 'inline-block' }} className="tooltip-wrapper">
            {children}
            <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                padding: '4px 8px', background: '#0d1a24', border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.sub, fontSize: 11, whiteSpace: 'nowrap',
                pointerEvents: 'none', opacity: 0, transition: 'opacity 0.2s', marginBottom: 4,
            }}>
                {text}
            </div>
        </div>
    );
}
