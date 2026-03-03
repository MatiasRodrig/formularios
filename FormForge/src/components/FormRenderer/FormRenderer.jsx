import React from 'react';
import { Input, Textarea } from '../ui/Input/Input';
import { Select } from '../ui/Select/Select';
import styles from './FormRenderer.module.css';

export const FormRenderer = ({ schema, values, onChange, errors = {} }) => {
    const fields = schema?.fields || [];

    if (!fields.length) {
        return <div className={styles.empty}>El formulario no tiene campos configurados.</div>;
    }

    const handleChange = (fieldId, value) => {
        onChange({ ...values, [fieldId]: value });
    };

    const renderField = (field) => {
        const value = values[field.id] || '';
        const error = errors[field.id];
        const commonProps = {
            label: field.required ? `${field.label} *` : field.label,
            required: field.required,
            error,
            id: field.id
        };

        switch (field.type) {
            case 'text':
            case 'date':
            case 'number':
                return (
                    <Input
                        {...commonProps}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                );
            case 'textarea':
                return (
                    <Textarea
                        {...commonProps}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                );
            case 'select':
                return (
                    <Select
                        {...commonProps}
                        options={field.options || []}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                );
            case 'radio':
                return (
                    <div className={styles.group}>
                        <label className={styles.groupLabel}>{commonProps.label}</label>
                        <div className={styles.optionsWrap}>
                            {(field.options || []).map((opt, i) => (
                                <label key={i} className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name={field.id}
                                        value={opt}
                                        checked={value === opt}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                        {error && <span className={styles.errorText}>{error}</span>}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className={styles.group}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={value === true || value === 'true'}
                                onChange={(e) => handleChange(field.id, e.target.checked)}
                            />
                            {commonProps.label}
                        </label>
                        {error && <span className={styles.errorText}>{error}</span>}
                    </div>
                );
            default:
                return <div>Tipo de campo no soportado: {field.type}</div>;
        }
    };

    return (
        <div className={styles.renderer}>
            {fields.map((field) => (
                <div key={field.id} className={styles.fieldWrapper}>
                    {renderField(field)}
                </div>
            ))}
        </div>
    );
};
