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
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
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
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      background: '#ffffff',
      overflow: 'hidden',
    }}>

      {/* ── LEFT PANEL: SUSTAINABILITY INTEL HUB (50%) ── */}
      <div style={{
        width: '50%',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 48px',
        position: 'relative',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}>
        {/* Elite Fine Executive Grid Mask */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(to right, #f8fafc 1px, transparent 1px), linear-gradient(to bottom, #f8fafc 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.85,
          pointerEvents: 'none',
        }} />

        {/* Corporate Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 5 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 12, color: '#ffffff', letterSpacing: 0.5
          }}>ESG</div>
          <div>
            <span style={{
              fontSize: 18, fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.03em', display: 'block', lineHeight: 1.1,
            }}>ESGIQ</span>
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#10b981',
              letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginTop: 2
            }}>Intelligence Platform</span>
          </div>
        </div>

        {/* Central Component: Live Hospital ESG Asset Performance Monitor */}
        <div style={{ position: 'relative', zIndex: 5, width: '100%', margin: 'auto 0', padding: '24px 0' }}>
          
          {/* Executive Architecture Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#f0fdf4', border: '1px solid #d1fae5',
            borderRadius: 4, padding: '5px 10px', marginBottom: 16,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
            <span style={{
              fontSize: 9.5, fontWeight: 700, color: '#047857',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Audit-Grade ESG Analysis</span>
          </div>

          <h1 style={{
            fontSize: 32, fontWeight: 800, color: '#0f172a',
            lineHeight: 1.25, letterSpacing: '-0.02em', margin: '0 0 24px',
          }}>
            Turn Operational Data Into <span style={{
              background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>ESG Intelligence.</span>
          </h1>

          {/* Interactive Strategic Interactive Monitor Viewport */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '24px',
            boxShadow: '0 12px 40px rgba(15,23,42,0.03)',
            position: 'relative',
          }}>
            {/* Asset Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Active Facility Blueprint</span>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>Healthcare Infrastructure Hub</h3>
              </div>
              <div style={{ padding: '4px 8px', background: '#ecfdf5', borderRadius: 4, fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                94.2 Score
              </div>
            </div>

            {/* Dynamic Animated Status Bars Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Medical Waste Transformation Index', val: '88%', col: '#10b981', target: 'Bio-Accredited' },
                { label: 'Scope 2 Real-Time Emission Target', val: '91%', col: '#34d399', target: 'LEED HC Compliant' },
                { label: 'Wastewater Treatment (STP Tracking)', val: '76%', col: '#10b981', target: 'NABH Baseline' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{item.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{item.target}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ 
                      width: item.val, 
                      height: '100%', 
                      background: item.col, 
                      borderRadius: 10,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Micro Indicator Tickers */}
            <div style={{ display: 'flex', gap: 16, marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>12+</span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Frameworks</span>
              </div>
              <div style={{ borderRight: '1px solid #e2e8f0' }} />
              <div>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: '#10b981' }}>Pure Light</span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Theme Space</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Notice */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
            Indicative intelligence only. Does not replace official certification audits, regulatory reviews, or legal compliance advice. All scores are indicative only.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: FORMS MATRIX WITH COMPACT VERTICAL FLOW (50%) ── */}
      <div style={{
        width: '50%',
        height: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Vertically centers the stack to completely fix empty bottom space
        boxSizing: 'border-box',
      }}>
        
        {/* Header Block Container */}
        <div style={{ padding: '0px 64px 20px 64px', flexShrink: 0 }}>
          <p style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#10b981', margin: '0 0 6px'
          }}>
            {isRegister ? 'New Account' : 'Secure Access'}
          </p>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: '#0f172a',
            letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.15
          }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            {isRegister
              ? 'Set up your organisation profile to begin your first ESG assessment.'
              : 'Sign in to access your sustainability intelligence dashboard.'}
          </p>
          
          <div style={{ height: 1, width: '100%', background: '#e2e8f0', marginTop: 20 }} />
        </div>

        {/* Dynamic Fields Scroll Area */}
        <div style={{
          overflowY: 'auto',
          padding: '4px 64px',
          boxSizing: 'border-box',
          maxHeight: 'calc(100vh - 340px)' // Constrains height so it packs neatly with buttons
        }}>
          <div style={{ width: '100%' }}>
            {error && (
              <div style={{
                padding: '12px 16px', marginBottom: 16,
                background: '#fef2f2', border: '1px solid #fee2e2',
                borderRadius: 8, color: '#dc2626', fontSize: 13
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {isRegister && (
                <>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading}
                      placeholder="Dr. Priya Sharma" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Organisation</label>
                    <input
                      type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={loading}
                      placeholder="Sunrise Hospital" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Sector</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={sector} onChange={(e) => setSector(e.target.value)} disabled={loading}
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                        onFocus={handleFocus} onBlur={handleBlur}
                      >
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Energy">Energy</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                      </select>
                      <div style={{
                        position: 'absolute', right: 14, top: '50%',
                        transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: 11
                      }}>▾</div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                  placeholder="admin@organisation.com" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" value={pass} onChange={(e) => setPass(e.target.value)} disabled={loading}
                  placeholder="••••••••" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Bottom Controls (Tuck right below input rows smoothly) */}
        <div style={{
          padding: '20px 64px 0px 64px',
          background: '#ffffff',
          flexShrink: 0,
        }}>
          <div style={{ width: '100%' }}>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '13px 24px',
                background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                color: loading ? '#94a3b8' : '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.2,
                boxShadow: loading ? 'none' : '0 4px 14px rgba(16,185,129,0.18)',
                transition: 'all 0.15s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.28)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.18)';
                }
              }}
            >
              {loading ? 'Please wait…' : (isRegister ? 'Create Account →' : 'Sign In →')}
            </button>

            <p style={{
              textAlign: 'center', fontSize: 13.5, color: '#94a3b8', marginTop: 14, marginBottom: 0
            }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <span
                onClick={() => !loading && toggleMode()}
                style={{
                  color: '#10b981', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  textDecoration: 'underline', textUnderlineOffset: '3px'
                }}
              >
                {isRegister ? 'Sign In' : 'Register'}
              </span>
            </p>

            {/* Trust Matrix Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 24 }}>
              {['🔒 Secured', '📋 Audit-grade', '🌿 ESG-native'].map((badge) => (
                <span key={badge} style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>{badge}</span>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#94a3b8',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  fontSize: 14,
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const handleFocus = (e) => {
  e.target.style.borderColor = '#10b981';
  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.06)';
};

const handleBlur = (e) => {
  e.target.style.borderColor = '#cbd5e1';
  e.target.style.boxShadow = 'none';
};

