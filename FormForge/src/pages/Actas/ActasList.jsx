import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button/Button';
import { FileEdit, Plus, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ActasList.module.css';

export const ActasList = () => {
    const navigate = useNavigate();
    const [actas, setActas] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('actasTemplates') || '[]');
        setActas(stored);
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Plantillas de Actas</h1>
                    <p className={styles.subtitle}>Gestione los documentos generables a partir de formularios.</p>
                </div>
                <Button onClick={() => navigate('/actas/new')}>
                    <Plus size={18} /> Nueva Plantilla
                </Button>
            </header>

            {actas.length === 0 ? (
                <div className={styles.emptyState}>
                    <FileText size={48} className={styles.emptyIcon} />
                    <h3>No hay plantillas de actas</h3>
                    <p>Cree su primera plantilla usando el editor de variables.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {actas.map((acta) => (
                        <div key={acta.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.actaName}>{acta.name}</h3>
                            </div>
                            <p className={styles.formId}>
                                Formulario: {acta.formId || 'No vinculado'}
                            </p>

                            <div className={styles.cardActions}>
                                <Button variant="ghost" onClick={() => navigate(`/actas/${acta.id}/edit`)}>
                                    <FileEdit size={16} /> Editar
                                </Button>
                                <Button variant="primary" onClick={() => navigate(`/actas/${acta.id}/preview`)}>
                                    <Eye size={16} /> Previsualizar / Exportar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
