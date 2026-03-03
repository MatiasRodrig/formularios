import React from 'react';
import styles from './Spinner.module.css';

export const Spinner = ({ size = 'md', className = '' }) => {
    return (
        <div className={`${styles.spinner} ${styles[size]} ${className}`}></div>
    );
};
