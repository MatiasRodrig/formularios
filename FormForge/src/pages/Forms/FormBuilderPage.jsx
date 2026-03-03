import React, { useState } from 'react';
import { FieldPalette } from '../../components/FormBuilder/FieldPalette';
import { FormCanvas } from '../../components/FormBuilder/FormCanvas';
import { FieldConfig } from '../../components/FormBuilder/FieldConfig';
import { Button } from '../../components/ui/Button/Button';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './FormBuilderPage.module.css';

export const FormBuilderPage = () => {
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);

    const handleAddField = (fieldData) => {
        const newField = {
            ...fieldData,
            id: crypto.randomUUID(),
            label: fieldData.label,
            variableName: `var_${Date.now()}`
        };
        setFields((prev) => [...prev, newField]);
        setSelectedField(newField);
    };

    const handleUpdateField = (updatedField) => {
        setFields((prev) => prev.map((f) => f.id === updatedField.id ? updatedField : f));
        setSelectedField(updatedField);
    };

    const handleDeleteField = (id) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
        if (selectedField?.id === id) setSelectedField(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/json');
        if (type) {
            try {
                const fieldData = JSON.parse(type);
                handleAddField(fieldData);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const renderConfig = () => {
        if (!selectedField) {
            return (
                <div className={styles.emptyConfig}>
                    Seleccione un campo para configurarlo
                </div>
            );
        }
        return <FieldConfig field={selectedField} onUpdate={handleUpdateField} />;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <Button variant="ghost" onClick={() => navigate('/forms')} className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className={styles.title}>Constructor de Formulario</h1>
                </div>
                <Button onClick={() => console.log({ fields })}>
                    <Save size={18} />
                    Guardar
                </Button>
            </header>

            <div className={styles.builderGrid}>
                <div className={styles.sidebar}>
                    <FieldPalette />
                </div>

                <div
                    className={styles.canvasContainer}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <FormCanvas
                        fields={fields}
                        selectedFieldId={selectedField?.id}
                        onSelect={setSelectedField}
                        onDelete={handleDeleteField}
                        setFields={setFields}
                    />
                </div>

                <div className={styles.configPanel}>
                    {renderConfig()}
                </div>
            </div>
        </div>
    );
};
