import React from 'react';
import { Type, Hash, AlignLeft, List, Calendar, CheckSquare, CircleDot, GripVertical, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge/Badge';
import { Button } from '../ui/Button/Button';
import styles from './FieldCard.module.css';

const getIconForType = (type) => {
    switch (type) {
        case 'text': return Type;
        case 'number': return Hash;
        case 'textarea': return AlignLeft;
        case 'select': return List;
        case 'date': return Calendar;
        case 'checkbox': return CheckSquare;
        case 'radio': return CircleDot;
        default: return Type;
    }
};

export const FieldCard = ({ field, isSelected, onDelete }) => {
    const Icon = getIconForType(field.type);

    return (
        <div className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
            <div className={styles.dragHandle}>
                <GripVertical size={16} />
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.label}>
                        {field.label} {field.required && <span className={styles.asterisk}>*</span>}
                    </span>
                    <Badge variant="primary">{field.type}</Badge>
                </div>
                <div className={styles.meta}>
                    Variable: <code>{field.variableName}</code>
                </div>
            </div>

            <div className={styles.actions}>
                <Button variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
};
