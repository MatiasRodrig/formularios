import React, { useState, useEffect } from 'react';
import { FieldPalette } from '../../components/FormBuilder/FieldPalette';
import { FormCanvas } from '../../components/FormBuilder/FormCanvas';
import { FieldConfig } from '../../components/FormBuilder/FieldConfig';
import { Button } from '../../components/ui/Button/Button';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { formsApi } from '../../api/formsApi';
import { areasApi } from '../../api/areasApi';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { generateUUID } from '../../utils/actaHelpers';
import toast from 'react-hot-toast';
import styles from './FormBuilderPage.module.css';

export const FormBuilderPage = () => {
    const navigate = useNavigate();
    const { role, user } = useAuthStore();

    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [formName, setFormName] = useState('');
    const [areaId, setAreaId] = useState('');
    const [areas, setAreas] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(true);

    const { id } = useParams();
    const isEditing = Boolean(id);

    useEffect(() => {
        if (!id) return;
        const loadForm = async () => {
            try {
                const data = await formsApi.getById(id);
                setFormName(data.name || '');
                setAreaId(data.areaId || '');
                if (data.schemaJson) {
                    const schema = JSON.parse(data.schemaJson);
                    setFields(schema.fields || []);
                }
            } catch {
                toast.error('Error al cargar el formulario');
            }
        };
        loadForm();
    }, [id]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const data = await areasApi.getAll();
                setAreas(data || []);
                // Manager tiene área fija: preseleccionarla desde el token
                if (role === 'Manager') {
                    const managerAreaId = user?.AreaId || user?.areaId;
                    if (managerAreaId) setAreaId(managerAreaId);
                }
            } catch {
                toast.error('Error al cargar áreas');
            } finally {
                setLoadingAreas(false);
            }
        };
        fetchAreas();
    }, [role, user]);

    const handleAddField = (fieldData) => {
        const newField = {
            ...fieldData,
            id: generateUUID(),
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

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/json');
        if (type) {
            try {
                handleAddField(JSON.parse(type));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            toast.error('El formulario necesita un nombre');
            return;
        }
        if (!areaId) {
            toast.error('Debe seleccionar un área');
            return;
        }
        if (fields.length === 0) {
            toast.error('El formulario debe tener al menos un campo');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                name: formName.trim(),
                schemaJson: JSON.stringify({ fields }),
                areaId: areaId,
            };

            if (isEditing) {
                await formsApi.update(id, payload);
                toast.success('Formulario actualizado correctamente');
            } else {
                await formsApi.create(payload);
                toast.success('Formulario guardado correctamente');
            }
            navigate('/forms');
        } catch (err) {
            toast.error('Error al guardar el formulario');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const renderConfig = () => {
        if (!selectedField) {
            return <div className={styles.emptyConfig}>Seleccione un campo para configurarlo</div>;
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
                    <h1 className={styles.title}>
                        {isEditing ? 'Editar Formulario' : 'Nuevo Formulario'}
                    </h1>
                    <input
                        className={styles.formNameInput}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nombre del formulario..."
                        maxLength={120}
                    />
                </div>

                <div className={styles.headerActions}>
                    {role === 'Admin' && (
                        loadingAreas ? <Spinner size="sm" /> : (
                            <select
                                className={styles.areaSelect}
                                value={areaId}
                                onChange={(e) => setAreaId(e.target.value)}
                            >
                                <option value="">Seleccionar área...</option>
                                {areas.map((area) => (
                                    <option key={area.id || area.Id} value={area.id || area.Id}>
                                        {area.name || area.Name}
                                    </option>
                                ))}
                            </select>
                        )
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : <Save size={18} />}
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </header>

            <div className={styles.builderGrid}>
                <div className={styles.sidebar}><FieldPalette /></div>
                <div className={styles.canvasContainer} onDragOver={handleDragOver} onDrop={handleDrop}>
                    <FormCanvas
                        fields={fields}
                        selectedFieldId={selectedField?.id}
                        onSelect={setSelectedField}
                        onDelete={handleDeleteField}
                        setFields={setFields}
                    />
                </div>
                <div className={styles.configPanel}>{renderConfig()}</div>
            </div>
        </div>
    );
};