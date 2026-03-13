import React, { useEffect, useState, useMemo } from 'react';
import { cargasApi } from '../../api/cargasApi';
import { formsApi } from '../../api/formsApi';
import { usersApi } from '../../api/usersApi';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { Database, Eye, Download, Search, ChevronLeft, Calendar, FileText } from 'lucide-react';
import { replaceVariables } from '../../utils/actaHelpers';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import styles from './CargasList.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl
});

// Helper to extract fields from Form Schema
const getFieldsFromSchema = (schemaJson) => {
    try {
        const schema = JSON.parse(schemaJson);
        return schema?.fields || [];
    } catch {
        return [];
    }
};

export const CargasList = () => {
    const [cargas, setCargas] = useState([]);
    const [forms, setForms] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [actasTemplates, setActasTemplates] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [activeFormId, setActiveFormId] = useState(null);
    const [selectedCarga, setSelectedCarga] = useState(null);

    // Table Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 50;

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [cargasData, formsData, usersData] = await Promise.all([
                cargasApi.getAll().catch(() => []),
                formsApi.getAll().catch(() => []),
                usersApi.getAll().catch(() => [])
            ]);

            setCargas(cargasData || []);
            setForms(formsData || []);

            const uMap = {};
            (usersData || []).forEach(u => uMap[u.id || u._id] = u.username || u.email);
            setUsersMap(uMap);

        } catch (err) {
            toast.error('Error al cargar datos generales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        const storedActas = JSON.parse(localStorage.getItem('actasTemplates') || '[]');
        setActasTemplates(storedActas);
    }, []);

    // 1. Grid of Forms with data
    const formsWithData = useMemo(() => {
        return forms.map(f => {
            const formCargas = cargas.filter(c => c.formId === (f.id || f._id));
            return {
                ...f,
                cargasCount: formCargas.length,
            };
        }).filter(f => f.cargasCount > 0);
    }, [forms, cargas]);


    // 2. Active Form Data (If user clicked one)
    const activeForm = useMemo(() => {
        if (!activeFormId) return null;
        return forms.find(f => (f.id || f._id) === activeFormId);
    }, [forms, activeFormId]);

    const activeFields = useMemo(() => {
        if (!activeForm) return [];
        return getFieldsFromSchema(activeForm.schemaJson).filter(f => f.type !== 'group'); // Ignore groups for columns
    }, [activeForm]);

    const activeFormFieldsComplete = useMemo(() => {
        if (!activeForm) return [];
        return getFieldsFromSchema(activeForm.schemaJson); // Used for Acta matching
    }, [activeForm]);

    const availableActasForForm = useMemo(() => {
        if (!activeFormId) return [];
        return actasTemplates.filter(a => a.formId === activeFormId);
    }, [activeFormId, actasTemplates]);

    const activeFormCargasFiltered = useMemo(() => {
        if (!activeFormId) return [];
        let data = cargas.filter(c => c.formId === activeFormId);

        // Date filter
        if (startDate) {
            data = data.filter(c => new Date(c.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            // Include end day entirely
            const toDate = new Date(endDate);
            toDate.setHours(23, 59, 59, 999);
            data = data.filter(c => new Date(c.timestamp) <= toDate);
        }

        // Search Filter (Search in any value + user)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(c => {
                const userName = (usersMap[c.userId] || 'N/A').toLowerCase();
                if (userName.includes(lowerSearch)) return true;

                // Search inside values
                let parsed = {};
                try { parsed = JSON.parse(c.dataJson) } catch { }

                const hasValueMatch = Object.values(parsed).some(val => {
                    if (val && typeof val === 'string' && val.toLowerCase().includes(lowerSearch)) return true;
                    if (val && typeof val === 'object' && val.lat && String(val.lat).includes(lowerSearch)) return true; // maps
                    return false;
                });
                return hasValueMatch;
            });
        }

        // Sort newest first
        return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [activeFormId, cargas, startDate, endDate, searchTerm, usersMap]);

    // Reset page to 1 if filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate, activeFormId]);

    const totalPages = Math.ceil(activeFormCargasFiltered.length / ITEMS_PER_PAGE);
    const paginatedCargas = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return activeFormCargasFiltered.slice(start, start + ITEMS_PER_PAGE);
    }, [activeFormCargasFiltered, currentPage]);


    const handleExportCSV = () => {
        if (activeFormCargasFiltered.length === 0) {
            toast.error("No hay datos para exportar");
            return;
        }

        // CSV Header
        const headers = ['ID', 'Usuario', 'Fecha', ...activeFields.map(f => f.label.replace(/,/g, ' '))];

        // CSV Rows
        const rows = activeFormCargasFiltered.map(c => {
            const rowArr = [];
            rowArr.push(`"${(c.id || c._id).slice(0, 8)}"`);
            rowArr.push(`"${usersMap[c.userId] || 'N/A'}"`);
            rowArr.push(`"${new Date(c.timestamp).toLocaleString()}"`);

            let parsedFn = {};
            try { parsedFn = JSON.parse(c.dataJson); } catch { }

            activeFields.forEach(f => {
                let cellValue = parsedFn[f.id];
                if (cellValue === undefined || cellValue === null) cellValue = '';

                // Handle objects like location
                if (typeof cellValue === 'object' && cellValue.lat) {
                    cellValue = `${cellValue.lat}; ${cellValue.lng}`;
                }

                rowArr.push(`"${String(cellValue).replace(/"/g, '""').replace(/,/g, ';')}"`);
            });

            return rowArr.join(','); // separated by comma
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Data_${activeForm.name.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // PDF Style Generator for Actas
    const pdfStyles = StyleSheet.create({
        page: { padding: 40, fontFamily: 'Helvetica' },
        body: { fontSize: 12, lineHeight: 1.5, color: '#111' }
    });

    const SimplePdfDoc = ({ htmlContent }) => {
        const cleanText = htmlContent.replace(/<[^>]+>/g, ' ');
        return (
            <Document>
                <Page size="A4" style={pdfStyles.page}>
                    <View>
                        <Text style={pdfStyles.body}>{cleanText}</Text>
                    </View>
                </Page>
            </Document>
        );
    };

    const handleDownloadActa = async (carga, template) => {
        try {
            toast.loading(`Generando acta: ${template.name}...`, { id: 'pdf-toast' });

            // Prepare Data Object mapping variableName -> answer
            let parsedFn = {};
            try { parsedFn = JSON.parse(carga.dataJson); } catch { }

            const dataObj = {};
            activeFormFieldsComplete.forEach(f => {
                if (!f.variableName) return;

                let cellValue = parsedFn[f.id];
                if (cellValue === undefined || cellValue === null) cellValue = '';

                if (typeof cellValue === 'object' && cellValue !== null) {
                    const lat = cellValue.latitude ?? cellValue.lat;
                    const lng = cellValue.longitude ?? cellValue.lng;
                    if (lat !== undefined && lng !== undefined) {
                        cellValue = `${lat}, ${lng}`;
                    } else {
                        cellValue = JSON.stringify(cellValue);
                    }
                } else if (typeof cellValue === 'string' && cellValue.startsWith('/uploads/')) {
                    cellValue = getBaseUrl() + cellValue; // ✅ URL absoluta correcta
                }

                dataObj[f.variableName] = String(cellValue);
            });
            // Adicionales
            dataObj['fecha'] = new Date(carga.timestamp).toLocaleDateString();
            dataObj['usuario'] = usersMap[carga.userId] || 'N/A';
            dataObj['carga_id'] = (carga.id || carga._id).slice(0, 8);

            const renderedHtml = replaceVariables(template.templateHtml, dataObj);

            const doc = <SimplePdfDoc htmlContent={renderedHtml} />;
            const asPdf = pdf();
            asPdf.updateContainer(doc);
            const blob = await asPdf.toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Acta_${template.name.replace(/\s+/g, '_')}_${carga.id || carga._id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('Acta exportada exitosamente', { id: 'pdf-toast' });
        } catch (err) {
            toast.error('Error al generar el Acta PDF', { id: 'pdf-toast' });
        }
    };


    const getBaseUrl = () => {
        const url = import.meta.env.VITE_API_URL || 'http://192.168.27.113:5023';
        return url.endsWith('/') ? url.slice(0, -1) : url;
    };

    const renderFieldValue = (value) => {
        if (value === null || value === undefined || value === '') return <span className={styles.mono}>-</span>;

        // 1. Ubicación (latitude/longitude o lat/lng) 
        const isLoc = typeof value === 'object' && 
            ((value.latitude !== undefined && value.longitude !== undefined) || 
             (value.lat !== undefined && value.lng !== undefined));

        if (isLoc) {
            const lat = value.latitude ?? value.lat;
            const lng = value.longitude ?? value.lng;
            return (
                <a 
                    href={`https://maps.google.com/?q=${lat},${lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.locationLink}
                >
                    📍 {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                </a>
            );
        }

        // 2. Archivos multimedia (Fotos/Videos)
        if (typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('http'))) {
            const uri = value.startsWith('/uploads/') ? getBaseUrl() + value : value;
            const isImg = value.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            
            if (isImg) {
                return (
                    <div className={styles.mediaPreview}>
                        <img 
                            src={uri} 
                            alt="Carga" 
                            className={styles.thumbnail} 
                            onClick={(e) => { e.stopPropagation(); window.open(uri, '_blank'); }}
                        />
                    </div>
                );
            }

            return (
                <a href={uri} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                    📁 Ver Archivo
                </a>
            );
        }

        // 3. Objetos genéricos
        if (typeof value === 'object') return JSON.stringify(value);

        return String(value);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.center}><Spinner size="lg" /></div>
            </div>
        );
    }

    // --- RENDER View 1: Form List Cards ---
    if (!activeFormId) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Panel de Cargas</h1>
                        <p className={styles.subtitle}>Seleccione un formulario para ver los datos recolectados.</p>
                    </div>
                </header>

                {formsWithData.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Database size={48} className={styles.emptyIcon} />
                        <h3>Aún no hay recolectas</h3>
                        <p>Ninguno de sus formularios tiene datos enviados todavía.</p>
                    </div>
                ) : (
                    <div className={styles.formsGrid}>
                        {formsWithData.map(f => (
                            <div key={f.id || f._id} className={styles.formCard}>
                                <div className={styles.formCardHeader}>
                                    <h3 className={styles.formCardTitle}>{f.name}</h3>
                                    <span className={styles.formCardMeta}>Área: {f.areaName || 'General'}</span>
                                </div>
                                <div>
                                    <span className={styles.formCardBadge}>
                                        <Database size={16} /> {f.cargasCount} Respuesta(s)
                                    </span>
                                </div>
                                <Button style={{ marginTop: 'auto' }} onClick={() => setActiveFormId(f.id || f._id)}>
                                    <Eye size={18} style={{ marginRight: '0.5rem' }} /> Ver Datos
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER View 2: Specific Table Data ---
    return (
        <div className={styles.container}>
            <header className={styles.header} style={{ marginBottom: '1rem' }}>
                <div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveFormId(null)} style={{ marginBottom: '0.5rem', marginLeft: '-0.5rem' }}>
                        <ChevronLeft size={16} /> Volver a los Formularios
                    </Button>
                    <h1 className={styles.title}>
                        Respuestas: {activeForm?.name} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({activeFormCargasFiltered.length} cargas)</span>
                    </h1>
                </div>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.searchGroup}>
                    <Search size={18} color="var(--text-secondary)" />
                    <Input
                        placeholder="Buscar por dato o usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ margin: 0 }}
                    />
                </div>

                <div className={styles.dateFilter}>
                    <Calendar size={18} color="var(--text-secondary)" />
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        title="Fecha Desde"
                    />
                    <span>-</span>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        title="Fecha Hasta"
                    />
                </div>

                <div style={{ marginLeft: 'auto' }}>
                    <Button variant="secondary" onClick={handleExportCSV}>
                        <Download size={18} style={{ marginRight: '0.5rem' }} /> Exportar CSV
                    </Button>
                </div>
            </div>

            {activeFormCargasFiltered.length === 0 ? (
                <div className={styles.emptyState} style={{ marginTop: '1.5rem' }}>
                    <h3>Sin resultados</h3>
                    <p>No se encontraron datos que coincidan con la búsqueda o rango de fechas.</p>
                </div>
            ) : (
                <div className={styles.tableWrapper} style={{ marginTop: '1.5rem' }}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Carga ID</th>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    {activeFields.slice(0, 5).map(f => ( // Limit table to first 5 fields to avoid horizontal overflow nightmare
                                        <th key={f.id} title={f.label}>{f.label}</th>
                                    ))}
                                    {activeFields.length > 5 && <th>...</th>}
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCargas.map((carga) => {
                                    let cData = {};
                                    try { cData = JSON.parse(carga.dataJson); } catch { }

                                    return (
                                        <tr key={carga.id || carga._id}>
                                            <td className={styles.mono}>{(carga.id || carga._id).slice(0, 6)}</td>
                                            <td>{new Date(carga.timestamp).toLocaleString()}</td>
                                            <td>{usersMap[carga.userId] || 'N/A'}</td>

                                            {activeFields.slice(0, 5).map(f => (
                                                <td key={f.id} title={String(cData[f.id] || '')}>
                                                    {renderFieldValue(cData[f.id])}
                                                </td>
                                            ))}
                                            {activeFields.length > 5 && <td>-</td>}

                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedCarga(carga)} title="Ver en detalle todo el registro">
                                                        <Eye size={16} />
                                                    </Button>
                                                    {availableActasForForm.map(actaTpl => (
                                                        <Button
                                                            key={actaTpl.id}
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDownloadActa(carga, actaTpl)}
                                                            title={`Descargar ${actaTpl.name}`}
                                                            style={{ color: 'var(--accent-green)' }}
                                                        >
                                                            <FileText size={16} />
                                                        </Button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <div className={styles.paginationInfo}>
                                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, activeFormCargasFiltered.length)} de {activeFormCargasFiltered.length} cargas
                            </div>
                            <div className={styles.paginationControls}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    Anterior
                                </Button>
                                <span style={{ fontSize: '0.875rem', padding: '0 0.5rem', fontFamily: 'var(--font-mono)' }}>
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Normalized Modal Data */}
            {selectedCarga && (
                <div className={styles.modalOverlay} onClick={() => setSelectedCarga(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalTitle}>
                            Detalle de Registro
                            <span className={styles.mono} style={{ display: 'block', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                ID: {selectedCarga.id || selectedCarga._id}
                            </span>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.normalizedData}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Fecha de Envío</span>
                                    <span className={styles.dataValue}>{new Date(selectedCarga.timestamp).toLocaleString()}</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Usuario Relevador</span>
                                    <span className={styles.dataValue}>{usersMap[selectedCarga.userId] || 'N/A'}</span>
                                </div>

                                {activeFields.map((f, i) => {
                                    let cData = {};
                                    try { cData = JSON.parse(selectedCarga.dataJson); } catch { }
                                    const val = cData[f.id];
                                    
                                    const hasCoords = val && typeof val === 'object' && 
                                        ((val.latitude !== undefined && val.longitude !== undefined) || 
                                         (val.lat !== undefined && val.lng !== undefined));

                                    return (
                                        <div key={i} className={styles.dataRow}>
                                            <span className={styles.dataLabel}>{f.label}</span>
                                            <span className={styles.dataValue}>
                                                {hasCoords ? (
                                                    <div className={styles.modalMapContainer}>
                                                        <MapContainer 
                                                            center={{ lat: val.latitude ?? val.lat, lng: val.longitude ?? val.lng }} 
                                                            zoom={16} 
                                                            className={styles.modalMap}
                                                        >
                                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                                                            <Marker position={{ lat: val.latitude ?? val.lat, lng: val.longitude ?? val.lng }} />
                                                        </MapContainer>
                                                    </div>
                                                ) : renderFieldValue(val)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <Button onClick={() => setSelectedCarga(null)}>Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
