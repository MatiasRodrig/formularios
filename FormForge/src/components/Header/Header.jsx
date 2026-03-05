import React, { useState } from 'react';
import styles from './Header.module.css';
import { useAuthStore } from '../../store/authStore';
import { User, Key } from 'lucide-react';
import { usersApi } from '../../api/usersApi';
import toast from 'react-hot-toast';
import { Spinner } from '../ui/Spinner/Spinner';

export const Header = () => {
    const { user, role } = useAuthStore();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast.error('Ambos campos son requeridos');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setSubmitting(true);
        try {
            await usersApi.updatePassword({ newPassword: password });
            toast.success('Contraseña actualizada correctamente');
            setShowPasswordModal(false);
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.right}>
                <button className={styles.changePasswordBtn} onClick={() => setShowPasswordModal(true)}>
                    <Key size={16} /> Cambiar Contraseña
                </button>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        <User size={20} />
                    </div>
                    <div className={styles.details}>
                        <span className={styles.email}>{user?.username || user?.email || 'Usuario'}</span>
                        <span className={styles.role}>{role || 'Role'}</span>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <div className={styles.overlay} onClick={() => setShowPasswordModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Cambiar Contraseña</h2>
                            <button className={styles.closeBtn} onClick={() => setShowPasswordModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handlePasswordChange} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowPasswordModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                    {submitting ? <Spinner size="sm" /> : 'Actualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
};
