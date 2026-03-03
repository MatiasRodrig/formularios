import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/authApi';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import toast from 'react-hot-toast';
import styles from './Login.module.css';
import { Shield } from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        try {
            const resp = await authApi.login(username, password);
            if (resp.token) {
                login(resp.token);
                toast.success('Sesión iniciada correctamente');
                navigate('/dashboard');
            } else {
                toast.error('Credenciales inválidas');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <Shield size={28} className={styles.icon} />
                </div>
                <h1 className={styles.title}>FormForge</h1>
                <p className={styles.subtitle}>Inicie sesión para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Nombre de usuario"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    type="submit"
                    variant="primary"
                    className={styles.submitBtn}
                    disabled={loading}
                >
                    {loading ? <Spinner size="sm" /> : 'Ingresar al sistema'}
                </Button>
            </form>
        </div>
    );
};
