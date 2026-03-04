import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button/Button';
import { Camera, Trash2, QrCode, ScanBarcode } from 'lucide-react';
import { Input } from '../ui/Input/Input';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styles from './FormRenderer.module.css';

export const ScannerField = ({ type, label, error, value, onChange, required, id }) => {
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef(null);

    const isQR = type === 'qr';

    useEffect(() => {
        if (scanning) {
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            const scannerId = `reader-${id}`;
            scannerRef.current = new Html5QrcodeScanner(scannerId, config, false);

            scannerRef.current.render(
                (decodedText) => {
                    onChange(decodedText);
                    stopScanning();
                },
                (errorMessage) => {
                    // Ignore frame errors
                }
            );

            return () => {
                if (scannerRef.current) {
                    try {
                        scannerRef.current.clear().catch(() => { });
                    } catch { }
                }
            };
        }
    }, [scanning, id, onChange]);

    const startScanning = () => setScanning(true);
    const stopScanning = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.clear().catch(() => { });
            } catch { }
        }
        setScanning(false);
    };

    return (
        <div className={styles.group}>
            <label className={styles.groupLabel}>
                {label} {required && '*'}
            </label>

            {!scanning && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder={isQR ? 'Código QR' : 'Código de Barras'}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!scanning ? (
                    <Button variant="secondary" type="button" onClick={startScanning}>
                        {isQR ? <QrCode size={18} /> : <ScanBarcode size={18} />}
                        <span style={{ marginLeft: '0.5rem' }}>Escanear {isQR ? 'QR' : 'Barras'}</span>
                    </Button>
                ) : (
                    <Button variant="danger" type="button" onClick={stopScanning}>
                        Cancelar Escaneo
                    </Button>
                )}
                {value && !scanning && (
                    <Button variant="ghost" type="button" style={{ color: 'var(--accent-red)' }} onClick={() => onChange(null)}>
                        <Trash2 size={18} /> Borrar
                    </Button>
                )}
            </div>

            {scanning && (
                <div id={`reader-${id}`} style={{ width: '100%', maxWidth: '400px', margin: '1rem 0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}></div>
            )}

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
