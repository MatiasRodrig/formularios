// FormFill.jsx — handleSubmit corregido
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsApi, cargasApi } from '../../api';
import { FormRenderer } from '../../components/FormRenderer/FormRenderer';
import { Button } from '../../components/ui/Button/Button';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './FormFill.module.css';

export const FormFill = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [form, setForm] = useState(null);
    const [schema, setSchema] = useState(null);
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                setLoading(true);
                const data = await formsApi.getById(id);
                setForm(data);
                if (data.schemaJson) setSchema(JSON.parse(data.schemaJson));
            } catch {
                toast.error('Error al cargar el formulario');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchForm();
    }, [id]);

    const validate = () => {
        const newErrors = {};
        (schema?.fields || []).forEach((field) => {
            if (field.required && !values[field.id]) {
                newErrors[field.id] = 'Este campo es obligatorio';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Por favor, complete los campos obligatorios');
            return;
        }

        // Extraer userId y areaId desde el JWT parseado
        const userId =
            user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            user?.nameid ||
            user?.sub ||
            user?.UserId ||
            null;

        const areaId = user?.AreaId || user?.areaId || form?.areaId || form?.AreaId || null;

        if (!userId || !areaId) {
            toast.error('No se pudo identificar el usuario o área. Volvé a iniciar sesión.');
            return;
        }

        try {
            setSubmitting(true);
            await cargasApi.create({
                formId: id,
                userId: userId,
                areaId: areaId,
                dataJson: JSON.stringify(values), // ← campo correcto según el DTO
            });
            toast.success('Formulario enviado correctamente');
            navigate('/cargas');
        } catch (error) {
            toast.error('Error al enviar el formulario');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;

    if (!form || !schema) {
        return (
            <div className={styles.center}>
                <p>No se encontró el formulario solicitado.</p>
                <Button onClick={() => navigate(-1)} className={styles.mt}>Volver</Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Button variant="ghost" onClick={() => navigate(-1)} className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className={styles.title}>{form.name || 'Formulario'}</h1>
                    <p className={styles.subtitle}>Complete los siguientes datos con atención.</p>
                </div>
            </header>
            <div className={styles.paper}>
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <FormRenderer schema={schema} values={values} onChange={setValues} errors={errors} />
                    <div className={styles.actions}>
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <Spinner size="sm" /> : <><Send size={16} /> Enviar Respuesta</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};