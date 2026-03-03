import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.main}>
                <Header />
                <main className={styles.content}>
                    <div className={styles.container}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
