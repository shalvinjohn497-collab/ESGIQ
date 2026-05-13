import { C } from '@/theme/colors';

export default function LoadingScreen() {
    return (
        <div style={{
            minHeight: '100vh', background: C.bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#050a0e', fontWeight: 900, fontSize: 18, margin: '0 auto 16px',
                    animation: 'pulse 1.5s infinite',
                }}>
                    ESG
                </div>
                <p style={{ color: C.sub, fontSize: 13 }}>Loading...</p>
            </div>
        </div>
    );
}
