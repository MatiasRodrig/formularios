import React, { useEffect, useState } from 'react';
import { cargasApi } from '../../api/cargasApi';
import { Button } from '../../components/ui/Button/Button';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { Database, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './CargasList.module.css';

export const CargasList = () => {
    const [cargas, setCargas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCargas = async () => {
        try {
            setLoading(true);
            const data = await cargasApi.getAll();
            setCargas(data || []);
        } catch (err) {
            toast.error('Error al cargar las respuestas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCargas();
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Cargas / Respuestas</h1>
                    <p className={styles.subtitle}>Visualice todas las respuestas enviadas a los formularios.</p>
                </div>
            </header>

            {loading ? (
                <div className={styles.center}>
                    <Spinner size="lg" />
                </div>
            ) : cargas.length === 0 ? (
                <div className={styles.emptyState}>
                    <Database size={48} className={styles.emptyIcon} />
                    <h3>No hay cargas registradas</h3>
                    <p>Aún no se ha enviado ninguna respuesta a los formularios.</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID Carga</th>
                                <th>ID Formulario</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargas.map((carga) => (
                                <tr key={carga.id || carga._id}>
                                    <td className={styles.mono}>{carga.id || carga._id}</td>
                                    <td className={styles.mono}>{carga.formId}</td>
                                    <td>{carga.createdAt ? new Date(carga.createdAt).toLocaleString() : 'N/A'}</td>
                                    <td>
                                        <Button variant="ghost" size="sm" title="Ver detalles (Pronto)">
                                            <Eye size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
