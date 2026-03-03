import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { token, role } = useAuthStore();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Or a 'Not Found / Forbidden' page
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
