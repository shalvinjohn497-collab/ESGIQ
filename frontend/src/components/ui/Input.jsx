import { C } from '@/theme/colors';

export default function Input({ label, value, onChange, type = 'text', variant = 'default', style, ...props }) {
    const variants = {
        default: {
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            color: C.text,
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
        },
        compact: {
            width: '100%',
            padding: '5px 8px',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: C.text,
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
        },
        field: {
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            color: C.text,
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
        },
    };

    return (
        <div>
            {label && (
                <label style={{ color: C.sub, fontSize: 11, display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                style={{ ...variants[variant], ...style }}
                {...props}
            />
        </div>
    );
}
