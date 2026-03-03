import React from 'react';
import styles from './Select.module.css';

export const Select = ({ label, id, error, options = [], className = '', ...props }) => {
    const selectId = id || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
            <select
                id={selectId}
                className={`${styles.select} ${error ? styles.errorSelect : ''}`}
                {...props}
            >
                <option value="" disabled>Seleccione una opción...</option>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value || opt}>{opt.label || opt}</option>
                ))}
            </select>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
