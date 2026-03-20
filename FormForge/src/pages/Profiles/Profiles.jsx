import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance, { API_URL } from '../../api/axiosInstance';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { ArrowLeft, ChevronRight, Database, Calendar, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import toast from 'react-hot-toast';
import styles from './Profiles.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl, shadowUrl });

// ─── API helpers ─────────────────────────────────────────────────────────────

const profilesApi = {
    getForms: () => axiosInstance.get('/api/profiles/forms').then(r => r.data),
    getFormProfiles: (formId) => axiosInstance.get(`/api/profiles/${formId}`).then(r => r.data),
    getProfileDetail: (formId, keyFieldId, value) =>
        axiosInstance.get(`/api/profiles/${formId}/${encodeURIComponent(keyFieldId)}/${encodeURIComponent(value)}`).then(r => r.data),
};

// ─── Render helpers ───────────────────────────────────────────────────────────

const renderFieldValue = (value) => {
    if (value === null || value === undefined || value === '') return <span style={{ color: 'var(--text-muted)' }}>—</span>;

    // Try to detect JSON location object
    let parsed;
    try { parsed = typeof value === 'string' ? JSON.parse(value) : value; } catch { parsed = null; }

    const isLoc = parsed && typeof parsed === 'object' &&
        ((parsed.latitude !== undefined) || (parsed.lat !== undefined));

    if (isLoc) {
        const lat = parsed.latitude ?? parsed.lat;
        const lng = parsed.longitude ?? parsed.lng;
        return (
            <a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className={styles.locationLink}>
                📍 {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
            </a>
        );
    }

    const strVal = typeof value === 'string' ? value : JSON.stringify(value);

    if (strVal.includes('/uploads/') || (strVal.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)/i.test(strVal))) {
        const uri = strVal.startsWith('/uploads/') ? `${API_URL}${strVal}` : strVal;
        return <img src={uri} alt="" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }} />;
    }
    if (strVal.startsWith('/uploads/') || (strVal.startsWith('http'))) {
        const uri = strVal.startsWith('/uploads/') ? `${API_URL}${strVal}` : strVal;
        return <a href={uri} target="_blank" rel="noopener noreferrer" className={styles.locationLink}>📁 Ver archivo</a>;
    }

    return <span>{strVal}</span>;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Profiles = () => {
    // Navigation state
    const [view, setView] = useState('forms'); // 'forms' | 'groups' | 'detail'

    // Data states
    const [forms, setForms] = useState([]);
    const [formProfiles, setFormProfiles] = useState(null);
    const [profileDetail, setProfileDetail] = useState(null);

    // Selection state
    const [selectedFormId, setSelectedFormId] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null); // { keyFieldId, value }

    const [loading, setLoading] = useState(false);

    // ─── Fetch forms list ───────────────────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        profilesApi.getForms()
            .then(setForms)
            .catch(() => toast.error('Error al cargar formularios con perfiles'))
            .finally(() => setLoading(false));
    }, []);

    // ─── Fetch form profile groups ──────────────────────────────────────────
    const selectForm = async (formId) => {
        setSelectedFormId(formId);
        setLoading(true);
        try {
            const data = await profilesApi.getFormProfiles(formId);
            setFormProfiles(data);
            setView('groups');
        } catch {
            toast.error('Error al cargar perfiles del formulario');
        } finally {
            setLoading(false);
        }
    };

    // ─── Fetch profile detail ───────────────────────────────────────────────
    const selectProfile = async (keyFieldId, value) => {
        setSelectedProfile({ keyFieldId, value });
        setLoading(true);
        try {
            const data = await profilesApi.getProfileDetail(selectedFormId, keyFieldId, value);
            setProfileDetail(data);
            setView('detail');
        } catch {
            toast.error('Error al cargar detalle del perfil');
        } finally {
            setLoading(false);
        }
    };

    const goToForms = () => { setView('forms'); setSelectedFormId(null); setFormProfiles(null); setProfileDetail(null); };
    const goToGroups = () => { setView('groups'); setSelectedProfile(null); setProfileDetail(null); };

    // ─── VIEW: Profile detail ───────────────────────────────────────────────
    if (view === 'detail' && profileDetail) {
        const {
            keyFieldLabel, profileLabel, profileIcon, value, cargaCount,
            cargas, aggregatedFields, fieldLabels = {}, titleFieldIds = []
        } = profileDetail;

        // Build a display title for a carga using titleFieldIds
        const buildTitle = (dataJson) => {
            let data = {};
            try { data = JSON.parse(dataJson); } catch { }
            const parts = titleFieldIds
                .map(fId => data[fId])
                .filter(v => v !== undefined && v !== null && v !== '' && typeof v !== 'object')
                .map(String);
            return parts.length > 0 ? parts.join(' · ') : null;
        };

        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={goToGroups}>
                        <ArrowLeft size={18} /> Volver a Perfiles
                    </button>
                    <div className={styles.profileHero}>
                        <div className={styles.profileAvatar}>{profileIcon || profileLabel?.[0] || '?'}</div>
                        <div>
                            <h1 className={styles.profileTitle}>{value}</h1>
                            <span className={styles.profileMeta}>
                                {profileLabel || keyFieldLabel} · {cargaCount} carga{cargaCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </header>

                {loading ? <div className={styles.center}><Spinner size="lg" /></div> : (
                    <div className={styles.profileGrid}>
                        {/* Aggregated info panel */}
                        <div className={styles.infoPanel}>
                            <h3 className={styles.panelTitle}>Información Recopilada</h3>
                            <div className={styles.fieldList}>
                                {Object.entries(aggregatedFields).map(([fieldId, vals]) => {
                                    if (!vals || vals.length === 0) return null;
                                    const label = fieldLabels[fieldId] || fieldId;
                                    const lastVal = vals[vals.length - 1];
                                    const distinctVals = [...new Set(vals)];
                                    return (
                                        <div key={fieldId} className={styles.fieldRow}>
                                            <span className={styles.fieldLabel}>{label}</span>
                                            <div className={styles.fieldValue}>
                                                {renderFieldValue(lastVal)}
                                                {distinctVals.length > 1 && (
                                                    <span className={styles.multipleHint}>
                                                        ({distinctVals.length} valores distintos)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cargas list */}
                        <div className={styles.cargasPanel}>
                            <h3 className={styles.panelTitle}>Historial de Cargas</h3>
                            <div className={styles.cargasList}>
                                {cargas.map((carga, idx) => {
                                    const title = buildTitle(carga.dataJson);
                                    let data = {};
                                    try { data = JSON.parse(carga.dataJson); } catch { }
                                    return (
                                        <div key={carga.id} className={styles.cargaCard}>
                                            <div className={styles.cargaCardHeader}>
                                                <span className={styles.cargaNum}>#{cargas.length - idx}</span>
                                                <span className={styles.cargaTitle}>
                                                    {title || carga.id.slice(0, 8)}
                                                </span>
                                                <span className={styles.cargaDate}>
                                                    <Calendar size={12} /> {new Date(carga.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={styles.cargaUser}>
                                                <User size={12} /> {carga.userId}
                                            </div>
                                            <div className={styles.cargaFields}>
                                                {Object.entries(data)
                                                    .filter(([k, v]) => v && typeof v !== 'object')
                                                    .slice(0, 4)
                                                    .map(([k, v]) => (
                                                        <div key={k} className={styles.miniField}>
                                                            <span className={styles.miniLabel}>
                                                                {fieldLabels[k] || k}:
                                                            </span>
                                                            <span className={styles.miniValue}>
                                                                {String(v).slice(0, 50)}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── VIEW: Profile groups for a form ───────────────────────────────────
    if (view === 'groups' && formProfiles) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={goToForms}>
                        <ArrowLeft size={18} /> Volver a Formularios
                    </button>
                    <div>
                        <h1 className={styles.pageTitle}>Perfiles — {formProfiles.formName}</h1>
                        <p className={styles.pageSubtitle}>
                            {formProfiles.totalCargas} cargas · {formProfiles.groups.length} tipo(s) de perfil
                        </p>
                    </div>
                </header>

                {loading ? <div className={styles.center}><Spinner size="lg" /></div> : (
                    formProfiles.groups.map(group => (
                        <div key={group.keyFieldId} className={styles.profileGroup}>
                            <div className={styles.groupHeader}>
                                <span className={styles.groupIcon}>{group.profileIcon || '🔑'}</span>
                                <h2 className={styles.groupTitle}>{group.profileLabel || group.keyFieldLabel}</h2>
                                <span className={styles.groupCount}>{group.profiles.length} perfiles</span>
                            </div>

                            <div className={styles.profilesGrid}>
                                {group.profiles.map(profile => {
                                    const isRecurring = profile.cargaCount > 1;
                                    return (
                                        <button
                                            key={profile.value}
                                            className={`${styles.profileCard} ${isRecurring ? styles.profileCardRecurring : ''}`}
                                            onClick={() => selectProfile(group.keyFieldId, profile.value)}
                                        >
                                            <div className={styles.profileCardIcon}>
                                                {group.profileIcon || group.profileLabel?.[0] || '?'}
                                            </div>
                                            <div className={styles.profileCardBody}>
                                                <div className={styles.profileCardKey}>{profile.value}</div>
                                                {profile.title && (
                                                    <div className={styles.profileCardTitle}>{profile.title}</div>
                                                )}
                                                <div className={styles.profileCardMeta}>
                                                    <Database size={11} /> {profile.cargaCount} carga{profile.cargaCount !== 1 ? 's' : ''}
                                                    {isRecurring && <span className={styles.recurringBadge}>Recurrente</span>}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={styles.profileCardArrow} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    // ─── VIEW: Form selection ───────────────────────────────────────────────
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.pageTitle}>Perfiles de Entidades</h1>
                    <p className={styles.pageSubtitle}>
                        Grupos de cargas que comparten un identificador común (CUIL, N° Comercio, Patente, etc.)
                    </p>
                </div>
            </header>

            {loading ? (
                <div className={styles.center}><Spinner size="lg" /></div>
            ) : forms.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <h3>Sin formularios con perfiles</h3>
                    <p>
                        Para activar esta función, editá un formulario y marcá un campo como <strong>Clave de Perfil</strong> en su configuración.
                    </p>
                </div>
            ) : (
                <div className={styles.formsGrid}>
                    {forms.map(f => (
                        <button
                            key={f.formId}
                            className={styles.formCard}
                            onClick={() => selectForm(f.formId)}
                        >
                            <div className={styles.formCardIcons}>
                                {f.profileKeyFields.map(pf => (
                                    <span key={pf.fieldId} className={styles.formCardIcon} title={pf.profileLabel}>
                                        {pf.profileIcon || '🔑'}
                                    </span>
                                ))}
                            </div>
                            <div className={styles.formCardBody}>
                                <h3 className={styles.formCardName}>{f.formName}</h3>
                                <p className={styles.formCardMeta}>
                                    {f.profileKeyFields.map(pf => pf.profileLabel || pf.fieldLabel).join(', ')}
                                </p>
                                <span className={styles.formCardCount}>
                                    <Database size={13} /> {f.cargaCount} cargas
                                </span>
                            </div>
                            <ChevronRight size={18} className={styles.profileCardArrow} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};