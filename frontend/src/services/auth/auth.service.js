import client from '../api/client.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Auth service — handles authentication logic
 */
export function login(email, password) {
    return fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    .then(res => {
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    })
    .then(data => ({
        success: true,
        token: data.token,
        user: data.user,
    }))
    .catch(err => ({
        success: false,
        error: err.message,
    }));
}

export function register(name, email, password, orgName = '', sector = 'Healthcare') {
    return fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, orgName, sector }),
    })
    .then(res => {
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    })
    .then(data => ({
        success: true,
        token: data.token,
        user: data.user,
    }))
    .catch(err => ({
        success: false,
        error: err.message,
    }));
}

export function logout() {
    return Promise.resolve({ success: true });
}

export function isAuthenticated() {
    try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            return !!parsed?.state?.token;
        }
    } catch {}
    return false;
}
