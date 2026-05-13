import { motion } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useUIStore from '@/store/ui.store';
import useAuthStore from '@/store/auth.store';
import { useScrollToTop } from '@/hooks/useScrollToTop';


export default function DashboardLayout() {
    const { presentationMode } = useUIStore();
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const onLogout = () => {
        logout();
        navigate('/login');
    };
    useScrollToTop();

    return (
        <div className="flex" style={{ height: '100vh' }}>
            {/* Sidebar — collapses in presentation mode */}
            <motion.div
                animate={{ width: presentationMode ? 0 : undefined, opacity: presentationMode ? 0 : 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden', flexShrink: 0 }}
            >
                <Sidebar onLogout={onLogout} />
            </motion.div>

            <div className="flex-col flex-1" style={{ minWidth: 0 }}>
                {/* Topbar — only shown in wizard (or always for presentation toggle) */}
                <Topbar />

                <div
                    id="main-scroll"
                    className="flex-1 overflow-y"
                    style={{
                         
                        height: 'calc(100vh - 48px)',
                        maxWidth: presentationMode ? 1200 : undefined,
                        margin: presentationMode ? '0 auto' : undefined,
                        width: '100%',
                        transition: 'max-width 0.3s ease, padding 0.3s ease',
                        paddingLeft: presentationMode ? 'var(--sp-8)' : undefined,
                        paddingRight: presentationMode ? 'var(--sp-8)' : undefined,
                    }}
                >
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
