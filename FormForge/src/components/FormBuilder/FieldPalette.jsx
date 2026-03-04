import React from 'react';
import { Type, Hash, AlignLeft, List, Calendar, CheckSquare, CircleDot, Camera, Mic, Video, QrCode, ScanBarcode, Layers, MapPin } from 'lucide-react';
import styles from './FieldPalette.module.css';

const FIELD_TYPES = [
    { type: 'text', label: 'Texto Corto', icon: Type },
    { type: 'number', label: 'Número', icon: Hash },
    { type: 'textarea', label: 'Texto Largo', icon: AlignLeft },
    { type: 'select', label: 'Desplegable', icon: List },
    { type: 'date', label: 'Fecha', icon: Calendar },
    { type: 'checkbox', label: 'Casilla', icon: CheckSquare },
    { type: 'radio', label: 'Opciones (Radio)', icon: CircleDot },
    { type: 'photo', label: 'Foto', icon: Camera },
    { type: 'audio', label: 'Audio', icon: Mic },
    { type: 'video', label: 'Video', icon: Video },
    { type: 'qr', label: 'Código QR', icon: QrCode },
    { type: 'barcode', label: 'Código de Barras', icon: ScanBarcode },
    { type: 'location', label: 'Ubicación', icon: MapPin },
    { type: 'group', label: 'Grupo/Sección', icon: Layers }
];

export const FieldPalette = () => {
    const handleDragStart = (e, field) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: field.type,
            label: field.label,
            required: false,
            placeholder: '',
            options: field.type === 'select' || field.type === 'radio' ? ['Opción 1'] : []
        }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className={styles.palette}>
            <div className={styles.header}>
                <h3>Elementos</h3>
                <p>Arrastre al formulario</p>
            </div>

            <div className={styles.list}>
                {FIELD_TYPES.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div
                            key={field.type}
                            className={styles.paletteItem}
                            draggable
                            onDragStart={(e) => handleDragStart(e, field)}
                        >
                            <Icon size={18} className={styles.icon} />
                            <span>{field.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
