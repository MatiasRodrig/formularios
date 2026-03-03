import React, { useState } from 'react';
import { FieldCard } from './FieldCard';
import styles from './FormCanvas.module.css';

export const FormCanvas = ({ fields, selectedFieldId, onSelect, onDelete, setFields }) => {
    const [draggedIdx, setDraggedIdx] = useState(null);

    if (fields.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.dropZoneArea}>
                    Arrastre elementos aquí para construir su formulario
                </div>
            </div>
        );
    }

    const handleDragStartItem = (e, index) => {
        setDraggedIdx(index);
        // Needed for Firefox
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOverItem = (e, index) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === index) return;

        // Simple swap
        const newFields = [...fields];
        const draggedItem = newFields[draggedIdx];
        newFields.splice(draggedIdx, 1);
        newFields.splice(index, 0, draggedItem);

        setFields(newFields);
        setDraggedIdx(index);
    };

    const handleDragEndItem = () => {
        setDraggedIdx(null);
    };

    return (
        <div className={styles.canvas}>
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className={`${styles.fieldWrapper} ${draggedIdx === index ? styles.dragging : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStartItem(e, index)}
                    onDragOver={(e) => handleDragOverItem(e, index)}
                    onDragEnd={handleDragEndItem}
                    onClick={() => onSelect(field)}
                >
                    <FieldCard
                        field={field}
                        isSelected={selectedFieldId === field.id}
                        onDelete={() => onDelete(field.id)}
                    />
                </div>
            ))}
            <div className={styles.dropPad}>
                Espacio para agregar más campos...
            </div>
        </div>
    );
};
