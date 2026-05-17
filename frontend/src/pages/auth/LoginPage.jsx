import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { C } from '@/theme/colors';
import useAuthStore from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';
import { login, register } from '@/services/auth/auth.service';

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const authLogin = useAuthStore((state) => state.login);
    const [isRegister, setIsRegister] = useState(location.pathname === ROUTES.REGISTER);
    const [email, setEmail] = useState('admin@sunrise-hospital.com');
    const [pass, setPass] = useState('demo123');
    const [name, setName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [sector, setSector] = useState('Healthcare');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        
        try {
            let result;
            if (isRegister) {
                result = await register(name, email, pass, orgName, sector);
            } else {
                result = await login(email, pass);
            }
            
            if (result.success) {
                authLogin(result.token, result.user);
                navigate(ROUTES.DASHBOARD);
            } else {
                setError(result.error || 'Authentication failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        const nextReg = !isRegister;
        setIsRegister(nextReg);
        setError('');
        navigate(nextReg ? ROUTES.REGISTER : ROUTES.LOGIN);
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

                <h2 className="t-sub t-bold t-text mb-6">{isRegister ? 'Create Account' : 'Welcome back'}</h2>

                {error && (
                    <div style={{ 
                        padding: 'var(--sp-3)', 
                        marginBottom: 'var(--sp-4)',
                        background: 'rgba(255, 59, 48, 0.1)',
                        border: '1px solid rgba(255, 59, 48, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ff3b30',
                        fontSize: '13px'
                    }}>
                        {error}
                    </div>
                )}

                {isRegister && (
                    <>
                        <div className="mb-4">
                            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>FULL NAME</label>
                            <input 
                                className="input" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>ORGANIZATION</label>
                            <input 
                                className="input" 
                                value={orgName} 
                                onChange={(e) => setOrgName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>SECTOR</label>
                            <select 
                                className="input" 
                                value={sector} 
                                onChange={(e) => setSector(e.target.value)}
                                disabled={loading}
                            >
                                <option value="Healthcare">Healthcare</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Energy">Energy</option>
                                <option value="Retail">Retail</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </>
                )}

                <div className="mb-4">
                    <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>EMAIL</label>
                    <input 
                        className="input" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="mb-7">
                    <label className="t-label" style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>PASSWORD</label>
                    <input 
                        className="input" 
                        type="password" 
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()} 
                        disabled={loading}
                    />
                </div>

                <button 
                    className="btn btn-primary btn-lg w-full" 
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Loading...' : (isRegister ? 'Create Account →' : 'Sign In →')}
                </button>

                <p className="t-body t-center mt-5">
                    {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                    <span 
                        className="t-primary pointer t-bold" 
                        onClick={toggleMode}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {isRegister ? 'Sign In' : 'Register'}
                    </span>
                </p>
            </div>
        </div>
    );
}
