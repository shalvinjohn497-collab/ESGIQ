import { C } from '@/theme/colors';

export default function GlassCard({ children, style, highlight, onClick, ...props }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: C.surface,
                border: `1px solid ${highlight ? C.borderG : C.border}`,
                borderRadius: 16,
                padding: 22,
                backdropFilter: 'blur(16px)',
                cursor: onClick ? 'pointer' : undefined,
                transition: 'border-color 0.2s',
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
}
