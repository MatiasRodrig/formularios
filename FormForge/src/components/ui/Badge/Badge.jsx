import React from 'react';
import styles from './Badge.module.css';

// variant can be primary, success, warning, error, default
export const Badge = ({ children, variant = 'default', className = '' }) => {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className}`}>
            {children}
        </span>
    );
};
