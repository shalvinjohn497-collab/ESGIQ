import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/hooks/useToast';
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import AssessmentWizardPage from '@/pages/assessment/AssessmentWizardPage';
import CertificationsPage from '@/pages/certifications/CertificationsPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import ProtectedRoute from '@/app/ProtectedRoute';
import { ROUTES } from '@/constants/routes';

export default function App() {
    return (
        <>
            <ToastProvider />
            <Routes>
                <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<LoginPage />} />

                <Route
                    element={(
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    )}
                >
                    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                    <Route path={ROUTES.ASSESSMENT} element={<Navigate to={ROUTES.ASSESSMENT_UPLOAD} replace />} />
                    <Route path={ROUTES.ASSESSMENT_UPLOAD} element={<AssessmentWizardPage />} />
                    <Route path={ROUTES.ASSESSMENT_SUMMARY} element={<AssessmentWizardPage />} />
                    <Route path={ROUTES.ASSESSMENT_RESULTS} element={<AssessmentWizardPage />} />
                    <Route path={ROUTES.CERTIFICATIONS} element={<CertificationsPage />} />
                    <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
                    <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                </Route>
            </Routes>
        </>
    );
}
