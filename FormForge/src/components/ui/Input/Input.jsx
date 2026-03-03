import React from 'react';
import styles from './Input.module.css';

export const Input = ({ label, id, error, className = '', ...props }) => {
    const inputId = id || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
            <input
                id={inputId}
                className={`${styles.input} ${error ? styles.errorInput : ''}`}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export const Textarea = ({ label, id, error, className = '', ...props }) => {
    const inputId = id || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
            <textarea
                id={inputId}
                className={`${styles.input} ${styles.textarea} ${error ? styles.errorInput : ''}`}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
