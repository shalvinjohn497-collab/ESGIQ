/**
 * Auth service — handles authentication logic
 */
export function login(email, password) {
    // Mock login
    return Promise.resolve({ success: true, user: { email } });
}

export function logout() {
    return Promise.resolve({ success: true });
}

export function isAuthenticated() {
    return false;
}
