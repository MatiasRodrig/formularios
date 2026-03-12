import React, { useState } from 'react';
import { Button } from '../ui/Button/Button';
import { Camera, Mic, Video, Trash2, Upload } from 'lucide-react';
import styles from './FormRenderer.module.css'; // Reusing styles
import axiosInstance from '../../api/axiosInstance';

export const MediaField = ({ type, label, error, value, onChange, required, id }) => {
    const [loading, setLoading] = useState(false);

    const getIcon = () => {
        if (type === 'photo') return <Camera size={18} />;
        if (type === 'audio') return <Mic size={18} />;
        if (type === 'video') return <Video size={18} />;
        return <Upload size={18} />;
    };

    const getAccept = () => {
        if (type === 'photo') return 'image/*';
        if (type === 'audio') return 'audio/*';
        if (type === 'video') return 'video/*';
        return '*/*';
    };

    const getCapture = () => {
        if (type === 'photo') return 'environment';
        if (type === 'audio') return 'user';
        if (type === 'video') return 'environment';
        return undefined;
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            onChange(null);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await axiosInstance.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data && response.data.url) {
                // Return the full URL for cross-platform compatibility
                const fileUrl = import.meta.env.VITE_API_URL 
                    ? import.meta.env.VITE_API_URL + response.data.url 
                    : response.data.url;
                
                onChange({
                    url: fileUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
            }
        } catch (error) {
            console.error('Error al subir archivo:', error);
            alert('Error al subir el archivo');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        onChange(null);
    };

    return (
        <div className={styles.group}>
            <label className={styles.groupLabel}>
                {label} {required && '*'}
            </label>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
                {!value ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Button variant="secondary" type="button" disabled={loading}>
                            {loading ? 'Cargando...' : getIcon()}
                            <span style={{ marginLeft: '0.5rem' }}>Subir {type === 'photo' ? 'Foto' : type === 'audio' ? 'Audio' : 'Video'}</span>
                        </Button>
                        <input
                            type="file"
                            id={`input-${id}`}
                            accept={getAccept()}
                            capture={getCapture()}
                            onChange={handleFileChange}
                            style={{
                                position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%'
                            }}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'break-all' }}>
                                {getIcon()} {typeof value === 'object' ? (value.name || 'Archivo multimedia') : 'Archivo subido'}
                            </span>
                            <Button variant="ghost" size="sm" type="button" onClick={handleClear} style={{ color: 'var(--accent-red)' }}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                        {type === 'photo' && (
                            <img src={typeof value === 'object' ? (value.url || value.dataUrl) : value} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                        )}
                        {type === 'audio' && (
                            <audio controls src={typeof value === 'object' ? (value.url || value.dataUrl) : value} style={{ width: '100%' }} />
                        )}
                        {type === 'video' && (
                            <video controls src={typeof value === 'object' ? (value.url || value.dataUrl) : value} style={{ width: '100%', maxHeight: '300px' }} />
                        )}
                    </div>
                )}
            </div>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
