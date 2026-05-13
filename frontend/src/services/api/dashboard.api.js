import { apiGet } from './client';

export async function fetchDashboardData() {
    return apiGet('/dashboard');
}
