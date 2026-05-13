import { C } from '@/theme/colors';

export default function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#0d1a24',
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 28,
                    minWidth: 400,
                    maxWidth: 600,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>{title}</h3>
                )}
                {children}
            </div>
        </div>
    );
}
