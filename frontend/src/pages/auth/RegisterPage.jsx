import { useState } from 'react';
import { C } from '@/theme/colors';

/**
 * RegisterPage — standalone registration screen
 */
export default function RegisterPage({ onRegister }) {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');

    const inp = {
        width: '100%', padding: '10px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${C.border}`,
        borderRadius: 10, color: C.text, fontSize: 14,
        outline: 'none', boxSizing: 'border-box',
    };

    return (
        <div style={{
            minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative',
        }}>
            <div style={{ position: 'absolute', width: 700, height: 700, background: 'radial-gradient(circle,rgba(0,255,136,0.07) 0%,transparent 65%)', top: -200, right: -200, pointerEvents: 'none' }} />
            <div style={{
                width: 400, padding: 40, background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 20,
                backdropFilter: 'blur(16px)', position: 'relative',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#050a0e', fontWeight: 900, fontSize: 16,
                        }}>ESG</div>
                        <span style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>ESGIQ</span>
                    </div>
                    <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>Create your account</p>
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: C.sub, fontSize: 11, display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>FULL NAME</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} style={inp} />
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: C.sub, fontSize: 11, display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>EMAIL</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
                </div>
                <div style={{ marginBottom: 28 }}>
                    <label style={{ color: C.sub, fontSize: 11, display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>PASSWORD</label>
                    <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} style={inp} />
                </div>
                <button onClick={onRegister} style={{
                    width: '100%', padding: 13, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
                    color: '#05090c', fontWeight: 700, fontSize: 15,
                }}>Create Account →</button>
            </div>
        </div>
    );
}
