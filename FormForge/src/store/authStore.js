import { create } from 'zustand';

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        // Extract .NET claim for role if present
        const identityRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (identityRole) {
            payload.role = identityRole;
        }
        // Extract .NET claim for name (username)
        const identityName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        if (identityName) {
            payload.username = identityName;
        }
        // authStore.js — en la función parseJwt, agregar al final antes del return:
        const nameIdentifier = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        if (nameIdentifier) payload.userId = nameIdentifier;
        return payload;
    } catch (e) {
        return null;
    }
};

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('token') || null,
    user: null,
    role: null,
    username: null,

    initAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.exp * 1000 > Date.now()) {
                const role = payload.role || payload.Role;
                const username = payload.username || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || '';
                const userId = payload.userId || payload.nameid || payload.sub || null;
                set({ token, user: payload, role, username, userId });
            } else {
                localStorage.removeItem('token');
                set({ token: null, user: null, role: null, username: null });
            }
        }
    },

    login: (token) => {
        localStorage.setItem('token', token);
        const payload = parseJwt(token) || {};
        const role = payload.role || payload.Role;
        const username = payload.username || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || '';
        const userId = payload.userId || payload.nameid || payload.sub || null;
        set({ token, user: payload, role, username, userId });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, role: null, username: null });
    },
}));
