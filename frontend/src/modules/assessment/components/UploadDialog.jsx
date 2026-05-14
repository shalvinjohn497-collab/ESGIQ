import React, { useState, useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { C } from '@/theme/colors';
import { parseExcelUpload } from '@/utils/parseExcelUpload';
import useFileUpload from '@/modules/assessment/hooks/useFileUpload';
import { assessmentApi } from '@/services/api/assessment.api';

const CATEGORY_KEYS = {
    electricity: ['elec', 'ren', 'diesel', 'cost'],
    water: ['municipal', 'tanker', 'borewell', 'recycled', 'totalWater'],
    fuel: ['fuelDiesel', 'png', 'runtime'],
    waste: ['wet', 'dry', 'biomedical', 'hazardous', 'totalWaste']
};

export default function UploadDialog({ category, isOpen, onClose, onUploadSuccess }) {
    const { handleFile, uploading, uploadErrors } = useFileUpload();
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [parseErrors, setParseErrors] = useState([]);
    const [stats, setStats] = useState({ rows: 0, months: [] });

    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setParsedData([]);
            setParseErrors([]);
            setStats({ rows: 0, months: [] });
        }
    }, [isOpen]);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setParsedData([]);
        setParseErrors([]);

        try {
            const { electricityRows, waterRows, fuelRows, wasteRows, errors } = await parseExcelUpload(file, category);

            let data = [];
            if (category === 'electricity') data = electricityRows;
            if (category === 'water') data = waterRows;
            if (category === 'fuel') data = fuelRows;
            if (category === 'waste') data = wasteRows;

            const keys = CATEGORY_KEYS[category] || [];

            const validData = data.filter(r => {
                return keys.some(k => Number(r[k]) > 0);
            });

            const months = validData.map(r => r.month);
            const localErrors = [...errors];

            if (validData.length === 0) {
                localErrors.push('No valid months detected. Completely empty parse or unrecognized structure.');
            }

            for (const r of validData) {
                for (const k of keys) {
                    if (Number(r[k]) < 0) {
                        localErrors.push(`Negative value detected in ${r.month}.`);
                    }
                }
            }

            setStats({ rows: validData.length, months });
            setParsedData(validData);
            setParseErrors(localErrors);

        } catch (err) {
            setParseErrors([`Unrecognized file structure: ${err.message}`]);
        }
    };

    const handleConfirm = async () => {
        if (!selectedFile) return;
        
        await handleFile(selectedFile, category);
        
        // Check if there are no hook upload errors after await
        // Since we can't reliably read uploadErrors immediately if handleFile handles it async,
        // we assume if it finishes without throwing, we can fetch latest.
        // Actually handleFile catches internally and sets uploadErrors.
        // So we might need to rely on the hook's state. But handleFile doesn't return success status.
        // Let's just fetch latest and if it succeeds, we call onUploadSuccess.
        try {
            const res = await assessmentApi.latest();
            if (res.data?.assessment) {
                onUploadSuccess?.(res.data.assessment);
                onClose();
            }
        } catch (err) {
            console.error('Failed to fetch updated assessment', err);
        }
    };

    const hasBlockingErrors = parseErrors.length > 0;
    const allErrors = [...parseErrors, ...uploadErrors];

    return (
        <Modal open={isOpen} onClose={uploading ? undefined : onClose} title={`Upload ${category} Data`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Upload Zone */}
                <div 
                    style={{
                        border: `2px dashed ${C.border}`,
                        borderRadius: 8,
                        padding: '30px 20px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        cursor: 'pointer'
                    }}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                    <div style={{ color: C.text, fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                        {selectedFile ? selectedFile.name : 'Drag and drop or click to browse'}
                    </div>
                    {!selectedFile && (
                        <div style={{ color: C.textMuted, fontSize: 14 }}>
                            Accepts .xlsx, .xls, .csv
                        </div>
                    )}
                </div>

                {/* Preview & Validation */}
                {selectedFile && parsedData.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8 }}>
                            <div style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                                {stats.rows} rows detected
                            </div>
                            <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>
                                Months found: {stats.months.join(', ')}
                            </div>
                            
                            {/* Preview Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: C.text }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Month</th>
                                            {CATEGORY_KEYS[category]?.map(k => (
                                                <th key={k} style={{ textAlign: 'right', padding: '4px 8px' }}>{k}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.slice(0, 3).map((row, i) => (
                                            <tr key={i} style={{ borderBottom: `1px solid ${C.border}40` }}>
                                                <td style={{ padding: '4px 8px' }}>{row.month}</td>
                                                {CATEGORY_KEYS[category]?.map(k => (
                                                    <td key={k} style={{ textAlign: 'right', padding: '4px 8px' }}>{row[k]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notices */}
                        {allErrors.length > 0 ? (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: 12, borderRadius: 4 }}>
                                {allErrors.map((err, i) => (
                                    <div key={i} style={{ color: '#ef4444', fontSize: 13, marginBottom: i === allErrors.length - 1 ? 0 : 4 }}>
                                        {err}
                                    </div>
                                ))}
                            </div>
                        ) : stats.rows < 12 ? (
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', padding: 12, borderRadius: 4 }}>
                                <div style={{ color: '#f59e0b', fontSize: 13 }}>
                                    {stats.rows} months detected. Annualization will be applied.
                                    Estimated annual = uploaded total ÷ months × 12
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: 12, borderRadius: 4 }}>
                                <div style={{ color: '#10b981', fontSize: 13 }}>
                                    12 rows detected. January through December. No errors found.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                    <button 
                        onClick={onClose}
                        disabled={uploading}
                        style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: `1px solid ${C.border}`,
                            color: C.text,
                            borderRadius: 6,
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            opacity: uploading ? 0.5 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedFile || hasBlockingErrors || uploading}
                        style={{
                            padding: '8px 16px',
                            background: C.primary,
                            border: 'none',
                            color: '#fff',
                            borderRadius: 6,
                            cursor: (!selectedFile || hasBlockingErrors || uploading) ? 'not-allowed' : 'pointer',
                            opacity: (!selectedFile || hasBlockingErrors || uploading) ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
