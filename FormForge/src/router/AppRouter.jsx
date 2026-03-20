import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout/AuthLayout';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';

import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Areas } from '../pages/Areas/Areas';
import { FormList } from '../pages/Forms/FormList';
import { FormBuilderPage } from '../pages/Forms/FormBuilderPage';
import { FormFill } from '../pages/Forms/FormFill';
import { CargasList } from '../pages/Cargas/CargasList';
import { ActasList } from '../pages/Actas/ActasList';
import { ActaTemplateEditor } from '../pages/Actas/ActaTemplateEditor';
import { ActaPreview } from '../pages/Actas/ActaPreview';
import { Users } from '../pages/Users/Users';
import { Profiles } from '../pages/Profiles/Profiles';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Admin only */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                            <Route path="/users" element={<Users />} />
                        </Route>

                        {/* Admin/Manager only areas */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
                            <Route path="/areas" element={<Areas />} />
                            <Route path="/cargas" element={<CargasList />} />
                            <Route path="/forms/new" element={<FormBuilderPage />} />
                            <Route path="/forms/:id/edit" element={<FormBuilderPage />} />
                        </Route>

                        {/* Forms */}
                        <Route path="/forms" element={<FormList />} />
                        <Route path="/forms/:id/fill" element={<FormFill />} />
                        <Route path="/forms/:id/responses" element={<CargasList />} />

                        {/* Profiles — visible for Admin and Manager */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
                            <Route path="/profiles" element={<Profiles />} />
                        </Route>

                        {/* Actas */}
                        <Route path="/actas" element={<ActasList />} />
                        <Route path="/actas/new" element={<ActaTemplateEditor />} />
                        <Route path="/actas/:id/edit" element={<ActaTemplateEditor />} />
                        <Route path="/actas/:id/preview" element={<ActaPreview />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};