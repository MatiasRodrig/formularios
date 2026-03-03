import React, { useEffect, useState } from 'react';
import { areasApi } from '../../api/areasApi';
import { Button } from '../../components/ui/Button/Button';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/Input';
import toast from 'react-hot-toast';
import { FolderPlus, Trash2, Folder } from 'lucide-react';
import styles from './Areas.module.css';

export const Areas = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAreaName, setNewAreaName] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const data = await areasApi.getAll();
            setAreas(data || []);
        } catch (error) {
            toast.error('Error al cargar áreas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleCreate = async () => {
        if (!newAreaName.trim()) return;
        try {
            setCreating(true);
            await areasApi.create({ name: newAreaName });
            toast.success('Área creada exitosamente');
            setNewAreaName('');
            setIsModalOpen(false);
            fetchAreas();
        } catch (error) {
            toast.error('Error al crear área');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta área?')) return;
        try {
            await areasApi.delete(id);
            toast.success('Área eliminada');
            fetchAreas();
        } catch (error) {
            toast.error('Error al eliminar área');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gestión de Áreas</h1>
                    <p className={styles.subtitle}>Administre las áreas disponibles para los formularios.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <FolderPlus size={18} />
                    Nueva Área
                </Button>
            </header>

            {loading ? (
                <div className={styles.center}>
                    <Spinner size="lg" />
                </div>
            ) : areas.length === 0 ? (
                <div className={styles.emptyState}>
                    <Folder size={48} className={styles.emptyIcon} />
                    <h3>No hay áreas registradas</h3>
                    <p>Cree la primera área para comenzar a organizar sus formularios.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {areas.map((area) => (
                        <div key={area.id || area._id || area.Id} className={styles.card}>
                            <div className={styles.cardInfo}>
                                <div className={styles.iconWrapper}>
                                    <Folder size={20} />
                                </div>
                                <div>
                                    <h3 className={styles.areaName}>{area.title || area.name || area.Name || 'Sin nombre'}</h3>
                                    <span className={styles.areaId}>ID: {area.id || area._id || area.Id}</span>
                                </div>
                            </div>
                            <Button
                                variant="danger"
                                onClick={() => handleDelete(area.id || area._id || area.Id)}
                                title="Eliminar área"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear nueva Área">
                <div className={styles.modalForm}>
                    <Input
                        label="Nombre del Área"
                        placeholder="Ej: Recursos Humanos"
                        value={newAreaName}
                        onChange={(e) => setNewAreaName(e.target.value)}
                    />
                    <div className={styles.modalActions}>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={!newAreaName.trim() || creating}>
                            {creating ? <Spinner size="sm" /> : 'Crear Área'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
