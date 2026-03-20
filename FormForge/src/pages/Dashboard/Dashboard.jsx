import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import styles from './Dashboard.module.css';
import { FormInput, FileText, Database, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api';
import { Spinner } from '../../components/ui/Spinner/Spinner';

export const Dashboard = () => {
    const { username, role } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardApi.getStats();

                // Si el backend devuelve 0 plantillas, complementar con localStorage
                const localActas = JSON.parse(localStorage.getItem('actasTemplates') || '[]');
                setStats({
                    ...data,
                    plantillasCount: data.plantillasCount > 0 ? data.plantillasCount : localActas.length,
                });
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                const localActas = JSON.parse(localStorage.getItem('actasTemplates') || '[]');
                setStats({
                    formsCount: 0,
                    cargasCount: 0,
                    plantillasCount: localActas.length,
                    areasCount: 0,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = stats ? [
        { label: 'Formularios Activos', value: stats.formsCount, icon: FormInput, color: 'blue', path: '/forms' },
        { label: 'Cargas Registradas', value: stats.cargasCount, icon: Database, color: 'green', path: '/cargas' },
        { label: 'Plantillas de Actas', value: stats.plantillasCount, icon: FileText, color: 'amber', path: '/actas' },
        ...(role === 'Admin' || role === 'Manager' ? [{ label: 'Áreas del Sistema', value: stats.areasCount, icon: Folder, color: 'purple', path: '/areas' }] : []),
    ] : [];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Bienvenido, {username || 'Usuario'}</h1>
                <p className={styles.subtitle}>Resumen del sistema FormForge para su rol de {role}</p>
            </header>

            {loading ? (
                <div className={styles.loadingWrapper}>
                    <Spinner size="lg" />
                    <p className={styles.loadingText}>Cargando estadísticas...</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                className={styles.card}
                                onClick={() => navigate(stat.path)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={`${styles.iconWrapper} ${styles[stat.color]}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h3 className={styles.value}>{stat.value.toLocaleString()}</h3>
                                    <p className={styles.label}>{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
