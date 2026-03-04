import React, { useEffect, useState } from 'react';
import { formsApi } from '../../api/formsApi';
import { Button } from '../../components/ui/Button/Button';
import { Badge } from '../../components/ui/Badge/Badge';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { FormInput, Plus, FileEdit, Eye, Play, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './FormList.module.css';

export const FormList = () => {
    const { role } = useAuthStore();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchForms = async () => {
        try {
            setLoading(true);
            const data = await formsApi.getAll();
            setForms(data || []);
        } catch (error) {
            toast.error('Error al cargar formularios');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (formId) => {
        if (!window.confirm('¿Está seguro que desea eliminar este formulario?')) return;
        try {
            await formsApi.delete(formId);
            toast.success('Formulario eliminado');
            fetchForms();
        } catch {
            toast.error('Error al eliminar el formulario');
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Formularios</h1>
                    <p className={styles.subtitle}>Gestione los formularios del sistema.</p>
                </div>
                <Button onClick={() => navigate('/forms/new')}>
                    <Plus size={18} />
                    Nuevo Formulario
                </Button>
            </header>

            {loading ? (
                <div className={styles.center}>
                    <Spinner size="lg" />
                </div>
            ) : forms.length === 0 ? (
                <div className={styles.emptyState}>
                    <FormInput size={48} className={styles.emptyIcon} />
                    <h3>No hay formularios registrados</h3>
                    <p>Cree su primer formulario usando el constructor visual.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {forms.map((form) => (
                        <div key={form.id || form._id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.formName}>{form.name || form.title || 'Sin nombre'}</h3>
                                <Badge variant={form.published ? 'warning' : 'primary'}>
                                    {form.published ? 'Publicado' : 'Borrador'}
                                </Badge>
                            </div>
                            <p className={styles.areaInfo}>Área ID: {form.areaId || 'General'}</p>

                            <div className={styles.cardActions}>
                                {role === 'Admin' && (
                                    <Button variant="danger" onClick={() => handleDelete(form.id || form._id)}>
                                        <Trash2 size={16} /> Eliminar
                                    </Button>
                                )}
                                <Button variant="ghost" onClick={() => navigate(`/forms/${form.id || form._id}/edit`)}>
                                    <FileEdit size={16} /> Editar
                                </Button>
                                <Button variant="ghost" onClick={() => navigate(`/forms/${form.id || form._id}/responses`)}>
                                    <Eye size={16} /> Respuestas
                                </Button>
                                <Button variant="primary" onClick={() => navigate(`/forms/${form.id || form._id}/fill`)}>
                                    <Play size={16} /> Llenar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
