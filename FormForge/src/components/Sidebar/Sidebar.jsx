import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Folder, FormInput, Database, FileText, LogOut, Users } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
    const { role, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <div className={styles.logo}>FF</div>
                <span className={styles.brandName}>FormForge</span>
            </div>

            <nav className={styles.nav}>
                <NavLink to="/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                {role === 'Admin' && (
                    <NavLink to="/areas" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                        <Folder size={20} />
                        <span>Áreas</span>
                    </NavLink>
                )}

                <NavLink to="/forms" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                    <FormInput size={20} />
                    <span>Formularios</span>
                </NavLink>

                {(role === 'Admin' || role === 'Manager') && (
                    <NavLink to="/cargas" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                        <Database size={20} />
                        <span>Cargas</span>
                    </NavLink>
                )}

                <NavLink to="/actas" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                    <FileText size={20} />
                    <span>Actas</span>
                </NavLink>

                {role === 'Admin' && (
                    <NavLink to="/users" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                        <Users size={20} />
                        <span>Usuarios</span>
                    </NavLink>
                )}
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};
