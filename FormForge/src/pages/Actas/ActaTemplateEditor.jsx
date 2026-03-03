import React, { useState } from 'react';
import { Button } from '../../components/ui/Button/Button';
import { Input, Textarea } from '../../components/ui/Input/Input';
import { extractVariables } from '../../utils/actaHelpers';
import { FileEdit, Save, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styles from './ActaTemplateEditor.module.css';

export const ActaTemplateEditor = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [formId, setFormId] = useState('');
    const [templateHtml, setTemplateHtml] = useState(
        'El día {{fecha}} se reunieron {{nombre_responsable}} y acordaron...'
    );
    const [variables, setVariables] = useState([]);

    const detectVariables = () => {
        const vars = extractVariables(templateHtml);
        setVariables(vars);
        toast.success(`Se detectaron ${vars.length} variables`);
    };

    const handleSave = () => {
        if (!name || !templateHtml) {
            toast.error('Nombre y plantilla son obligatorios');
            return;
        }
        const newActa = {
            id: crypto.randomUUID(),
            name,
            formId,
            templateHtml,
            createdAt: new Date().toISOString()
        };

        // Saving to localStorage as instructed for Actas if no backend
        const stored = JSON.parse(localStorage.getItem('actasTemplates') || '[]');
        stored.push(newActa);
        localStorage.setItem('actasTemplates', JSON.stringify(stored));

        toast.success('Plantilla de acta guardada correctamente');
        navigate('/actas');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Editor de Plantilla de Acta</h1>
                    <p className={styles.subtitle}>Cree plantillas dinámicas usando `{'{{variable}}'}`</p>
                </div>
                <Button onClick={handleSave}>
                    <Save size={18} /> Guardar
                </Button>
            </header>

            <div className={styles.grid}>
                <div className={styles.editorSection}>
                    <Input
                        label="Nombre de la Plantilla"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Acta de Recepción"
                    />
                    <Input
                        label="ID de Formulario Vinculado (Opcional)"
                        value={formId}
                        onChange={(e) => setFormId(e.target.value)}
                        placeholder="ID del formulario"
                    />
                    <div className={styles.editorWrap}>
                        <label className={styles.label}>Contenido de la Plantilla (HTML soportado)</label>
                        <textarea
                            className={styles.textarea}
                            value={templateHtml}
                            onChange={(e) => setTemplateHtml(e.target.value)}
                            placeholder="Escriba el contenido aquí. Use {{variable}} para insertar datos."
                        />
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3>Variables Detectadas</h3>
                        <Button variant="secondary" size="sm" onClick={detectVariables}>
                            <Wand2 size={14} /> Detectar
                        </Button>
                    </div>
                    <div className={styles.varList}>
                        {variables.length > 0 ? (
                            variables.map((v, i) => (
                                <div key={i} className={styles.varBadge}>{v}</div>
                            ))
                        ) : (
                            <p className={styles.emptyVars}>Haga clic en 'Detectar' para buscar variables en el texto.</p>
                        )}
                    </div>
                    <div className={styles.help}>
                        <p><strong>¿Cómo funciona?</strong></p>
                        <p>Escriba el nombre de la variable de un campo del formulario entre llaves dobles: <code>{'{{nombre}}'}</code>. Al generar el acta, se reemplazará por la respuesta del usuario.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
