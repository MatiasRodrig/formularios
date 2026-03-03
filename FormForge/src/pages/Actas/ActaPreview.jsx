import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { replaceVariables } from '../../utils/actaHelpers';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { ArrowLeft, Download, Code } from 'lucide-react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import toast from 'react-hot-toast';
import styles from './ActaPreview.module.css';

// Simple PDF styles using react-pdf
const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    body: { fontSize: 12, lineHeight: 1.5, color: '#111' }
});

const SimplePdfDoc = ({ htmlContent }) => {
    // A simplistic conversion from HTML text to PDF for demonstration
    // In a real scenario, interpreting HTML tags into react-pdf components is complex and usually requires html-react-parser mapping
    const cleanText = htmlContent.replace(/<[^>]+>/g, ' '); // Strip HTML for simple PDF 

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


export const ActaPreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const [renderedHtml, setRenderedHtml] = useState('');

    // Simulated form data to use for variables (would normally be fetched from /api/cargas/:id)
    const [testData, setTestData] = useState({
        fecha: new Date().toLocaleDateString(),
        nombre_responsable: 'Juan Pérez',
        nombre_paciente: 'Carlos Gómez',
        motivo: 'Control Rutinario',
        observaciones: 'El paciente se encuentra estable y sin dolor.'
    });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('actasTemplates') || '[]');
        const found = stored.find(a => a.id === id);
        if (found) {
            setTemplate(found);
            setRenderedHtml(replaceVariables(found.templateHtml, testData));
        }
    }, [id, testData]);

    const handleExportHtml = () => {
        const blob = new Blob([renderedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Acta_${template.name}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('HTML exportado');
    };

    const handleExportPdf = async () => {
        try {
            toast.loading('Generando PDF...', { id: 'pdf-toast' });
            const doc = <SimplePdfDoc htmlContent={renderedHtml} />;
            const asPdf = pdf();
            asPdf.updateContainer(doc);
            const blob = await asPdf.toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Acta_${template.name}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('PDF exportado exitosamente', { id: 'pdf-toast' });
        } catch (err) {
            toast.error('Error al generar PDF', { id: 'pdf-toast' });
        }
    };

    if (!template) {
        return <div className={styles.center}><Spinner size="lg" /></div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <Button variant="ghost" onClick={() => navigate('/actas')} className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className={styles.title}>Previsualización: {template.name}</h1>
                        <p className={styles.subtitle}>Datos de prueba aplicados.</p>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={handleExportHtml}>
                        <Code size={18} /> HTML
                    </Button>
                    <Button variant="primary" onClick={handleExportPdf}>
                        <Download size={18} /> exportar PDF
                    </Button>
                </div>
            </header>

            <div className={styles.contentGrid}>
                <div className={styles.documentPreview}>
                    <div className={styles.paper} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                </div>

                <div className={styles.dataPanel}>
                    <h3>Datos Simulados</h3>
                    <p className={styles.helpText}>Modifique los valores para ver los cambios en tiempo real (Mock).</p>

                    <div className={styles.dataForm}>
                        {Object.keys(testData).map(key => (
                            <div key={key} className={styles.dataGroup}>
                                <label className={styles.dataLabel}>{key}</label>
                                <input
                                    className={styles.dataInput}
                                    value={testData[key]}
                                    onChange={(e) => setTestData({ ...testData, [key]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
