import React from 'react';
import styles from './Header.module.css';
import { useAuthStore } from '../../store/authStore';
import { User } from 'lucide-react';

export const Header = () => {
    const { user, role } = useAuthStore();

    return (
        <header className={styles.header}>
            <div className={styles.right}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        <User size={20} />
                    </div>
                    <div className={styles.details}>
                        <span className={styles.email}>{user?.email || 'Usuario'}</span>
                        <span className={styles.role}>{role || 'Role'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
