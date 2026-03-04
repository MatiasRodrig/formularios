import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button/Button';
import styles from './FormRenderer.module.css';

// Fix leaflet icons for Vite/Webpack
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return (!position || typeof position.lat === 'undefined') ? null : (
        <Marker position={position}></Marker>
    );
};

export const LocationField = ({ label, error, value, onChange, required, readonly }) => {
    const [loading, setLoading] = useState(false);

    // Default center (San Vicente, Misiones, Argentina)
    const defaultCenter = { lat: -27.0255, lng: -54.4800 };
    const center = (value && typeof value.lat !== 'undefined') ? value : defaultCenter;

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no es compatible con su navegador');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLoading(false);
            },
            () => {
                alert('No se pudo obtener su ubicación. Verifique los permisos.');
                setLoading(false);
            }
        );
    };

    return (
        <div className={styles.group}>
            <label className={styles.groupLabel}>
                {label} {required && '*'}
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {!readonly && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Button variant="secondary" type="button" onClick={handleGetCurrentLocation} disabled={loading}>
                            <Navigation size={18} style={{ marginRight: '0.25rem' }} />
                            Mi ubicación actual
                        </Button>
                        {value && (
                            <Button variant="ghost" type="button" onClick={() => onChange(null)} style={{ color: 'var(--accent-red)' }}>
                                <Trash2 size={18} />
                                Borrar
                            </Button>
                        )}
                    </div>
                )}

                <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', zIndex: 0 }}>
                    <MapContainer center={center} zoom={value && value.lat ? 16 : 10} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                        <LocationMarker position={value} setPosition={readonly ? () => { } : onChange} />
                    </MapContainer>
                </div>

                {value && value.lat !== undefined && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}
                    </div>
                )}
            </div>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
