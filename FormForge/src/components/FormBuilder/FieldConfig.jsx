import React from 'react';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { Plus, Trash2 } from 'lucide-react';
import styles from './FieldConfig.module.css';

export const FieldConfig = ({ field, onUpdate }) => {
    const handleChange = (key, value) => {
        onUpdate({ ...field, [key]: value });
    };

    const handleAddOption = () => {
        const opts = field.options || [];
        handleChange('options', [...opts, `Opción ${opts.length + 1}`]);
    };

    const handleUpdateOption = (index, val) => {
        const opts = [...field.options];
        opts[index] = val;
        handleChange('options', opts);
    };

    const handleRemoveOption = (index) => {
        const opts = field.options.filter((_, i) => i !== index);
        handleChange('options', opts);
    };

    const hasOptions = field.type === 'select' || field.type === 'radio';

    return (
        <div className={styles.config}>
            <div className={styles.header}>
                <h3>Configuración de Campo</h3>
            </div>

            <div className={styles.form}>
                <Input
                    label="Etiqueta / Pregunta"
                    value={field.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                />

                <Input
                    label="Nombre de Variable (Avanzado)"
                    value={field.variableName}
                    onChange={(e) => handleChange('variableName', e.target.value)}
                    placeholder="nombre_variable"
                />

                {['text', 'textarea', 'number'].includes(field.type) && (
                    <Input
                        label="Placeholder (Texto de ayuda)"
                        value={field.placeholder || ''}
                        onChange={(e) => handleChange('placeholder', e.target.value)}
                    />
                )}

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) => handleChange('required', e.target.checked)}
                    />
                    Campo Obligatorio
                </label>

                {hasOptions && (
                    <div className={styles.optionsSection}>
                        <div className={styles.optionsHeader}>
                            <h4 className={styles.optionsTitle}>Opciones</h4>
                            <Button variant="secondary" onClick={handleAddOption} className={styles.addBtn}>
                                <Plus size={16} /> Agregar
                            </Button>
                        </div>

                        <div className={styles.optionsList}>
                            {(field.options || []).map((opt, idx) => (
                                <div key={idx} className={styles.optionRow}>
                                    <Input
                                        value={opt}
                                        onChange={(e) => handleUpdateOption(idx, e.target.value)}
                                        className={styles.optionInput}
                                    />
                                    <Button variant="danger" onClick={() => handleRemoveOption(idx)} className={styles.removeBtn}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
