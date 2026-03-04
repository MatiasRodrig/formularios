import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button/Button';
import { Input, Textarea } from '../../components/ui/Input/Input';
import { extractVariables } from '../../utils/actaHelpers';
import { FileEdit, Save, Wand2, ArrowLeft } from 'lucide-react';
import { areasApi } from '../../api/areasApi';
import { formsApi } from '../../api/formsApi';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ActaTemplateEditor.module.css';

export const ActaTemplateEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // si existe, es modo edición
    const { role, user } = useAuthStore();

    const [name, setName] = useState('');
    const [areaId, setAreaId] = useState('');
    const [formId, setFormId] = useState('');
    const [templateHtml, setTemplateHtml] = useState(
        'El día {{fecha}} se reunieron {{nombre_responsable}} y acordaron...'
    );
    const [variables, setVariables] = useState([]);
    const [formFields, setFormFields] = useState([]);

    useEffect(() => {
        if (!formId) { setFormFields([]); return; }
        const loadFields = async () => {
            try {
                const data = await formsApi.getById(formId);
                if (data.schemaJson) {
                    const schema = JSON.parse(data.schemaJson);
                    setFormFields(schema.fields || []);
                }
            } catch { /* ignorar */ }
        };
        loadFields();
    }, [formId]);

    const [areas, setAreas] = useState([]);
    const [forms, setForms] = useState([]);
    const [loadingAreas, setLoadingAreas] = useState(true);
    const [loadingForms, setLoadingForms] = useState(false);

    // Cargar áreas al montar
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const data = await areasApi.getAll();
                setAreas(data || []);

                // Si es Manager, preseleccionar su área fija
                if (role === 'Manager' && user?.AreaId) {
                    setAreaId(user.AreaId);
                }
            } catch {
                toast.error('Error al cargar áreas');
            } finally {
                setLoadingAreas(false);
            }
        };
        fetchAreas();
    }, [role, user]);

    // Cuando cambia el área, cargar formularios de esa área
    useEffect(() => {
        if (!areaId) {
            setForms([]);
            setFormId('');
            return;
        }
        const fetchForms = async () => {
            setLoadingForms(true);
            try {
                const data = await formsApi.getByArea(areaId);
                setForms(data || []);
                setFormId(''); // resetear selección de formulario
            } catch {
                toast.error('Error al cargar formularios del área');
                setForms([]);
            } finally {
                setLoadingForms(false);
            }
        };
        fetchForms();
    }, [areaId]);

    // Si es modo edición, cargar datos existentes
    useEffect(() => {
        if (id) {
            const stored = JSON.parse(localStorage.getItem('actasTemplates') || '[]');
            const existing = stored.find((a) => a.id === id);
            if (existing) {
                setName(existing.name || '');
                setFormId(existing.formId || '');
                setAreaId(existing.areaId || '');
                setTemplateHtml(existing.templateHtml || '');
            }
        }
    }, [id]);

    const detectVariables = () => {
        const vars = extractVariables(templateHtml);
        setVariables(vars);
        toast.success(`Se detectaron ${vars.length} variable${vars.length !== 1 ? 's' : ''}`);
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('El nombre de la plantilla es obligatorio');
            return;
        }
        if (!areaId) {
            toast.error('Debe seleccionar un área');
            return;
        }
        if (!formId) {
            toast.error('Debe seleccionar un formulario');
            return;
        }
        if (!templateHtml.trim()) {
            toast.error('El contenido de la plantilla es obligatorio');
            return;
        }

        const stored = JSON.parse(localStorage.getItem('actasTemplates') || '[]');

        // Nombre del área y formulario para mostrarlo en la lista
        const selectedArea = areas.find((a) => a.id === areaId);
        const selectedForm = forms.find((f) => (f.id || f._id) === formId);

        if (id) {
            // Modo edición: actualizar
            const updated = stored.map((a) =>
                a.id === id
                    ? {
                        ...a,
                        name: name.trim(),
                        areaId,
                        areaName: selectedArea?.name || '',
                        formId,
                        formName: selectedForm?.name || '',
                        templateHtml,
                        updatedAt: new Date().toISOString(),
                    }
                    : a
            );
            localStorage.setItem('actasTemplates', JSON.stringify(updated));
            toast.success('Plantilla actualizada correctamente');
        } else {
            // Modo creación
            const newActa = {
                id: crypto.randomUUID(),
                name: name.trim(),
                areaId,
                areaName: selectedArea?.name || '',
                formId,
                formName: selectedForm?.name || '',
                templateHtml,
                createdAt: new Date().toISOString(),
            };
            stored.push(newActa);
            localStorage.setItem('actasTemplates', JSON.stringify(stored));
            toast.success('Plantilla de acta guardada correctamente');
        }

        navigate('/actas');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        {id ? 'Editar Plantilla de Acta' : 'Nueva Plantilla de Acta'}
                    </h1>
                    <p className={styles.subtitle}>
                        Cree plantillas dinámicas usando <code>{'{{variable}}'}</code>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button variant="ghost" onClick={() => navigate('/actas')}>
                        <ArrowLeft size={18} /> Volver
                    </Button>
                    <Button onClick={handleSave}>
                        <Save size={18} /> Guardar
                    </Button>
                </div>
            </header>

            <div className={styles.grid}>
                <div className={styles.editorSection}>
                    {/* Nombre de la plantilla */}
                    <Input
                        label="Nombre de la Plantilla *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Acta de Recepción"
                    />

                    {/* Fila: Área + Formulario en cascada */}
                    <div className={styles.selectRow}>
                        {/* Selector de Área */}
                        <div className={styles.selectGroup}>
                            <label className={styles.label}>Área *</label>
                            {loadingAreas ? (
                                <div className={styles.loadingSelect}><Spinner size="sm" /></div>
                            ) : (
                                <select
                                    className={styles.select}
                                    value={areaId}
                                    onChange={(e) => setAreaId(e.target.value)}
                                    disabled={role === 'Manager'} // Manager tiene área fija
                                >
                                    <option value="">Seleccionar área...</option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {role === 'Manager' && (
                                <span className={styles.hint}>Área asignada a su perfil</span>
                            )}
                        </div>

                        {/* Selector de Formulario (depende del área) */}
                        <div className={styles.selectGroup}>
                            <label className={styles.label}>Formulario vinculado *</label>
                            {loadingForms ? (
                                <div className={styles.loadingSelect}><Spinner size="sm" /></div>
                            ) : (
                                <select
                                    className={styles.select}
                                    value={formId}
                                    onChange={(e) => setFormId(e.target.value)}
                                    disabled={!areaId || forms.length === 0}
                                >
                                    <option value="">
                                        {!areaId
                                            ? 'Primero seleccione un área'
                                            : forms.length === 0
                                                ? 'No hay formularios en esta área'
                                                : 'Seleccionar formulario...'}
                                    </option>
                                    {forms.map((form) => (
                                        <option key={form.id || form._id} value={form.id || form._id}>
                                            {form.name}
                                            {form.isPublished === false ? ' (borrador)' : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Editor de contenido */}
                    <div className={styles.editorWrap}>
                        <label className={styles.label}>
                            Contenido de la Plantilla (HTML soportado)
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={templateHtml}
                            onChange={(e) => setTemplateHtml(e.target.value)}
                            placeholder="Escriba el contenido aquí. Use {{variable}} para insertar datos del formulario."
                        />
                    </div>
                </div>

                {/* Panel lateral de variables */}
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
                                <div key={i} className={styles.varBadge}>
                                    {`{{${v}}}`}
                                </div>
                            ))
                        ) : (
                            <p className={styles.emptyVars}>
                                Haga clic en 'Detectar' para buscar variables en el texto.
                            </p>
                        )}
                    </div>

                    {formFields.length > 0 && (
                        <div className={styles.formFieldsRef}>
                            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                Variables disponibles del formulario:
                            </h4>
                            <div className={styles.varList}>
                                {formFields.map((f) => (
                                    <div
                                        key={f.id}
                                        className={styles.varBadge}
                                        style={{ cursor: 'pointer', opacity: 0.75 }}
                                        title={`Clic para copiar: {{${f.variableName}}}`}
                                        onClick={() => {
                                            setTemplateHtml((prev) => prev + ` {{${f.variableName}}}`);
                                            toast.success(`{{${f.variableName}}} insertado`);
                                        }}
                                    >
                                        {`{{${f.variableName}}}`}
                                        <span style={{ marginLeft: '0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {f.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.help}>
                        <p><strong>¿Cómo funciona?</strong></p>
                        <p>
                            Use el <em>nombre de variable</em> de un campo del formulario entre llaves
                            dobles: <code>{'{{nombre_campo}}'}</code>. Al generar el acta se reemplazará
                            con la respuesta del usuario.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};