export const appConfig = {
    appName: 'ESGIQ',
    tagline: 'Sustainability Intelligence Platform',
    version: '1.0.0',
    api: {
        baseUrl: import.meta.env.VITE_API_URL || '/api',
        timeout: 30000,
    },
};

export default appConfig;
