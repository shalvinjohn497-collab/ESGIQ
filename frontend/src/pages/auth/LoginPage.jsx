import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { C } from '@/theme/colors';
import useAuthStore from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [reg, setReg] = useState(location.pathname === ROUTES.REGISTER);
    const [email, setEmail] = useState('admin@sunrise-hospital.com');
    const [pass, setPass] = useState('demo123');
    const handleSubmit = () => {
        login();
        navigate(ROUTES.DASHBOARD);
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
            <div className="glow-green" style={{ top: -200, right: -200 }} />
            <div className="glow-blue" style={{ bottom: -150, left: -150 }} />

            <div className="card animate-in" style={{ width: 400, padding: 'var(--sp-10)', borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(16px)' }}>
                {/* Logo */}
                <div className="t-center mb-7">
                    <div className="flex-center gap-3 mb-2" style={{ justifyContent: 'center' }}>
                        <div className="sidebar-logo">ESG</div>
                        <span className="t-display t-800 t-text" style={{ letterSpacing: -0.5 }}>ESGIQ</span>
                    </div>
                    <p className="t-body">Sustainability Intelligence Platform</p>
                </div>

                <h2 className="t-sub t-bold t-text mb-6">{reg ? 'Create Account' : 'Welcome back'}</h2>

                <div className="mb-4">
                    <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>EMAIL</label>
                    <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="mb-7">
                    <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>PASSWORD</label>
                    <input className="input" type="password" value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
                </div>

                <button className="btn btn-primary btn-lg w-full" onClick={handleSubmit}>
                    {reg ? 'Create Account →' : 'Sign In →'}
                </button>

                <p className="t-body t-center mt-5">
                    {reg ? 'Already have an account? ' : "Don't have an account? "}
                    <span className="t-primary pointer t-bold" onClick={() => {
                        const nextReg = !reg;
                        setReg(nextReg);
                        navigate(nextReg ? ROUTES.REGISTER : ROUTES.LOGIN);
                    }}>
                        {reg ? 'Sign In' : 'Register'}
                    </span>
                </p>
            </div>
        </div>
    );
}
