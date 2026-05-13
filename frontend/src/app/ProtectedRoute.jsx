import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';

export default function ProtectedRoute({ children }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }
    return children;
}
