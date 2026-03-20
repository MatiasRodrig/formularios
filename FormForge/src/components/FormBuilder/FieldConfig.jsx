import React from 'react';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { Plus, Trash2, Tag, Fingerprint } from 'lucide-react';
import styles from './FieldConfig.module.css';

export const FieldConfig = ({ field, onUpdate, allFields }) => {
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

    // How many other fields already have isTitleField set
    const titleFieldsUsed = (allFields || []).filter(
        f => f.id !== field.id && f.isTitleField
    ).length;

    const handleTitleToggle = (checked) => {
        if (checked) {
            // Assign next available order (1, 2, 3)
            const usedOrders = (allFields || [])
                .filter(f => f.id !== field.id && f.isTitleField)
                .map(f => f.titleOrder || 0);
            const nextOrder = [1, 2, 3].find(o => !usedOrders.includes(o)) || 1;
            onUpdate({ ...field, isTitleField: true, titleOrder: nextOrder });
        } else {
            onUpdate({ ...field, isTitleField: false, titleOrder: undefined });
        }
    };

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
                    label="Nombre de Variable (Actas)"
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

                {/* ─── TÍTULO DE CARGA ─── */}
                <div className={styles.specialSection}>
                    <div className={styles.specialHeader}>
                        <Tag size={14} />
                        <span>Título de Carga</span>
                    </div>
                    <p className={styles.specialDesc}>
                        Usa este campo como título visible de la carga (máx. 3 por formulario).
                    </p>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={field.isTitleField || false}
                            disabled={!field.isTitleField && titleFieldsUsed >= 3}
                            onChange={(e) => handleTitleToggle(e.target.checked)}
                        />
                        {!field.isTitleField && titleFieldsUsed >= 3
                            ? 'Límite de 3 títulos alcanzado'
                            : 'Usar como Título de Carga'}
                    </label>
                    {field.isTitleField && (
                        <div className={styles.titleOrderRow}>
                            <span className={styles.dataLabel}>Orden:</span>
                            {[1, 2, 3].map(order => {
                                const takenBy = (allFields || []).find(
                                    f => f.id !== field.id && f.isTitleField && f.titleOrder === order
                                );
                                return (
                                    <button
                                        key={order}
                                        type="button"
                                        className={`${styles.orderBtn} ${field.titleOrder === order ? styles.orderBtnActive : ''} ${takenBy ? styles.orderBtnTaken : ''}`}
                                        disabled={!!takenBy}
                                        onClick={() => !takenBy && handleChange('titleOrder', order)}
                                        title={takenBy ? `Usado por: ${takenBy.label}` : `Posición ${order}`}
                                    >
                                        {order}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── CLAVE DE PERFIL ─── */}
                <div className={styles.specialSection}>
                    <div className={styles.specialHeader}>
                        <Fingerprint size={14} />
                        <span>Clave de Perfil</span>
                    </div>
                    <p className={styles.specialDesc}>
                        Si varias cargas comparten el mismo valor en este campo, se agrupan en un perfil (ej: CUIL, N° Comercio, Patente).
                    </p>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={field.isProfileKey || false}
                            onChange={(e) => handleChange('isProfileKey', e.target.checked)}
                        />
                        Es Clave de Perfil
                    </label>
                    {field.isProfileKey && (
                        <div className={styles.profileOptions}>
                            <Input
                                label="Etiqueta del Perfil"
                                value={field.profileLabel || ''}
                                onChange={(e) => handleChange('profileLabel', e.target.value)}
                                placeholder="Ej: Persona, Comercio, Vehículo..."
                            />
                            <Input
                                label="Icono del Perfil (emoji)"
                                value={field.profileIcon || ''}
                                onChange={(e) => handleChange('profileIcon', e.target.value)}
                                placeholder="Ej: 👤 🏪 🚗"
                            />
                        </div>
                    )}
                </div>

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