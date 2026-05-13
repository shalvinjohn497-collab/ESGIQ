/**
 * Routes configuration
 */
export const routesConfig = [
    { path: '/login', page: 'LoginPage', layout: 'auth', isPublic: true },
    { path: '/register', page: 'RegisterPage', layout: 'auth', isPublic: true },
    { path: '/dashboard', page: 'DashboardPage', layout: 'dashboard' },
    { path: '/assessment', page: 'AssessmentWizardPage', layout: 'dashboard' },
    { path: '/certifications', page: 'CertificationsPage', layout: 'dashboard' },
    { path: '/reports', page: 'ReportsPage', layout: 'dashboard' },
    { path: '/settings', page: 'SettingsPage', layout: 'dashboard' },
];

export default routesConfig;
