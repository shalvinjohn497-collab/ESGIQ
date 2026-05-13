import { useRef } from 'react';
import { C } from '@/theme/colors';
import { useFileUpload } from '@/modules/assessment/hooks/useFileUpload';
import useAssessmentStore from '@/modules/assessment/store/assessment.store';

export default function UploadCard({ cat, expanded, onToggle }) {
    const fileInputRef = useRef(null);
    const { handleFile, uploading } = useFileUpload();
    const uploadStatus = useAssessmentStore((s) => s.uploadStatus);

    const status = uploadStatus?.[cat.id];
    const monthsUploaded = status?.monthsUploaded ?? cat.months ?? 0;
    const total = cat.total ?? 12;
    const pct = total ? Math.round((monthsUploaded / total) * 100) : (cat.pct || 0);
    const done = monthsUploaded >= total && total > 0;
    const isExcel = status?.source === 'excel';

    function onFileChange(e) {
        const file = e.target.files?.[0];
        if (file) handleFile(file, cat.id);
        e.target.value = '';
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={onToggle}
                className={expanded ? 'card-highlight pointer' : 'card pointer'}
                style={expanded ? { borderColor: cat.c + '50', width: '100%' } : { width: '100%' }}
            >
                <div className="flex-col gap-2" style={{ textAlign: 'left' }}>
                    <div className="flex-between items-center">
                        <div className="flex items-center gap-2">
                            {cat.icon}
                            <span className="t-small t-bold t-text">{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {isExcel && <span className="t-micro" style={{ color: C.green, fontSize: 10 }}>EXCEL</span>}
                            {done && <span className="t-micro" style={{ color: C.green }}>✓</span>}
                        </div>
                    </div>
                    <div className="progress-track" style={{ height: 3 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: cat.c }} />
                    </div>
                    <div className="flex-between">
                        <span className="t-micro" style={{ color: 'var(--dim)' }}>
                            {total ? `${monthsUploaded}/${total} months` : cat.desc}
                        </span>
                        {uploading
                            ? <span className="t-micro" style={{ color: cat.c }}>Parsing...</span>
                            : (
                                <span
                                    className="t-micro"
                                    style={{ color: cat.c, cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                >
                                    Upload Excel
                                </span>
                            )}
                    </div>
                </div>
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={onFileChange}
            />
        </div>
    );
}
