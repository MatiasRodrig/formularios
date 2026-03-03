import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/usersApi';
import { areasApi } from '../../api/areasApi';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import toast from 'react-hot-toast';
import { Trash2, UserPlus, Users as UsersIcon, ShieldCheck, Briefcase, User } from 'lucide-react';
import styles from './Users.module.css';

const ROLES = ['Admin', 'Manager', 'Collector'];

const ROLE_INFO = {
    Admin: { label: 'Admin', color: 'cyan', icon: ShieldCheck },
    Manager: { label: 'Manager', color: 'amber', icon: Briefcase },
    Collector: { label: 'Collector', color: 'slate', icon: User },
};

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Collector',
        areaId: '',
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, areasData] = await Promise.all([
                usersApi.getAll(),
                areasApi.getAll(),
            ]);
            setUsers(usersData);
            setAreas(areasData);
        } catch (err) {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            toast.error('El nombre de usuario y la contraseña son obligatorios');
            return;
        }
        if (form.role !== 'Admin' && !form.areaId) {
            toast.error('Debe asignar un área para roles que no sean Admin');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                username: form.username,
                email: form.email,
                password: form.password,
                role: form.role,
                areaId: form.role === 'Admin' ? null : (form.areaId || null),
            };
            await usersApi.create(payload);
            toast.success('Usuario creado exitosamente');
            setShowModal(false);
            setForm({ username: '', email: '', password: '', role: 'Collector', areaId: '' });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al crear usuario');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return;
        setDeletingId(id);
        try {
            await usersApi.deleteUser(id);
            toast.success('Usuario eliminado');
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            toast.error('Error al eliminar usuario');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.titleGroup}>
                        <UsersIcon size={28} className={styles.titleIcon} />
                        <div>
                            <h1 className={styles.title}>Gestión de Usuarios</h1>
                            <p className={styles.subtitle}>Administra los usuarios del sistema y sus permisos</p>
                        </div>
                    </div>
                </div>
                <button className={styles.createBtn} onClick={() => setShowModal(true)}>
                    <UserPlus size={18} />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingWrapper}>
                    <Spinner size="lg" />
                    <p className={styles.loadingText}>Cargando usuarios...</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Área</th>
                                <th className={styles.actionCol}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyRow}>
                                        No hay usuarios registrados
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => {
                                    const roleInfo = ROLE_INFO[user.role] || ROLE_INFO.Collector;
                                    const RoleIcon = roleInfo.icon;
                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div className={styles.usernameCell}>
                                                    <div className={styles.avatar}>{user.username[0]?.toUpperCase()}</div>
                                                    <span className={styles.usernameText}>{user.username}</span>
                                                </div>
                                            </td>
                                            <td className={styles.emailCell}>{user.email || '—'}</td>
                                            <td>
                                                <span className={`${styles.roleBadge} ${styles[`role${user.role}`]}`}>
                                                    <RoleIcon size={13} />
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className={styles.areaCell}>
                                                {user.areaName ? (
                                                    <span className={styles.areaBadge}>{user.areaName}</span>
                                                ) : (
                                                    <span className={styles.globalBadge}>Global</span>
                                                )}
                                            </td>
                                            <td className={styles.actionCol}>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(user.id, user.username)}
                                                    disabled={deletingId === user.id}
                                                    title="Eliminar usuario"
                                                >
                                                    {deletingId === user.id ? <Spinner size="xs" /> : <Trash2 size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create User Modal */}
            {showModal && (
                <div className={styles.overlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Crear nuevo usuario</h2>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nombre de usuario *</label>
                                <input
                                    className={styles.input}
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="ej: juan.perez"
                                    autoComplete="off"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email (contacto)</label>
                                <input
                                    className={styles.input}
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="ej: juan@empresa.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Contraseña *</label>
                                <input
                                    className={styles.input}
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Rol *</label>
                                    <select className={styles.select} name="role" value={form.role} onChange={handleChange}>
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                {form.role !== 'Admin' && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Área *</label>
                                        <select className={styles.select} name="areaId" value={form.areaId} onChange={handleChange}>
                                            <option value="">— Seleccionar —</option>
                                            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            {form.role === 'Admin' && (
                                <p className={styles.infoNote}>
                                    ℹ️ Los usuarios Admin tienen acceso global a todas las áreas.
                                </p>
                            )}
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                    {submitting ? <Spinner size="sm" /> : 'Crear usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
