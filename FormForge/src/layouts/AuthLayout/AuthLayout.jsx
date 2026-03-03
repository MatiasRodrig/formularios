import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import styles from './AuthLayout.module.css';
import { useAuthStore } from '../../store/authStore';

export const AuthLayout = () => {
    const { token } = useAuthStore();

    // If already authenticated, redirect to app
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className={styles.layout}>
            <div className={styles.container}>
                <Outlet />
            </div>
        </div>
    );
};
