import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { C } from '@/theme/colors';

/**
 * Enterprise Toast Notification System Hook
 * Simple, minimalist, no external dependencies.
 */
let observers = [];

const notifyObservers = (msg) => {
    observers.forEach(obs => obs(msg));
};

export const showToast = (message, type = 'info') => {
    notifyObservers({ id: Date.now(), message, type });
};

export function ToastProvider() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (msg) => {
            setToasts(prev => [...prev, msg]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== msg.id));
            }, 3000);
        };
        observers.push(handler);
        return () => {
            observers = observers.filter(obs => obs !== handler);
        };
    }, []);

    if (toasts.length === 0) return null;

    return createPortal(
        <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
            {toasts.map(toast => (
                <div key={toast.id} className="animate-in" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text)'
                }}>
                    <span style={{ color: toast.type === 'info' ? C.blue : toast.type === 'success' ? C.green : C.amber }}>
                        {toast.type === 'info' ? 'ℹ' : toast.type === 'success' ? '✓' : '⚠'}
                    </span>
                    {toast.message}
                </div>
            ))}
        </div>,
        document.body
    );
}

export function useToast() {
    return { showToast };
}

export default useToast;
