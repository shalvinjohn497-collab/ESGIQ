import { Home, BarChart2, Award, FileText, Settings, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function Sidebar({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        { route: ROUTES.DASHBOARD, icon: <Home size={18} />, label: 'Dashboard' },
        { route: ROUTES.ASSESSMENT_UPLOAD, icon: <BarChart2 size={18} />, label: 'New Assessment' },
        { route: ROUTES.CERTIFICATIONS, icon: <Award size={18} />, label: 'Certifications' },
        { route: ROUTES.REPORTS, icon: <FileText size={18} />, label: 'Reports' },
        { route: ROUTES.SETTINGS, icon: <Settings size={18} />, label: 'Settings' },
    ];

    return (
        <div style={{
            width: 64,
            height: '100vh',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 24,
            paddingBottom: 24,
            gap: 4,
            flexShrink: 0,
        }}>
            {/* Logo mark */}
            <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: -0.5,
                marginBottom: 24,
            }}>
                ESG
            </div>

            {items.map((item) => {
                const active = location.pathname.startsWith(item.route);
                return (
                    <button
                        key={item.route}
                        onClick={() => navigate(item.route)}
                        title={item.label}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            border: 'none',
                            background: active ? 'rgba(16,185,129,0.08)' : 'transparent',
                            color: active ? '#10b981' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                            if (!active) {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.color = '#475569';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!active) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#94a3b8';
                            }
                        }}
                    >
                        {item.icon}
                    </button>
                );
            })}

            <div style={{ flex: 1 }} />

            <button
                onClick={onLogout}
                title="Logout"
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                }}
            >
                <LogOut size={18} />
            </button>
        </div>
    );
}